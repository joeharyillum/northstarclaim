require('dotenv').config();

async function reconnectMailbox() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const email = 'joehary@northstarmedic.com';
    
    console.log('🔧 Attempting to reconnect mailbox via API...\n');
    
    // Try PATCH on /api/v2/accounts/{email} with SMTP creds
    // Porkbun SMTP settings:
    const smtpSettings = {
        smtp_host: 'smtp.porkbun.com',
        smtp_port: 587,
        smtp_username: email,
        imap_host: 'imap.porkbun.com',
        imap_port: 993,
    };
    
    // Try 1: PATCH update account
    console.log('Test 1: PATCH /api/v2/accounts/{email}...');
    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/accounts/${encodeURIComponent(email)}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(smtpSettings)
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`, JSON.stringify(data, null, 2));
    } catch (e) { console.error(e.message); }
    
    // Try 2: GET account details
    console.log('\nTest 2: GET /api/v2/accounts/{email}...');
    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/accounts/${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`, JSON.stringify(data, null, 2));
    } catch (e) { console.error(e.message); }
    
    // Try 3: Resume/reconnect endpoint
    console.log('\nTest 3: POST /api/v2/accounts/{email}/reconnect...');
    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/accounts/${encodeURIComponent(email)}/reconnect`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`, JSON.stringify(data, null, 2));
    } catch (e) { console.error(e.message); }
    
    // Try 4: Enable account
    console.log('\nTest 4: POST /api/v2/accounts/enable...');
    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/accounts/enable`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`, JSON.stringify(data, null, 2));
    } catch (e) { console.error(e.message); }
    
    // Try 5: Update account status
    console.log('\nTest 5: PATCH /api/v2/accounts/{email} status=1...');
    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/accounts/${encodeURIComponent(email)}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 1 })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`, JSON.stringify(data, null, 2));
    } catch (e) { console.error(e.message); }
}

reconnectMailbox();
