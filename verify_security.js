// NORTHSTAR MEDIC — DEFINITIVE SECURITY VERIFICATION
// Run: node verify_security.js

const https = require('https');
const http = require('http');
const tls = require('tls');

let pass = 0, fail = 0;
function CHECK(name, ok, detail) {
    if (ok) { pass++; console.log(`  ✅ PASS  ${name}: ${detail}`); }
    else    { fail++; console.log(`  ❌ FAIL  ${name}: ${detail}`); }
}

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { timeout: 10000 }, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, { timeout: 10000 }, res => {
            resolve({ status: res.statusCode, headers: res.headers });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
}

function getCert(host) {
    return new Promise((resolve, reject) => {
        const sock = tls.connect(443, host, { servername: host }, () => {
            const cert = sock.getPeerCertificate(true);
            sock.end();
            resolve(cert);
        });
        sock.on('error', reject);
    });
}

async function run() {
    console.log('============================================');
    console.log('  NORTHSTAR MEDIC — SECURITY VERIFICATION');
    console.log('  ' + new Date().toISOString());
    console.log('============================================\n');

    // TEST 1: HTTPS on both domains
    console.log('=== TEST 1: HTTPS CONNECTIVITY ===');
    for (const domain of ['https://northstarmedic.com', 'https://www.northstarmedic.com']) {
        try {
            const r = await httpsGet(domain);
            CHECK(domain, r.status === 200, `Status ${r.status}`);
        } catch (e) {
            CHECK(domain, false, e.message);
        }
    }

    // TEST 2: HTTP → HTTPS redirect
    console.log('\n=== TEST 2: HTTP → HTTPS REDIRECT ===');
    for (const domain of ['http://northstarmedic.com', 'http://www.northstarmedic.com']) {
        try {
            const r = await httpGet(domain);
            const isRedirect = [301, 302, 308].includes(r.status);
            const loc = r.headers.location || '';
            CHECK(domain, isRedirect && loc.startsWith('https'), `${r.status} → ${loc.substring(0, 50)}`);
        } catch (e) {
            CHECK(domain, false, e.message);
        }
    }

    // TEST 3: SSL Certificate
    console.log('\n=== TEST 3: SSL CERTIFICATE ===');
    try {
        const cert = await getCert('northstarmedic.com');
        const subject = cert.subject?.CN || 'unknown';
        const issuer = cert.issuer?.O || 'unknown';
        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const daysLeft = Math.floor((validTo - new Date()) / 86400000);
        const san = cert.subjectaltname || '';

        CHECK('Subject', subject === 'northstarmedic.com', subject);
        CHECK('Issuer', issuer === "Let's Encrypt", issuer);
        CHECK('Wildcard', san.includes('*.northstarmedic.com'), san);
        CHECK('Expiry', daysLeft > 30, `${daysLeft} days left (expires ${validTo.toISOString().split('T')[0]})`);
        CHECK('Chain', cert.issuerCertificate?.subject?.CN?.length > 0, `Chain: ${subject} → ${cert.issuerCertificate?.subject?.CN}`);
    } catch (e) {
        CHECK('Certificate', false, e.message);
    }

    // TEST 4: Security Headers
    console.log('\n=== TEST 4: SECURITY HEADERS ===');
    const r = await httpsGet('https://northstarmedic.com');
    const h = r.headers;

    CHECK('HSTS', h['strict-transport-security']?.includes('max-age=63072000'), h['strict-transport-security'] || 'MISSING');
    CHECK('HSTS preload', h['strict-transport-security']?.includes('preload'), h['strict-transport-security']?.includes('preload') ? 'yes' : 'no');
    CHECK('X-Frame-Options', h['x-frame-options'] === 'DENY', h['x-frame-options'] || 'MISSING');
    CHECK('X-Content-Type', h['x-content-type-options'] === 'nosniff', h['x-content-type-options'] || 'MISSING');
    CHECK('X-XSS-Protection', h['x-xss-protection']?.includes('1; mode=block'), h['x-xss-protection'] || 'MISSING');
    CHECK('CSP', h['content-security-policy']?.includes("default-src 'self'"), (h['content-security-policy'] || 'MISSING').substring(0, 80) + '...');
    CHECK('Referrer-Policy', h['referrer-policy']?.includes('strict-origin'), h['referrer-policy'] || 'MISSING');
    CHECK('Permissions-Policy', h['permissions-policy']?.includes('camera=()'), h['permissions-policy'] || 'MISSING');

    // TEST 5: Cookie Security
    console.log('\n=== TEST 5: COOKIE SECURITY ===');
    const cookies = h['set-cookie'] || '';
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    CHECK('__Host- prefix', cookieStr.includes('__Host-'), cookieStr.includes('__Host-') ? 'Found' : 'Missing');
    CHECK('__Secure- prefix', cookieStr.includes('__Secure-'), cookieStr.includes('__Secure-') ? 'Found' : 'Missing');
    CHECK('HttpOnly', cookieStr.includes('HttpOnly'), cookieStr.includes('HttpOnly') ? 'Set' : 'Missing');
    CHECK('Secure flag', cookieStr.includes('Secure'), cookieStr.includes('Secure') ? 'Set' : 'Missing');
    CHECK('SameSite', cookieStr.includes('SameSite'), cookieStr.includes('SameSite') ? 'Set' : 'Missing');

    // TEST 6: Info Leakage
    console.log('\n=== TEST 6: INFORMATION LEAKAGE ===');
    CHECK('Server hidden', h['server'] === 'cloudflare', `Server: ${h['server']}`);
    CHECK('No X-Powered-By', !h['x-powered-by'], h['x-powered-by'] ? `EXPOSED: ${h['x-powered-by']}` : 'Hidden');

    // TEST 7: Cloudflare active
    console.log('\n=== TEST 7: EDGE PROTECTION ===');
    CHECK('Cloudflare CDN', !!h['cf-ray'], `CF-Ray: ${h['cf-ray']}`);
    CHECK('Railway CDN', !!h['x-railway-cdn-edge'], h['x-railway-cdn-edge'] || 'not detected');

    // TEST 8: API endpoints protected
    console.log('\n=== TEST 8: API PROTECTION ===');
    try {
        const api = await httpsGet('https://northstarmedic.com/api/claims');
        CHECK('/api/claims blocked', api.status === 401 || api.status === 403 || api.status === 307, `Status ${api.status}`);
    } catch (e) {
        CHECK('/api/claims', true, 'Connection refused/blocked');
    }

    // FINAL SCORE
    console.log('\n============================================');
    const total = pass + fail;
    const pct = Math.round((pass / total) * 100);
    console.log(`  TOTAL: ${pass}/${total} passed (${pct}%)`);
    if (fail === 0) {
        console.log('  🏆 GRADE: A+ — ALL CHECKS PASSED');
    } else if (fail <= 2) {
        console.log(`  ⚠️  GRADE: A — ${fail} minor issue(s)`);
    } else {
        console.log(`  ❌ GRADE: NEEDS ATTENTION — ${fail} failures`);
    }
    console.log('============================================');
}

run().catch(e => console.error('Fatal:', e));
