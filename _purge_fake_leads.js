/**
 * PURGE ALL FAKE LEADS
 * 1. Delete from Instantly campaign
 * 2. Delete from DB
 * 3. Try to pull real leads from Apollo
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;

async function run() {
    // Step 1: Get all fake leads from DB
    const allLeads = await prisma.lead.findMany({
        select: { id: true, email: true, status: true },
    });
    console.log(`\n=== Found ${allLeads.length} total leads in DB ===\n`);

    // Step 2: Delete from Instantly (batch by removing from campaign)
    console.log('Removing leads from Instantly campaign...');
    let removedFromInstantly = 0;
    let instantlyErrors = 0;

    for (let i = 0; i < allLeads.length; i++) {
        const lead = allLeads[i];
        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    email: lead.email,
                    campaign_id: CAMPAIGN_ID,
                    delete_all_from_company: false,
                }),
            });

            if (res.ok) {
                removedFromInstantly++;
            } else {
                instantlyErrors++;
            }
        } catch (e) {
            instantlyErrors++;
        }

        // Progress every 100
        if ((i + 1) % 100 === 0) {
            console.log(`  Progress: ${i + 1}/${allLeads.length} (removed: ${removedFromInstantly}, errors: ${instantlyErrors})`);
        }

        // Rate limit - 50ms between calls
        await new Promise(r => setTimeout(r, 50));
    }

    console.log(`\nInstantly cleanup: ${removedFromInstantly} removed, ${instantlyErrors} errors`);

    // Step 3: Delete ALL leads from DB
    console.log('\nDeleting all fake leads from database...');
    const deleted = await prisma.lead.deleteMany({});
    console.log(`Deleted ${deleted.count} leads from database`);

    // Step 4: Verify clean state
    const remaining = await prisma.lead.count();
    console.log(`\nRemaining leads in DB: ${remaining}`);

    await prisma.$disconnect();

    console.log('\n=== PURGE COMPLETE ===');
    console.log(`  Instantly: ${removedFromInstantly} removed`);
    console.log(`  Database: ${deleted.count} deleted`);
    console.log(`  DB is now clean: ${remaining === 0 ? 'YES' : 'NO'}`);
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
