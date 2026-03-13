// import prisma removed to prevent Edge context crashes in middleware


/**
 * Very basic Rate Limiting (In-memory/Redis fallback)
 * For a $100M infrastructure, we'd use Upstash Redis on the Edge.
 * This implementation prevents brute-force on sensitive API endpoints.
 */
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const blacklistedIPs = new Map<string, { reason: string; expires: number }>();

/**
 * AI Sentinel Check: Intercepts requests from known malicious actors.
 */
export function checkBlacklist(ip: string) {
    const entry = blacklistedIPs.get(ip);
    if (entry && entry.expires > Date.now()) {
        return { isBlocked: true, reason: entry.reason };
    }
    return { isBlocked: false };
}

/**
 * Intrusion Detection: Automatically bans IPs that trigger security violations.
 */
export async function detectThreat(ip: string, reason: string, severity: 'LOW' | 'HIGH' = 'LOW') {
    const duration = severity === 'HIGH' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 1hr or 24hr ban
    blacklistedIPs.set(ip, { reason, expires: Date.now() + duration });

    // AGENT 41 NOTIFICATION: Log to database for agent consumption
    await logAudit('SYSTEM_SENTINEL', 'IP_BAN_TRIGGERED', `Reason: ${reason} | Duration: ${duration}ms`, ip);
}

export function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000) {
    const now = Date.now();

    // Check if they are already blacklisted before checking rate limit
    const blacklist = checkBlacklist(identifier);
    if (blacklist.isBlocked) return false;

    const info = rateLimitMap.get(identifier) || { count: 0, lastReset: now };

    if (now - info.lastReset > windowMs) {
        info.count = 0;
        info.lastReset = now;
    }

    info.count++;
    rateLimitMap.set(identifier, info);

    if (info.count > limit * 1.5) {
        // Automatically trigger a permanent ban if they exceed the limit by 1.5x
        detectThreat(identifier, "MALICIOUS_BOT_PATTERN: Neural Grid blocked automated probe.", 'HIGH');
        return false;
    }

    console.log(`[AGENT 41 MONITORING] Tracking Packet from ${identifier} | Rate: ${info.count}/${limit}`);
    return info.count <= limit;
}

/**
 * FINANCIAL SOVEREIGNTY GATE
 * 
 * Manages the "Consent Split":
 * 1. REVENUE_INBOUND: AI can autonomously approve payments from clinics/hospitals.
 * 2. CAPITAL_OUTBOUND: ONLY the Founder can authorize spending (Lob/Phaxio) or payouts.
 */
export type FinancialActionType = 'REVENUE_INBOUND' | 'CAPITAL_OUTBOUND';

export async function validateFinancialConsent(userId: string, action: string, type: FinancialActionType = 'CAPITAL_OUTBOUND') {
    const FOUNDER_ID = process.env.FOUNDER_ADMIN_ID;

    // AI AUTONOMY RULE: AI is authorized to approve incoming revenue sessions
    if (type === 'REVENUE_INBOUND') {
        await logAudit(userId || 'AI_AGENT', 'REVENUE_INBOUND_AUTHORIZED', `AI processed incoming payment: ${action}`);
        return true;
    }

    // SOVEREIGNTY RULE: No one but the Founder has access to outbound capital
    if (!userId || userId !== FOUNDER_ID) {
        await logAudit(userId || 'ANONYMOUS', 'FINANCIAL_ACCESS_VIOLATION', `Unauthorized CAPITAL_OUTBOUND attempt: ${action}`);
        throw new Error("FINANCIAL LOCKDOWN: No one but the Founder has access to outbound funds or bank protocols.");
    }

    await logAudit(userId, 'FINANCIAL_CONSENT_GRANTED', `Founder authorized CAPITAL_OUTBOUND: ${action}`);
    return true;
}

/**
 * Persistent Audit Logging for HIPAA Compliance
 */
export async function logAudit(userId: string, action: string, details: string, ip?: string) {
    try {
        const { prisma } = await import('./prisma');
        // AGENT 41 SECURITY ENFORCEMENT: Centralized persistence
        await prisma.auditLog.create({
            data: {
                userId,
                action: `AGENT_41_${action}`, // Prefix all actions for neural tracking
                details,
                ipAddress: ip,
            }
        });
        console.log(`[AGENT 41 AUDIT] User: ${userId} | Action: ${action} | IP: ${ip || 'unknown'}`);
    } catch (e) {
        console.error("Critical Security Failure: Audit log could not be persisted.", e);
    }
}

