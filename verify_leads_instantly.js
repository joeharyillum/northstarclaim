#!/usr/bin/env node

require('dotenv').config();

async function checkLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    
    console.log('\n🔍 CHECKING INSTANTLY CAMPAIGNS FOR LEADS...\n');
    
    if (!apiKey) {
        console.error('❌ INSTANTLY_API_KEY not set in .env');
        return;
    }

    try {
        // Get all campaigns
        const campaignsRes = await fetch('https://api.instantly.ai/api/v2/campaigns', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        const campaignsData = await campaignsRes.json();
        
        if (!campaignsData.items) {
            console.log('❌ No campaigns found:', campaignsData);
            return;
        }

        console.log(`📊 Found ${campaignsData.items.length} campaigns\n`);

        let totalLeads = 0;

        for (const campaign of campaignsData.items) {
            console.log(`Campaign: ${campaign.name}`);
            console.log(`  ID: ${campaign.id}`);
            console.log(`  Status: ${campaign.status}`);
            
            // Try to get campaign details with lead count
            try {
                const statsRes = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaign.id}/statistics`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });

                const stats = await statsRes.json();
                const leadCount = stats.total_number_of_leads || stats.leads_count || 0;
                
                console.log(`  Leads: ${leadCount.toLocaleString()}`);
                console.log(`  Sent: ${(stats.number_of_sent || 0).toLocaleString()}`);
                console.log(`  Opened: ${(stats.number_of_opened || 0).toLocaleString()}`);
                console.log(`  Replied: ${(stats.number_of_replied || 0).toLocaleString()}`);
                
                totalLeads += leadCount;
            } catch (e) {
                console.log(`  ⚠️  Could not fetch stats: ${e.message}`);
            }
            
            console.log('');
        }

        console.log(`\n✅ TOTAL LEADS IN INSTANTLY: ${totalLeads.toLocaleString()}`);
        
        if (totalLeads >= 650000) {
            console.log('✅ ALL 650K+ LEADS ARE PRESENT AND ACTIVE!\n');
        } else if (totalLeads > 0) {
            console.log(`⚠️  Only ${totalLeads.toLocaleString()} leads found (expected 650k+)\n`);
        } else {
            console.log('❌ NO LEADS FOUND IN INSTANTLY!\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkLeads();
