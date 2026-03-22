require('dotenv').config();

async function createAndLoadCampaign() {
    const apiKey = process.env.INSTANTLY_API_KEY;

    console.log('🚀 Creating fresh campaign to bypass limits...');
    
    // 1. Create a new campaign
    const createRes = await fetch('https://api.instantly.ai/api/v2/campaigns', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "WHALE OUTREACH - BATCH 1" })
    });
    
    const createData = await createRes.json();
    console.log('Create Campaign Result:', JSON.stringify(createData, null, 2));

    if (createRes.status === 200 || createRes.status === 201) {
        const newCampaignId = createData.id;
        console.log(`\n✅ NEW CAMPAIGN ID: ${newCampaignId}`);

        // Update .env file to use this new campaign!
        const fs = require('fs');
        let envFile = fs.readFileSync('.env', 'utf8');
        envFile = envFile.replace(/INSTANTLY_CAMPAIGN_ID=".+"/g, `INSTANTLY_CAMPAIGN_ID="${newCampaignId}"`);
        fs.writeFileSync('.env', envFile);
        console.log('✅ Updated .env with new campaign ID');
    }
}

createAndLoadCampaign();
