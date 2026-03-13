#!/usr/bin/env node

require('dotenv').config();

async function checkCampaignLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
    
    console.log('\n🔍 CHECKING LEADS IN NORTHSTARCLAIM CAMPAIGN...\n');
    console.log(`Campaign ID: ${campaignId}\n`);
    
    if (!apiKey) {
        console.error('❌ INSTANTLY_API_KEY not set');
        process.exit(1);
    }

    try {
        // Try multiple endpoints to get lead count
        console.log('📡 Attempting to fetch lead count...\n');
        
        // Endpoint 1: Direct leads query
        console.log('  Trying: /api/v2/leads endpoint...');
        const leadsRes = await fetch(`https://api.instantly.ai/api/v2/leads?campaign_id=${campaignId}&limit=1`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (leadsRes.ok) {
            const leads = await leadsRes.json();
            const totalLeads = leads.total || leads.count || 0;
            console.log(`\n✅ LEAD DATA RECEIVED:\n`);
            console.log(`  Total Leads in Campaign: ${totalLeads.toLocaleString()}`);
            
            if (totalLeads >= 650000) {
                console.log('\n✅ ALL 650K+ LEADS CONFIRMED PRESENT!\n');
            } else if (totalLeads > 0) {
                console.log(`\n⚠️  ${totalLeads.toLocaleString()} leads found (expected 650k+)\n`);
            } else {
                console.log(`\n❌ NO LEADS FOUND IN CAMPAIGN!\n`);
            }
            return;
        }
        
        // Endpoint 2: Campaign info
        console.log('  Trying: /api/v2/campaigns endpoint...');
        const campaignRes = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (campaignRes.ok) {
            const campaign = await campaignRes.json();
            console.log(`\n✅ CAMPAIGN INFO RECEIVED:\n`);
            console.log(`  Campaign Name: ${campaign.name}`);
            console.log(`  Status: ${campaign.status}`);
            if (campaign.total_leads) {
                console.log(`  Total Leads: ${campaign.total_leads.toLocaleString()}`);
                if (campaign.total_leads >= 650000) {
                    console.log('\n✅ ALL 650K+ LEADS CONFIRMED PRESENT!\n');
                }
            } else {
                console.log(`  Leads field not available in response`);
                console.log(`\nFull Response:`, JSON.stringify(campaign, null, 2));
            }
            return;
        }

        console.log(`\n❌ Could not fetch lead count. API Status: ${leadsRes.status}`);
        const errText = await leadsRes.text();
        console.log('Response:', errText);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkCampaignLeads();
