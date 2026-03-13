import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { dispatchPhysicalAppeal } from '@/lib/fax-engine';
import { validateFinancialConsent } from '@/lib/security';
import { ConsensusEngine } from '@/lib/consensus-engine';
import { generateLegalGrievance } from '@/lib/legal-grievance';

export async function generateSecureAppeal(claimData: any, analysisResults: any) {
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const res = await fetch(`${appUrl}/api/generate-appeal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claimData, analysisResults })
        });

        if (!res.ok) {
            throw new Error(`Failed to generate appeal: ${res.statusText}`);
        }

        const data = await res.json();
        return { success: true, appealDraft: data.appealDraft };

    } catch (error: any) {
        console.error("Secure Appeal Generation Error:", error);
        return { success: false, error: error.message || "Failed to generate appeal" };
    }
}

export async function approveAppeal(claimId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.appeal.update({
            where: { claimId: claimId },
            data: { approvedByClinic: true }
        });

        await prisma.claim.update({
            where: { id: claimId },
            data: { status: "APPEALED" }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Approval Error:", error);
        return { success: false, error: error.message };
    }
}

export async function dispatchPhysical(claimId: string, method: 'FAX' | 'MAIL', recipientAddress: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // FINANCIAL SOVEREIGNTY LOCK: Only the founder can incur costs
        await validateFinancialConsent(session.user.id, `PHYSICAL_DISPATCH_${method}`);

        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
            include: { appeal: true }
        });

        if (!claim?.appeal) throw new Error("Appeal draft missing. Generate it first.");

        // PHASE 35 NEURAL HARDENING: Agent 41 Quorum Check
        const consensus = new ConsensusEngine();
        const quorum = consensus.generateNeuralQuorum('PHYSICAL_DISPATCH', claim.billedAmount);
        const validation = await consensus.validateDecision('PHYSICAL_DISPATCH', quorum, claimId, session.user.id);

        if (!validation.consensusReached) {
            throw new Error(`NEURAL BLOCK: Agent 41 refused to sign off on this dispatch. Consensus confidence: ${(validation.aggregateConfidence * 100).toFixed(1)}%. Low clinical validity reported by sub-agents.`);
        }

        const result = await dispatchPhysicalAppeal(
            session.user.id,
            claimId,
            claim.appeal.draftedLetter,
            method === 'FAX'
                ? { recipientName: "Insurance Payer", faxNumber: recipientAddress }
                : { recipientName: "Insurance Payer", streetAddress: recipientAddress }
        );

        if (result.success) {
            await prisma.claim.update({
                where: { id: claimId },
                data: { status: `PHYSICALLY_DISPATCHED_${method}` }
            });
        }

        return result;
    } catch (error: any) {
        console.error("Physical Dispatch Error:", error);
        return { success: false, error: error.message };
    }
}

export async function triggerGrievance(claimId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const result = await generateLegalGrievance(claimId, session.user.id);
        
        if (result.success) {
            await prisma.claim.update({
                where: { id: claimId },
                data: { status: "LEGAL_GRIEVANCE_FILED" }
            });
        }

        return result;
    } catch (error: any) {
        console.error("Grievance Trigger Error:", error);
        return { success: false, error: error.message };
    }
}
