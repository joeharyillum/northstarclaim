import { prisma } from './prisma';
import { dispatchPhysicalAppeal } from './fax-engine';
import { ConsensusEngine } from './consensus-engine';

/**
 * PHASE 20: ZERO-HUMAN DISPATCH TRIGGER
 * 
 * Automatically triggers physical dispatch if AI confidence exceeds the Zero-Human Threshold.
 */
export async function triggerAutomatedDispatch(claimId: string, userId: string, confidenceScore: number) {
    const AUTO_THRESHOLD = 95; // 95% Confidence required for zero-human dispatch

    if (confidenceScore < AUTO_THRESHOLD) {
        console.log(`[AGENT 41] Automation Bypass: Confidence ${confidenceScore}% below threshold.`);
        return { success: false, reason: "THRESHOLD_NOT_MET" };
    }

    try {
        // 1. Fetch Claim and Payer Data
        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
            include: {
                payer: true,
                appeal: true
            }
        });

        if (!claim) throw new Error("Claim not found.");
        if (!claim.appeal) throw new Error("No appeal draft found for automated dispatch.");

        // 2. Multi-Agent Consensus Check (Agent 41 sign-off)
        const consensus = new ConsensusEngine();
        const quorum = consensus.generateNeuralQuorum('AUTOMATED_DISPATCH', claim.billedAmount);
        const validation = await consensus.validateDecision('AUTOMATED_DISPATCH', quorum, claimId, userId);

        if (!validation.consensusReached) {
            console.warn(`[AGENT 41] Automated Dispatch Blocked: Consensus not reached (${(validation.aggregateConfidence * 100).toFixed(1)}%).`);
            return { success: false, reason: "CONSENSUS_FAILED" };
        }

        // 3. Determine Routing (Fax vs Mail)
        const payer = claim.payer;
        const method = (payer?.faxNumber) ? 'FAX' : 'MAIL';

        const dispatchOptions = method === 'FAX'
            ? { recipientName: payer?.name || "Insurance Payer", faxNumber: payer?.faxNumber! }
            : {
                recipientName: payer?.name || "Insurance Payer",
                streetAddress: payer?.streetAddress!,
                city: payer?.city!,
                state: payer?.state!,
                zip: payer?.zip!
            };

        // 4. Fire Dispatch
        const result = await dispatchPhysicalAppeal(
            userId,
            claimId,
            claim.appeal.draftedLetter,
            dispatchOptions as any
        );

        if (result.success) {
            await prisma.claim.update({
                where: { id: claimId },
                data: { status: `AUTO_DISPATCHED_${method}` }
            });
        }

        return result;

    } catch (error: any) {
        console.error("[AGENT 41] Automated Dispatch Error:", error);
        return { success: false, error: error.message };
    }
}
