require('dotenv').config();

async function checkInstantlyAPI() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
    
    console.log('🔍 Checking Instantly API endpoints...\n');
    
    // 1. Check current campaign status
    console.log('1. Current Campaign Status:');
    const camRes = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const camData = await camRes.json();
    console.log(`- Status: ${camData.status} (0=draft, 1=active, 2=paused)`);
    console.log(`- Name: ${camData.name}`);
    
    // 2. Check leads count
    console.log('\n2. Leads in Campaign:');
    const leadsRes = await fetch('https://api.instantly.ai/api/v2/leads/list', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId, limit: 100 })
    });
    const leadsData = await leadsRes.json();
    const items = leadsData.items || [];
    console.log(`- Total leads loaded: ${items.length}`);
    if (items.length > 0) {
        console.log(`- First lead: ${items[0].email} (${items[0].company_name || 'unknown company'})`);
        console.log(`- Last lead: ${items[items.length-1].email}`);
    }
    
    // 3. Try campaign launch (different endpoint)
    console.log('\n3. Trying campaign launch endpoint:');
    const launchRes = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}/launch`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
    const launchData = await launchRes.json();
    console.log(`- Launch result: ${JSON.stringify(launchData)}`);
    
    // 4. Check campaign status again
    const camRes2 = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const camData2 = await camRes2.json();
    console.log(`\n4. Updated Status: ${camData2.status} (0=draft, 1=active, 2=paused)`);
}

checkInstantlyAPI().catch(console.error);
