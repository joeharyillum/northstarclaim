const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

async function importWhales() {
    console.log('🐋 Whale Harvester: Starting import...');
    
    const csvPath = 'whale_targets.csv';
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // Skip header
    const dataLines = lines.slice(1);
    
    let imported = 0;
    let skipped = 0;
    
    for (const line of dataLines) {
        // Simple CSV parser (handle quotes)
        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!parts || parts.length < 6) {
            console.log('⚠️ Skipping invalid line:', line);
            skipped++;
            continue;
        }
        
        const orgName = parts[0].replace(/"/g, '');
        const personName = parts[3].replace(/"/g, '');
        const title = parts[4].replace(/"/g, '');
        const email = parts[5].replace(/"/g, '');
        
        const nameParts = personName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        try {
            await prisma.lead.upsert({
                where: { email },
                update: {
                    firstName,
                    lastName,
                    company: orgName,
                    title,
                    source: 'whale_target',
                    status: 'new'
                },
                create: {
                    email,
                    firstName,
                    lastName,
                    company: orgName,
                    title,
                    source: 'whale_target',
                    status: 'new'
                }
            });
            imported++;
        } catch (e) {
            console.error(`❌ Error importing ${email}:`, e.message);
            skipped++;
        }
    }
    
    console.log(`✅ Imported ${imported} whale leads, skipped ${skipped}.`);
}

async function pushToInstantly() {
    console.log('🚀 Pushing whales to Instantly...');
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
    
    const whales = await prisma.lead.findMany({
        where: { source: 'whale_target', status: 'new' }
    });
    
    console.log(`Found ${whales.length} whales to push.`);
    
    let pushed = 0;
    let failed = 0;
    
    for (const whale of whales) {
        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    campaign: campaignId,
                    email: whale.email,
                    first_name: whale.firstName,
                    last_name: whale.lastName,
                    company_name: whale.company,
                    title: whale.title,
                    personalization: `I noticed ${whale.company} manages over ${whale.title === 'CEO' ? 'thousands of beds' : 'a significant revenue cycle'}.`,
                    skip_if_in_campaign: true
                })
            });
            
            if (res.ok) {
                pushed++;
                await prisma.lead.update({
                    where: { id: whale.id },
                    data: { status: 'contacted', pushedAt: new Date() }
                });
            } else {
                const data = await res.json();
                console.error(`❌ Failed to push ${whale.email}:`, data);
                failed++;
            }
        } catch (e) {
            console.error(`❌ Error pushing ${whale.email}:`, e.message);
            failed++;
        }
    }
    
    console.log(`✅ Pushed ${pushed} leads to Instantly, ${failed} failed.`);
}

async function activate() {
    console.log('🔥 Activating Campaign...');
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
    
    try {
        // Status 1 is usually "Active" in Instantly.
        const res = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 1 })
        });
        
        const data = await res.json();
        console.log('Campaign Update Result:', data.status === 1 ? 'SUCCESS: ACTIVE' : 'FAILED: ' + data.status);
    } catch (e) {
        console.error('Error activating campaign:', e.message);
    }
}

async function main() {
    await importWhales();
    await pushToInstantly();
    await activate();
    await prisma.$disconnect();
}

main().catch(console.error);
