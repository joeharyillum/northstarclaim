import { prisma } from './prisma';

/**
 * PHASE 40: AUTOMATED LEGAL GRIEVANCE ENGINE
 * 
 * Generates formal regulatory complaints for high-value "Whale" claims
 * that have reached a stalemate or encounter corporate delay tactics.
 */
export async function generateLegalGrievance(claimId: string, userId: string) {
    try {
        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
            include: {
                payer: true,
                batch: { include: { user: true } },
                appeal: true
            }
        });

        if (!claim) throw new Error("Claim not found.");
        if (!claim.payer) throw new Error("Payer information missing for grievance.");

        const clinicName = claim.batch.user.clinicName;
        const payerName = claim.payer.name;
        const billedAmount = claim.billedAmount.toLocaleString();
        const currentDate = new Date().toLocaleDateString();

        const grievanceTemplate = `
FORMAL REGULATORY GRIEVANCE
TO: State Department of Insurance / Consumer Protections Division
FROM: ${clinicName}
DATE: ${currentDate}
RE: Systematic Underpayment and Bad Faith Adjudication by ${payerName}
CLAIM ID: ${claim.id}
TOTAL DISPUTED AMOUNT: $${billedAmount}

To the Insurance Commissioner:

This complaint is filed as a formal grievance against ${payerName} regarding the bad faith adjudication of medical claim ${claim.id}. Despite the submission of comprehensive clinical documentation and a formal Level 1 Appeal citing CMS NCCI guidelines, ${payerName} continues to withhold payment without a legally valid clinical or contractual basis.

ADJUDICATION FAILURE:
The provider has documented that the procedure (CPT ${claim.cptCode}) was medically necessary and followed all standard of care protocols. ${payerName}'s continued denial constitutes an arbitrary and capricious practice designed to prioritize corporate liquidity over legally mandated reimbursement.

FEDERAL & STATE VIOLATIONS:
1. Violation of the Patient Protection and Affordable Care Act (ACA) Prompt Payment regulations.
2. Violation of ERISA fiduciary duties to process claims fairly and accurately (if applicable).
3. Systematic use of "Black Box" automated denial algorithms that fail to account for clinical specifics.

DEMAND FOR ACTION:
We request that the Department of Insurance initiate a formal audit of ${payerName}'s adjudication practices for this claim and issue a Notice of Non-Compliance. The provider seeks immediate payment of $${billedAmount} plus applicable state interest for delayed reimbursement.

Sincerely,

MediClaim AI Legal Orchestration Unit
On behalf of ${clinicName}
        `.trim();

        // Save grievance to the database (linked to physical dispatch for mailing)
        await prisma.physicalDispatch.create({
            data: {
                claimId,
                userId,
                method: 'MAIL', // Grievances are always mailed certified for legal standing
                recipientAddress: "State Department of Insurance - Regulatory Division",
                content: grievanceTemplate,
                status: 'PENDING'
            }
        });

        console.log(`[AGENT 41] Legal Grievance Orchestrated for Whale Claim: ${claim.id}`);
        return { success: true, grievance: grievanceTemplate };

    } catch (error: any) {
        console.error("[AGENT 41] Grievance Generation Error:", error.message);
        return { success: false, error: error.message };
    }
}
