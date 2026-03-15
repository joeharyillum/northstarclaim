// ═══════════════════════════════════════════════════════════════════════════
// NORTHSTAR MEDIC — MILITARY-GRADE SECURITY MODULE
// Handles: Rate Limiting, IP Banning, Login Protection, Financial Gates,
//          HIPAA Audit Logging, Input Sanitization, Password Policy
// ═══════════════════════════════════════════════════════════════════════════

// --- Rate Limiting (sliding window, per-IP) ---
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const blacklistedIPs = new Map<string, { reason: string; expires: number }>();

// --- Login brute-force protection ---
const loginAttemptMap = new Map<string, { failures: number; lockedUntil: number }>();

// --- Periodic cleanup to prevent memory leaks (every 10 minutes) ---
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, val] of rateLimitMap) {
        if (now - val.lastReset > 300000) rateLimitMap.delete(key);
    }
    for (const [key, val] of blacklistedIPs) {
        if (val.expires <= now) blacklistedIPs.delete(key);
    }
    for (const [key, val] of loginAttemptMap) {
        if (val.lockedUntil <= now && val.failures === 0) loginAttemptMap.delete(key);
    }
}

/**
 * IP Blacklist Check — blocks known malicious IPs
 */
export function checkBlacklist(ip: string) {
    cleanupExpiredEntries();
    const entry = blacklistedIPs.get(ip);
    if (entry && entry.expires > Date.now()) {
        return { isBlocked: true, reason: entry.reason };
    }
    if (entry && entry.expires <= Date.now()) {
        blacklistedIPs.delete(ip);
    }
    return { isBlocked: false };
}

/**
 * Threat Detection — auto-bans IPs on security violations
 * LOW = 1 hour ban, MEDIUM = 6 hour ban, HIGH = 24 hour ban, CRITICAL = 72 hour ban
 */
export async function detectThreat(
    ip: string,
    reason: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'
) {
    const durations = {
        LOW: 1 * 60 * 60 * 1000,
        MEDIUM: 6 * 60 * 60 * 1000,
        HIGH: 24 * 60 * 60 * 1000,
        CRITICAL: 72 * 60 * 60 * 1000,
    };
    const duration = durations[severity];
    blacklistedIPs.set(ip, { reason, expires: Date.now() + duration });
    await logAudit('SYSTEM_SENTINEL', 'IP_BAN_TRIGGERED', `Severity: ${severity} | Reason: ${reason} | Duration: ${duration / 3600000}h`, ip);
}

/**
 * Rate Limiter — sliding window counter per identifier
 * Returns false if rate limit exceeded (caller should return 429)
 */
export function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000) {
    const now = Date.now();

    const blacklist = checkBlacklist(identifier);
    if (blacklist.isBlocked) return false;

    const info = rateLimitMap.get(identifier) || { count: 0, lastReset: now };

    if (now - info.lastReset > windowMs) {
        info.count = 0;
        info.lastReset = now;
    }

    info.count++;
    rateLimitMap.set(identifier, info);

    // Auto-ban at 2x limit (aggressive for financial/medical platform)
    if (info.count > limit * 2) {
        detectThreat(identifier, `Rate limit exceeded: ${info.count}/${limit} in ${windowMs}ms`, 'HIGH');
        return false;
    }

    return info.count <= limit;
}

/**
 * Login Brute-Force Protection
 * - 5 failed attempts → 15 minute lockout
 * - 10 failed attempts → 1 hour lockout
 * - 20 failed attempts → 24 hour IP ban
 */
export function checkLoginAllowed(ip: string): { allowed: boolean; remainingLockout?: number } {
    const now = Date.now();
    const entry = loginAttemptMap.get(ip);

    if (!entry) return { allowed: true };

    if (entry.lockedUntil > now) {
        return { allowed: false, remainingLockout: Math.ceil((entry.lockedUntil - now) / 1000) };
    }

    return { allowed: true };
}

