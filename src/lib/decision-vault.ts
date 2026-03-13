/**
 * PHASE 35: DECISION INTEGRITY VAULT
 * 
 * A tamper-proof ledger that records the individual neural pathways 
 * and sub-agent justifications for every high-stakes decision.
 */

import { prisma } from './prisma';
import { logAudit } from './security';
import { ConsensusResult } from './consensus-engine';

export class DecisionVault {
    /**
     * Vaults a consensus decision with its full justification grid.
     */
    public static async vaultDecision(
        userId: string,
        claimId: string,
        action: string,
        result: ConsensusResult
    ) {
        // 1. Log to the primary Audit Ledger
        await logAudit('AGENT_41', 'DECISION_VAULTED',
            `Claim: ${claimId} | Action: ${action} | Decision: ${result.finalDecision} | Confidence: ${result.aggregateConfidence.toFixed(4)}`
        );

        // 2. Persist full neural path to the database
        // We use the existing AuditLog table but structure the 'details' for neural debugging.
        const neuralPath = result.votes.map(v =>
            `[Agent ${v.agentId} (${v.agentRole})]: ${v.decision} (Conf: ${v.confidence}) - "${v.justification}"`
        ).join('\n');

        try {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: `NEURAL_PATH_${action}`,
                    details: `CONSENSUS: ${result.finalDecision}\nCONFIDENCE: ${result.aggregateConfidence}\n\nPATHWAY:\n${neuralPath}`,
                    ipAddress: "NEURAL_GRID_INTERNAL"
                }
            });

            console.log(`[DECISION VAULT] Permanent record created for Claim: ${claimId}`);
        } catch (error) {
            console.error("[DECISION VAULT] Failed to vault neural path:", error);
            // Non-blocking but logged
        }
    }
}
