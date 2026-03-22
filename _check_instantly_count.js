require('dotenv').config();

async function checkInstantlyCounts() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
    
    // List campaigns and see their lead counts
    const res = await fetch(`https://api.instantly.ai/api/v2/campaigns`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const data = await res.json();
    const camp = data.items ? data.items.find(c => c.id === campaignId) : null;
    
    if (camp) {
        console.log(`Campaign Name: ${camp.name}`);
        console.log(`Leads total count (if visible):`, camp);
    } else {
        console.log("Could not find campaign details", data);
    }
}
checkInstantlyCounts();
