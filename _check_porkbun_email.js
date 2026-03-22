require('dotenv').config();

const API_KEY = process.env.PORKBUN_API_KEY;
const SECRET_KEY = process.env.PORKBUN_SECRET_KEY;
const DOMAIN = 'northstarmedic.com';

async function checkPorkbunEmail() {
    console.log('🔍 Checking Porkbun email hosting for', DOMAIN);

    // 1. List email forwards
    console.log('\n1. Email Forwards:');
    try {
        const res = await fetch(`https://api.porkbun.com/api/json/v3/email/listForwards/${DOMAIN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apikey: API_KEY, secretapikey: SECRET_KEY })
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) { console.error(e.message); }

    // 2. Check DNS records (MX) to verify email hosting is active
    console.log('\n2. DNS Records (MX):');
    try {
        const res = await fetch(`https://api.porkbun.com/api/json/v3/dns/retrieve/${DOMAIN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apikey: API_KEY, secretapikey: SECRET_KEY })
        });
        const data = await res.json();
        if (data.records) {
            const mx = data.records.filter(r => r.type === 'MX');
            const txt = data.records.filter(r => r.type === 'TXT');
            console.log('MX Records:', mx.map(r => `${r.content} (prio ${r.prio})`));
            console.log('TXT Records:', txt.map(r => r.content));
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) { console.error(e.message); }

    // 3. Try listing mailboxes (hosted email product)
    console.log('\n3. Hosted Mailboxes:');
    try {
        const res = await fetch(`https://api.porkbun.com/api/json/v3/email/listMailboxes/${DOMAIN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apikey: API_KEY, secretapikey: SECRET_KEY })
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) { console.error(e.message); }
}

checkPorkbunEmail();
