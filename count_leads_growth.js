require('dotenv').config();

async function countLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log(`Counting leads for campaign ${campaignId}...`);
    
    let total = 0;
    let nextCursor = null;
    let pages = 0;

    // We only want to see if it's growing, so we just check a few pages
    for (let i = 0; i < 5; i++) {
        const payload = {
            campaign_id: campaignId,
            limit: 100,
            starting_after: nextCursor
        };

        const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) break;
        const data = await res.json();
        if (!data.items || data.items.length === 0) break;

        total += data.items.length;
        nextCursor = data.next_starting_after;
        pages++;
        if (!nextCursor) break;
    }

    console.log(`Found ${total}+ leads across ${pages} pages.`);
}

countLeads();