export async function recordLoginFailure(ip: string, email: string) {
    const now = Date.now();
    const entry = loginAttemptMap.get(ip) || { failures: 0, lockedUntil: 0 };

    entry.failures++;

    if (entry.failures >= 20) {
        entry.lockedUntil = now + 24 * 60 * 60 * 1000;
        detectThreat(ip, `Brute-force attack: 20+ login failures for ${email}`, 'CRITICAL');
    } else if (entry.failures >= 10) {
        entry.lockedUntil = now + 60 * 60 * 1000;
        await logAudit('SYSTEM_SENTINEL', 'LOGIN_LOCKOUT_1HR', `IP: ${ip} | Email: ${email} | Failures: ${entry.failures}`, ip);
    } else if (entry.failures >= 5) {
        entry.lockedUntil = now + 15 * 60 * 1000;
        await logAudit('SYSTEM_SENTINEL', 'LOGIN_LOCKOUT_15MIN', `IP: ${ip} | Email: ${email} | Failures: ${entry.failures}`, ip);
    }

    loginAttemptMap.set(ip, entry);
}

export function clearLoginFailures(ip: string) {
    loginAttemptMap.delete(ip);
}

/**
 * Password Strength Validator — enforced at registration and password change
 * Requirements: 12+ chars, uppercase, lowercase, number, special character
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof password !== 'string') return { valid: false, errors: ['Password is required'] };
    if (password.length < 12) errors.push('Password must be at least 12 characters');
    if (password.length > 128) errors.push('Password must be under 128 characters');
    if (!/[A-Z]/.test(password)) errors.push('Must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Must contain at least one number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Must contain at least one special character');

    // Block common weak patterns
    const commonPasswords = ['password', '12345678', 'qwerty', 'letmein', 'admin', 'welcome'];
    if (commonPasswords.some(p => password.toLowerCase().includes(p))) {
        errors.push('Password contains a common weak pattern');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Input Sanitizer — strips potentially dangerous characters from user inputs
 * Use at system boundaries (form inputs, API params) to prevent injection
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, ''); // Strip HTML angle brackets
}

/**
 * Secure IP Extraction — handles proxy chains properly
 * Uses only the first IP in x-forwarded-for chain (client IP)
 */
export function getClientIp(req: Request): string {
    const cfIp = req.headers.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();

    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        const firstIp = forwarded.split(',')[0].trim();
        if (firstIp && firstIp !== 'unknown') return firstIp;
    }

    return 'unknown';
}

// ═══════════════════════════════════════════════════════════════════
// FINANCIAL SOVEREIGNTY GATE
// ═══════════════════════════════════════════════════════════════════

export type FinancialActionType = 'REVENUE_INBOUND' | 'CAPITAL_OUTBOUND';

export async function validateFinancialConsent(userId: string, action: string, type: FinancialActionType = 'CAPITAL_OUTBOUND') {
    const FOUNDER_ID = process.env.FOUNDER_ADMIN_ID;

    if (type === 'REVENUE_INBOUND') {
        await logAudit(userId || 'AI_AGENT', 'REVENUE_INBOUND_AUTHORIZED', `AI processed incoming payment: ${action}`);
        return true;
    }

    if (!userId || userId !== FOUNDER_ID) {
        await logAudit(userId || 'ANONYMOUS', 'FINANCIAL_ACCESS_VIOLATION', `Unauthorized CAPITAL_OUTBOUND attempt: ${action}`);
        throw new Error("FINANCIAL LOCKDOWN: No one but the Founder has access to outbound funds or bank protocols.");
    }

    await logAudit(userId, 'FINANCIAL_CONSENT_GRANTED', `Founder authorized CAPITAL_OUTBOUND: ${action}`);
    return true;
}

// ═══════════════════════════════════════════════════════════════════
// HIPAA AUDIT LOGGING
// ═══════════════════════════════════════════════════════════════════

export async function logAudit(userId: string, action: string, details: string, ip?: string) {
    try {
        const { prisma } = await import('./prisma');
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                details,
                ipAddress: ip,
            }
        });
    } catch (e) {
        // Fallback: ensure audit trail is never silently lost
        console.error(`[SECURITY AUDIT FAILURE] User: ${userId} | Action: ${action} | Details: ${details} | IP: ${ip || 'unknown'}`, e);
    }
}

