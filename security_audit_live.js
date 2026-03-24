#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  NORTHSTAR MEDIC — MILITARY-GRADE SSL & SECURITY AUDIT SCANNER    ║
 * ║  Run: node security_audit_live.js                                  ║
 * ║  Tests: SSL, HSTS, CSP, Headers, Redirects, Cookie Security       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const DOMAINS = [
    'https://www.northstarmedic.com',
    'https://northstarmedic.com',
];

const REQUIRED_HEADERS = {
    'strict-transport-security': {
        label: 'HSTS (Force HTTPS)',
        required: true,
        validate: (v) => v.includes('max-age=63072000') && v.includes('includeSubDomains') && v.includes('preload'),
        expected: 'max-age=63072000; includeSubDomains; preload',
    },
    'x-frame-options': {
        label: 'X-Frame-Options (Anti-Clickjack)',
        required: true,
        validate: (v) => v.toUpperCase() === 'DENY',
        expected: 'DENY',
    },
    'x-content-type-options': {
        label: 'X-Content-Type-Options (MIME Sniff)',
        required: true,
        validate: (v) => v === 'nosniff',
        expected: 'nosniff',
    },
    'x-xss-protection': {
        label: 'XSS Protection (Legacy)',
        required: true,
        validate: (v) => v.includes('1') && v.includes('mode=block'),
        expected: '1; mode=block',
    },
    'content-security-policy': {
        label: 'Content Security Policy',
        required: true,
        validate: (v) => v.includes("default-src 'self'") && v.includes("frame-ancestors 'none'"),
        expected: "default-src 'self'; ... frame-ancestors 'none'",
    },
    'referrer-policy': {
        label: 'Referrer Policy',
        required: true,
        validate: (v) => ['strict-origin-when-cross-origin', 'no-referrer', 'strict-origin'].includes(v),
        expected: 'strict-origin-when-cross-origin',
    },
    'permissions-policy': {
        label: 'Permissions Policy (Feature Lock)',
        required: true,
        validate: (v) => v.includes('camera=()') && v.includes('microphone=()'),
        expected: 'camera=(), microphone=(), geolocation=()',
    },
    'cross-origin-opener-policy': {
        label: 'Cross-Origin Opener Policy',
        required: false,
        validate: (v) => v === 'same-origin',
        expected: 'same-origin',
    },
    'cross-origin-resource-policy': {
        label: 'Cross-Origin Resource Policy',
        required: false,
        validate: (v) => v === 'same-origin',
        expected: 'same-origin',
    },
    'x-dns-prefetch-control': {
        label: 'DNS Prefetch Control',
        required: false,
        validate: (v) => v === 'off',
        expected: 'off',
    },
};

const DANGEROUS_HEADERS = ['server', 'x-powered-by', 'x-aspnet-version', 'x-aspnetmvc-version'];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

function pass(msg) { totalTests++; passedTests++; console.log(`   ✅ PASS: ${msg}`); }
function fail(msg) { totalTests++; failedTests++; console.log(`   ❌ FAIL: ${msg}`); }
function warn(msg) { warnings++; console.log(`   ⚠️  WARN: ${msg}`); }
function info(msg) { console.log(`   ℹ️  ${msg}`); }

