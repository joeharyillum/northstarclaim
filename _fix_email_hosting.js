require('dotenv').config();

const API_KEY = process.env.PORKBUN_API_KEY;
const SECRET_KEY = process.env.PORKBUN_SECRET_KEY;
const DOMAIN = 'northstarmedic.com';
const EMAIL = 'joehary@northstarmedic.com';
const LOCAL = 'joehary';

// Porkbun email hosting MX servers (different from forwarder servers)
const EMAIL_HOSTING_MX = [
    { content: 'mail.porkbun.com', prio: 10 }
];

async function fixEmailHosting() {

    // ── STEP 1: Get current DNS records ──
    console.log('📋 Step 1: Getting current DNS records...');
    const dnsRes = await fetch(`https://api.porkbun.com/api/json/v3/dns/retrieve/${DOMAIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apikey: API_KEY, secretapikey: SECRET_KEY })
    });
    const dnsData = await dnsRes.json();
    const records = dnsData.records || [];
    const mxRecords = records.filter(r => r.type === 'MX');
    console.log('Current MX records:', mxRecords.map(r => `id:${r.id} → ${r.content} (prio ${r.prio})`));

    // ── STEP 2: Delete old forwarder MX records ──
    console.log('\n🗑️ Step 2: Removing old forwarder MX records...');
    for (const mx of mxRecords) {
        const delRes = await fetch(`https://api.porkbun.com/api/json/v3/dns/delete/${DOMAIN}/${mx.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apikey: API_KEY, secretapikey: SECRET_KEY })
        });
        const delData = await delRes.json();
        console.log(`- Deleted MX ${mx.content}: ${delData.status}`);
    }

    // ── STEP 3: Add email hosting MX record ──
    console.log('\n📬 Step 3: Adding Porkbun email hosting MX record...');
    const addRes = await fetch(`https://api.porkbun.com/api/json/v3/dns/create/${DOMAIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apikey: API_KEY,
            secretapikey: SECRET_KEY,
            name: '',
            type: 'MX',
            content: 'mail.porkbun.com',
            ttl: '600',
            prio: '10'
        })
    });
    const addData = await addRes.json();
    console.log('Add MX result:', addData);

    // ── STEP 4: Try to create the mailbox ──
    console.log('\n📮 Step 4: Creating mailbox via Porkbun API...');
    const mbRes = await fetch(`https://api.porkbun.com/api/json/v3/email/createMailbox/${DOMAIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apikey: API_KEY,
            secretapikey: SECRET_KEY,
            domain: DOMAIN,
            login: LOCAL,
            password: 'NorthStar2026!Secure'
        })
    });
    const mbData = await mbRes.json();
    console.log('Mailbox create result:', JSON.stringify(mbData, null, 2));

    // ── STEP 5: Check current forwarding ──
    console.log('\n📤 Step 5: Checking email forwards...');
    const fwdRes = await fetch(`https://api.porkbun.com/api/json/v3/email/listForwards/${DOMAIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apikey: API_KEY, secretapikey: SECRET_KEY })
    });
    try {
        const fwdData = await fwdRes.json();
        console.log('Forwards:', JSON.stringify(fwdData, null, 2));
    } catch {
        console.log('Forwards response not JSON (may be HTML error page)');
    }
}

fixEmailHosting().catch(console.error);
