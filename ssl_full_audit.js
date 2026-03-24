#!/usr/bin/env node

const https = require('https');
const http = require('http');
const tls = require('tls');
const dns = require('dns').promises;

async function checkCert(hostname) {
    return new Promise((resolve, reject) => {
        const options = { host: hostname, port: 443, rejectUnauthorized: false, servername: hostname };
        const socket = tls.connect(options, () => {
            const cert = socket.getPeerCertificate(true);
            const authorized = socket.authorized;
            const protocol = socket.getProtocol();
            const cipher = socket.getCipher();
            socket.end();
            resolve({ cert, authorized, protocol, cipher });
        });
        socket.on('error', reject);
        socket.setTimeout(10000, () => { socket.destroy(); reject(new Error('Timeout')); });
    });
}

async function checkRedirect(url) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, { headers: { 'User-Agent': 'NorthStar-SSL-Audit/1.0' }, rejectUnauthorized: false }, (res) => {
            resolve({ status: res.statusCode, location: res.headers.location, headers: res.headers });
            res.resume();
        });
        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

async function main() {
    console.log('\n🔒 COMPLETE SSL/SECURITY AUDIT — northstarmedic.com');
    console.log('='.repeat(60));

    // 1. SSL Certificate on www
    console.log('\n1️⃣  SSL CERTIFICATE: www.northstarmedic.com');
    console.log('-'.repeat(60));
    try {
        const { cert, authorized, protocol, cipher } = await checkCert('www.northstarmedic.com');
        console.log('   Subject:      ' + cert.subject.CN);
        console.log('   Issuer:       ' + cert.issuer.CN + ' (' + cert.issuer.O + ')');
        console.log('   Valid From:   ' + cert.valid_from);
        console.log('   Valid To:     ' + cert.valid_to);
        console.log('   Serial:       ' + cert.serialNumber);
        console.log('   Fingerprint:  ' + cert.fingerprint256);
        console.log('   SANs:         ' + (cert.subjectaltname || 'None'));
        console.log('   TLS Protocol: ' + protocol);
        console.log('   Cipher:       ' + cipher.name + ' (' + cipher.version + ')');
        console.log('   Authorized:   ' + (authorized ? '✅ YES — trusted chain' : '❌ NO — certificate issue'));
        
        const daysLeft = Math.floor((new Date(cert.valid_to) - new Date()) / (1000*60*60*24));
        console.log('   Days Left:    ' + daysLeft + (daysLeft < 14 ? ' ⚠️ EXPIRING SOON' : daysLeft < 0 ? ' ❌ EXPIRED' : ' ✅'));
        
        // Domain match check
        const sans = cert.subjectaltname || '';
        const matchesWww = sans.includes('northstarmedic.com') || cert.subject.CN === 'www.northstarmedic.com' || cert.subject.CN === 'northstarmedic.com';
        console.log('\n   DOMAIN MATCH: ' + (matchesWww ? '✅ Certificate covers northstarmedic.com' : '❌ MISMATCH — cert covers: ' + cert.subject.CN));
        if (!matchesWww) {
            console.log('   ⚠️  The SSL cert is issued for "' + cert.subject.CN + '" but your domain is "www.northstarmedic.com"');
            console.log('   ⚠️  Visitors will see a SECURITY WARNING in their browser');
            console.log('   🔧 FIX: Re-provision SSL in Railway for your custom domain');
        }
    } catch(e) {
        console.log('   ❌ Connection failed: ' + e.message);
    }

    // 2. SSL on naked domain
    console.log('\n2️⃣  SSL CERTIFICATE: northstarmedic.com (naked)');
    console.log('-'.repeat(60));
    try {
        const { cert, authorized } = await checkCert('northstarmedic.com');
        console.log('   Subject:    ' + cert.subject.CN);
        console.log('   Authorized: ' + (authorized ? '✅' : '❌'));
        const matchesNaked = (cert.subjectaltname || '').includes('northstarmedic.com') || cert.subject.CN === 'northstarmedic.com';
        console.log('   Match:      ' + (matchesNaked ? '✅' : '❌ Cert is for: ' + cert.subject.CN));
    } catch(e) {
        console.log('   ❌ ' + e.message);
    }

    // 3. DNS records
    console.log('\n3️⃣  DNS RECORDS');
    console.log('-'.repeat(60));
    try {
        const wwwCname = await dns.resolveCname('www.northstarmedic.com').catch(() => null);
        const wwwA = await dns.resolve4('www.northstarmedic.com').catch(() => null);
        const nakedA = await dns.resolve4('northstarmedic.com').catch(() => null);
        const nakedCname = await dns.resolveCname('northstarmedic.com').catch(() => null);
        
        if (wwwCname) console.log('   www CNAME:    ' + wwwCname.join(', '));
        if (wwwA) console.log('   www A:        ' + wwwA.join(', '));
        if (nakedCname) console.log('   naked CNAME:  ' + nakedCname.join(', '));
        if (nakedA) console.log('   naked A:      ' + nakedA.join(', '));
        
        // Check if pointing to Railway
        const allRecords = [].concat(wwwCname||[], wwwA||[], nakedCname||[], nakedA||[]);
        const pointsToRailway = allRecords.some(r => r.includes('railway'));
        console.log('   Points to Railway: ' + (pointsToRailway ? '✅ Yes' : '⚠️ Not detected'));
    } catch(e) {
        console.log('   ❌ DNS error: ' + e.message);
    }

    // 4. HTTP redirect checks
    console.log('\n4️⃣  REDIRECT CHAIN');
    console.log('-'.repeat(60));
    const urls = [
        'http://northstarmedic.com',
        'http://www.northstarmedic.com',
        'https://northstarmedic.com',
        'https://www.northstarmedic.com'
    ];
    for (const url of urls) {
        try {
            const { status, location } = await checkRedirect(url);
            const icon = status === 200 ? '✅' : (status === 301 ? '↪️ ' : status === 302 ? '↪️ ' : '⚠️');
            console.log('   ' + icon + ' ' + url);
            console.log('      → ' + status + (location ? ' → ' + location : ' (serves content)'));
        } catch(e) {
            console.log('   ❌ ' + url + ' — ' + e.message);
        }
    }

    // 5. Security headers
    console.log('\n5️⃣  SECURITY HEADERS');
    console.log('-'.repeat(60));
    try {
        const { headers } = await checkRedirect('https://www.northstarmedic.com');
        const checks = {
            'strict-transport-security': 'HSTS',
            'x-frame-options': 'X-Frame-Options',
            'x-content-type-options': 'X-Content-Type',
            'content-security-policy': 'CSP',
            'referrer-policy': 'Referrer-Policy',
            'permissions-policy': 'Permissions-Policy',
            'x-xss-protection': 'XSS-Protection'
        };
        for (const [h, label] of Object.entries(checks)) {
            const val = headers[h];
            console.log('   ' + (val ? '✅' : '❌') + ' ' + label + ': ' + (val ? val.substring(0, 70) : 'MISSING'));
        }
    } catch(e) {
        console.log('   ❌ Could not check headers: ' + e.message);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SSL AUDIT SUMMARY');
    console.log('='.repeat(60));
}

main().catch(e => console.error('Fatal:', e));