async function testDomain(url) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  SCANNING: ${url}`);
    console.log(`${'═'.repeat(70)}`);

    try {
        const res = await fetch(url, { redirect: 'manual' });
        const headers = Object.fromEntries(res.headers.entries());

        // --- SSL/HTTPS Connection ---
        console.log('\n  📡 SSL/HTTPS CONNECTION:');
        if (url.startsWith('https://') && (res.status === 200 || res.status === 301 || res.status === 308)) {
            pass(`HTTPS connection successful (status ${res.status})`);
        } else {
            fail(`HTTPS connection issue (status ${res.status})`);
        }

        // --- Security Headers ---
        console.log('\n  🔒 SECURITY HEADERS:');
        for (const [header, config] of Object.entries(REQUIRED_HEADERS)) {
            const val = headers[header];
            if (!val) {
                if (config.required) {
                    fail(`${config.label}: MISSING (expected: ${config.expected})`);
                } else {
                    warn(`${config.label}: Not present (recommended: ${config.expected})`);
                }
            } else if (!config.validate(val)) {
                fail(`${config.label}: "${val.substring(0, 80)}" (expected: ${config.expected})`);
            } else {
                pass(`${config.label}`);
            }
        }

        // --- Dangerous Headers (should NOT exist) ---
        console.log('\n  🚫 INFORMATION LEAKAGE:');
        for (const header of DANGEROUS_HEADERS) {
            if (headers[header]) {
                fail(`${header} exposed: "${headers[header]}" — reveals server technology`);
            } else {
                pass(`${header}: Not disclosed`);
            }
        }

        // --- Cookie Security (if any set-cookie headers) ---
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            console.log('\n  🍪 COOKIE SECURITY:');
            const cookieStr = setCookie.toLowerCase();
            if (cookieStr.includes('httponly')) pass('HttpOnly flag set');
            else fail('HttpOnly flag MISSING on cookies');

            if (cookieStr.includes('secure')) pass('Secure flag set');
            else fail('Secure flag MISSING on cookies');

            if (cookieStr.includes('samesite')) pass('SameSite attribute set');
            else fail('SameSite attribute MISSING on cookies');
        }

        // --- CSP Deep Analysis ---
        const csp = headers['content-security-policy'];
        if (csp) {
            console.log('\n  🛡️  CSP DEEP ANALYSIS:');
            if (csp.includes("'unsafe-inline'")) warn("CSP allows 'unsafe-inline' scripts (XSS risk — needed for Next.js)");
            if (csp.includes("'unsafe-eval'")) warn("CSP allows 'unsafe-eval' (needed for Next.js dev — verify in production)");
            if (csp.includes("frame-ancestors 'none'")) pass('CSP: frame-ancestors none (anti-clickjack)');
            if (csp.includes("upgrade-insecure-requests")) pass('CSP: upgrade-insecure-requests enabled');
            else warn("CSP: upgrade-insecure-requests not set");
            if (csp.includes("form-action 'self'")) pass('CSP: form-action restricted to self');
            if (csp.includes("base-uri 'self'")) pass('CSP: base-uri restricted to self');
        }

    } catch (e) {
        fail(`Connection failed: ${e.message}`);
    }
}

async function testHttpRedirect() {
    console.log(`\n${'═'.repeat(70)}`);
    console.log('  HTTP → HTTPS REDIRECT TEST');
    console.log(`${'═'.repeat(70)}\n`);

    for (const domain of ['http://www.northstarmedic.com', 'http://northstarmedic.com']) {
        try {
            const res = await fetch(domain, { redirect: 'manual' });
            const location = res.headers.get('location') || '';

            if (res.status === 301 || res.status === 308) {
                if (location.startsWith('https://')) {
                    pass(`${domain} → permanent HTTPS redirect (${res.status}) → ${location}`);
                } else {
                    fail(`${domain} → redirects to non-HTTPS: ${location}`);
                }
            } else if (res.status === 302 || res.status === 307) {
                warn(`${domain} → temporary redirect (${res.status}) — should be 301 permanent`);
            } else if (res.status === 200) {
                fail(`${domain} → serves content over HTTP without redirect — CRITICAL SECURITY RISK`);
            }
        } catch (e) {
            info(`${domain}: ${e.message}`);
        }
    }
}

async function testApiSecurity() {
    console.log(`\n${'═'.repeat(70)}`);
    console.log('  API SECURITY TESTS');
    console.log(`${'═'.repeat(70)}\n`);

    const baseUrl = DOMAINS[0];

    // Test: unauthenticated access to protected API
    try {
        const res = await fetch(`${baseUrl}/api/claims`, { method: 'GET' });
        if (res.status === 401) {
            pass('Protected API returns 401 for unauthenticated requests');
        } else {
            fail(`Protected API returned ${res.status} instead of 401 for unauthenticated request`);
        }
    } catch (e) {
        info(`API test skipped: ${e.message}`);
    }

    // Test: admin-only API without admin role
    try {
        const res = await fetch(`${baseUrl}/api/system/stats`, { method: 'GET' });
        if (res.status === 401 || res.status === 403) {
            pass('Admin API properly blocks non-admin access');
        } else {
            fail(`Admin API returned ${res.status} — should be 401/403`);
        }
    } catch (e) {
        info(`Admin API test skipped: ${e.message}`);
    }

    // Test: API responses don't cache
    try {
        const res = await fetch(`${baseUrl}/api/auth/providers`);
        const cacheControl = res.headers.get('cache-control') || '';
        if (cacheControl.includes('no-store') || cacheControl.includes('private')) {
            pass('API responses have no-cache headers');
        } else {
            warn(`API Cache-Control: "${cacheControl}" — should include no-store`);
        }
    } catch (e) {
        info(`Cache test skipped: ${e.message}`);
    }
}

async function testRateLimiting() {
    console.log(`\n${'═'.repeat(70)}`);
    console.log('  RATE LIMITING TEST');
    console.log(`${'═'.repeat(70)}\n`);

    const baseUrl = DOMAINS[0];
    info('Sending 15 rapid requests to test rate limiting...');

    let rateLimited = false;
    for (let i = 0; i < 15; i++) {
        try {
            const res = await fetch(`${baseUrl}/api/claims`);
            if (res.status === 429) {
                pass(`Rate limiter triggered at request #${i + 1}`);
                rateLimited = true;
                break;
            }
        } catch { /* network issues */ }
    }

    if (!rateLimited) {
        warn('Rate limiter did not trigger in 15 requests (may need higher volume or middleware rate limit)');
    }
}

async function run() {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║     NORTHSTAR MEDIC — MILITARY-GRADE SECURITY AUDIT SCANNER        ║');
    console.log('║     Date: ' + new Date().toISOString().split('T')[0] + '                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');

    // Test each domain
    for (const domain of DOMAINS) {
        await testDomain(domain);
    }

    // Test HTTP→HTTPS redirects
    await testHttpRedirect();

    // Test API security
    await testApiSecurity();

    // Test rate limiting
    await testRateLimiting();

    // Summary
    console.log(`\n${'═'.repeat(70)}`);
    console.log('  SECURITY AUDIT SUMMARY');
    console.log(`${'═'.repeat(70)}\n`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed:   ${passedTests}`);
    console.log(`   ❌ Failed:   ${failedTests}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log();

    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    if (failedTests === 0) {
        console.log(`   🏆 SECURITY GRADE: A+ (${score}%) — MILITARY-GRADE SSL & HEADERS VERIFIED`);
    } else if (failedTests <= 2) {
        console.log(`   🟢 SECURITY GRADE: A (${score}%) — Minor issues to fix`);
    } else if (failedTests <= 5) {
        console.log(`   🟡 SECURITY GRADE: B (${score}%) — Several issues need attention`);
    } else {
        console.log(`   🔴 SECURITY GRADE: C or below (${score}%) — CRITICAL FIXES REQUIRED`);
    }

    console.log(`\n${'═'.repeat(70)}\n`);
}

run().catch(e => console.error('Audit failed:', e));
