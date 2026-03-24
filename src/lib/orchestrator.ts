import { prisma } from './prisma';
import { dispatchPhysicalAppeal } from './fax-engine';
import { triggerAutomatedDispatch } from './automated-dispatch';
import { ConsensusEngine } from './consensus-engine';
import { generateLegalGrievance } from './legal-grievance';

/**
 * MASTER ORCHESTRATOR: THE 'BEST ARMY' STRATEGY
 * 
 * Autonomously selects the most effective weapon for each claim.
 */
export async function deployBestArmy(claimId: string, userId: string, confidenceScore: number) {
    const LIVE_CALL_THRESHOLD = 5000; // Claims >$5k get live calls automatically
    const AUTO_THRESHOLD = 95;      // 95% Confidence required for zero-human mode

    try {
        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
            include: { payer: true, appeal: true }
        });

        if (!claim) throw new Error("Claim not found.");
        if (!claim.appeal) throw new Error("Appeal draft missing.");

        // 1. DETERMINE WEAPONRY
        const isHighValue = claim.billedAmount >= LIVE_CALL_THRESHOLD;
        const hasFax = !!claim.payer?.faxNumber;

        console.log(`[AGENT 41] Triage: Value=$${claim.billedAmount} | Confidence=${confidenceScore}% | Method=${isHighValue ? 'LIVE_CALL' : 'PHYSICAL'}`);

        // 2. EXECUTE STRATEGY
        if (isHighValue && confidenceScore >= AUTO_THRESHOLD) {
            // TRIGGER LIVE AI NEGOTIATION (Phase 30)
            console.log(`[AGENT 41] Deploying Live Neural Negotiator for high-value claim.`);

            // In a production environment, this would hit the Voice AI bridge (Vapi/Bland)
            // For now, we update status to queue it for the War Room.
            await prisma.claim.update({
                where: { id: claimId },
                data: { status: 'QUEUED_FOR_LIVE_NEGOTIATION' }
            });

            return { success: true, method: 'LIVE_CALL', message: "Queued for Autonomous War Room." };
        } else if (claim.billedAmount >= 100000 && confidenceScore < 90) {
            // PHASE 40: AUTOMATIC ESCALATION FOR WHALES
            console.log(`[AGENT 41] Whale Escalation: Low confidence for $100k+ claim. Filing Formal Grievance.`);
            return await generateLegalGrievance(claimId, userId);
        } else {
            // TRIGGER PHYSICAL DISPATCH (Phase 20)
            console.log(`[AGENT 41] Deploying Physical Paper Avalanche.`);
            return await triggerAutomatedDispatch(claimId, userId, confidenceScore);
        }

    } catch (error: any) {
        console.error("[AGENT 41] Orchestration Failure:", error.message);
        return { success: false, error: error.message };
    }
}
