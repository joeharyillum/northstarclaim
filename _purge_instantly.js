/**
 * Remove fake leads from Instantly campaign
 * Uses delete_leads_from_list endpoint for batch removal
 */
require('dotenv').config();
const fs = require('fs');

const API_KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;

async function run() {
    const emails = JSON.parse(fs.readFileSync('_fake_emails.json', 'utf-8'));
    console.log(`Removing ${emails.length} fake leads from Instantly campaign...`);

    let removed = 0;
    let errors = 0;

    // Process in small batches with delays
    for (let i = 0; i < emails.length; i++) {
        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    email: emails[i],
                    campaign_id: CAMPAIGN_ID,
                    delete_all_from_company: false,
                }),
            });

            if (res.ok || res.status === 404) {
                removed++;
            } else {
                errors++;
                if (res.status === 429) {
                    // Rate limited - wait 5 seconds
                    console.log('  Rate limited, waiting 5s...');
                    await new Promise(r => setTimeout(r, 5000));
                    i--; // Retry
                    continue;
                }
            }
        } catch (e) {
            errors++;
        }

        if ((i + 1) % 200 === 0) {
            console.log(`  ${i + 1}/${emails.length} processed (removed: ${removed}, errors: ${errors})`);
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 80));
    }

    console.log(`\nDone: ${removed} removed, ${errors} errors out of ${emails.length} total`);

    // Cleanup
    fs.unlinkSync('_fake_emails.json');
    console.log('Cleaned up _fake_emails.json');
}

run().catch(e => { console.error(e.message); process.exit(1); });
