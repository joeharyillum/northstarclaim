require('dotenv').config();

// Try all known Instantly v2 mailbox endpoints
async function findMailboxEndpoints() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    
    const endpoints = [
        { method: 'GET', path: '/api/v2/mailboxes' },
        { method: 'GET', path: '/api/v2/accounts' },
        { method: 'GET', path: '/api/v2/email-accounts' },
        { method: 'GET', path: '/api/v2/sending-accounts' },
        { method: 'GET', path: '/api/v1/mailbox/list' },
        { method: 'GET', path: '/api/v1/account/list' },
        { method: 'POST', path: '/api/v1/account/list', body: {} },
    ];
    
    for (const ep of endpoints) {
        try {
            const opts = {
                method: ep.method,
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
            };
            if (ep.body) opts.body = JSON.stringify(ep.body);
            
            const res = await fetch(`https://api.instantly.ai${ep.path}`, opts);
            const data = await res.json();
            
            if (res.status !== 404) {
                console.log(`✅ FOUND [${ep.method} ${ep.path}] → ${res.status}`);
                console.log(JSON.stringify(data, null, 2));
            } else {
                console.log(`❌ ${ep.method} ${ep.path} → 404`);
            }
        } catch (e) {
            console.log(`❌ ${ep.method} ${ep.path} → Error: ${e.message}`);
        }
    }
}
findMailboxEndpoints();
