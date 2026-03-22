require('dotenv').config();

const API_KEY = process.env.PORKBUN_API_KEY;
const SECRET_KEY = process.env.PORKBUN_SECRET_KEY;
const DOMAIN = 'northstarmedic.com';
const LOCAL = 'joehary';

async function createMailboxAndConnect() {
    // ── Try multiple Porkbun mailbox endpoint variations ──
    const endpoints = [
        `/api/json/v3/email/createMailbox/${DOMAIN}`,
        `/api/json/v3/email/create/${DOMAIN}`,
        `/api/json/v3/email/addMailbox/${DOMAIN}`,
        `/api/json/v3/email/mailbox/create`,
    ];

    for (const ep of endpoints) {
        console.log(`\n🔍 Trying: POST ${ep}`);
        try {
            const res = await fetch(`https://api.porkbun.com${ep}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apikey: API_KEY,
                    secretapikey: SECRET_KEY,
                    domain: DOMAIN,
                    login: LOCAL,
                    password: 'NorthStar2026!',
                    name: 'Joe Illum'
                })
            });
            const text = await res.text();
            if (text.startsWith('<')) {
                console.log(`  → HTML response (endpoint doesn't exist): ${res.status}`);
            } else {
                const data = JSON.parse(text);
                console.log(`  → ${res.status}:`, JSON.stringify(data, null, 2));
                if (data.status === 'SUCCESS' || res.status === 200) {
                    console.log('\n✅ MAILBOX CREATED!');
                    break;
                }
            }
        } catch (e) {
            console.log(`  → Error: ${e.message}`);
        }
    }

    // Also check the Porkbun docs path
    console.log('\n📋 Listing email accounts...');
    try {
        const res = await fetch(`https://api.porkbun.com/api/json/v3/email/listAccounts/${DOMAIN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apikey: API_KEY, secretapikey: SECRET_KEY })
        });
        const text = await res.text();
        if (text.startsWith('<')) {
            console.log('→ HTML (not found)');
        } else {
            console.log(JSON.parse(text));
        }
    } catch(e) { console.error(e.message); }

    // Verify MX records are correct
    console.log('\n📬 Verifying DNS (MX):');
    const dnsRes = await fetch(`https://api.porkbun.com/api/json/v3/dns/retrieve/${DOMAIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apikey: API_KEY, secretapikey: SECRET_KEY })
    });
    const dns = await dnsRes.json();
    const mx = (dns.records || []).filter(r => r.type === 'MX');
    console.log('MX Records:', mx.map(r => `${r.content} (prio ${r.prio})`));
    
    if (mx.some(r => r.content === 'mail.porkbun.com')) {
        console.log('✅ MX pointing to email hosting server (mail.porkbun.com)');
    } else {
        console.log('⚠️  MX not yet pointing to mail.porkbun.com');
    }
}

createMailboxAndConnect().catch(console.error);
