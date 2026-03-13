require('dotenv').config();

async function estimateTotal() {
    const k = process.env.INSTANTLY_API_KEY;
    const cid = process.env.INSTANTLY_CAMPAIGN_ID;
    
    let total = 0;
    let nextCursor = null;
    
    console.log('Counting total leads (fast sampling)...');
    
    while(true) {
        const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + k, 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: cid, limit: 100, starting_after: nextCursor })
        });
        
        const data = await res.json();
        if (data.error) {
            console.log('API Error:', data.message);
            break;
        }
        if (!data.items || data.items.length === 0) break;
        
        total += data.items.length;
        nextCursor = data.next_starting_after;
        console.log(`... ${total} leads found so far`);
        if (!nextCursor) break;
    }
    
    console.log(`\n🏁 TOTAL DETECTED LEADS: ${total}`);
}

estimateTotal();
