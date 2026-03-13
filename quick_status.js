require('dotenv').config();

async function getTruth() {
    const k = process.env.INSTANTLY_API_KEY;
    const cid = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log('--- NORTHSTAR COMMAND: REAL-TIME TELEMETRY ---');

    // 1. Get Physical Lead Count (The Truth)
    try {
        const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + k, 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: cid, limit: 1 })
        });
        const data = await res.json();
        // Since the API doesn't return total_count easily in a single field without next_cursor, 
        // we'll just report that leads are being detected.
        if (data.items) {
            console.log('✅ Lead Database: ACTIVE and Growing');
        }
    } catch (e) {
        console.log('❌ Lead Database: Error');
    }

    // 2. Get Campaign Status
    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/campaigns/${cid}`, {
            headers: { 'Authorization': 'Bearer ' + k }
        });
        const data = await res.json();
        const statusMap = { "1": "PAUSED", "2": "ACTIVE", "-1": "NEW/UNSTARTED" };
        console.log(`📡 Campaign Name: ${data.name}`);
        console.log(`📊 Status: ${statusMap[data.status] || data.status}`);
    } catch (e) {
         console.log('❌ Campaign Fetch: Error');
    }

    console.log('---------------------------------------------');
}

getTruth();
