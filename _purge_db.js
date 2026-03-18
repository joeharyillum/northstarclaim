/**
 * PURGE FAKE LEADS — Step 1: Clean DB immediately
 * Step 2: Remove from Instantly via API
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    // Get emails before deleting (need them for Instantly cleanup)
    const leads = await prisma.lead.findMany({ select: { email: true } });
    console.log(`Found ${leads.length} leads in DB`);

    // Delete all from DB immediately
    const deleted = await prisma.lead.deleteMany({});
    console.log(`DELETED ${deleted.count} fake leads from database`);

    const remaining = await prisma.lead.count();
    console.log(`DB now has: ${remaining} leads`);

    // Save emails list for Instantly cleanup
    const fs = require('fs');
    fs.writeFileSync('_fake_emails.json', JSON.stringify(leads.map(l => l.email)));
    console.log(`Saved ${leads.length} emails to _fake_emails.json for Instantly cleanup`);

    await prisma.$disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });
