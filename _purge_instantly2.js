require('dotenv').config();
const fs = require('fs');

const API_KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;

async function run() {
    const emails = JSON.parse(fs.readFileSync('_fake_emails.json', 'utf-8'));
    console.log(`Removing ${emails.length} fake leads from Instantly...`);

    let removed = 0;
    let notFound = 0;
    let errors = 0;

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

            if (res.ok) {
                removed++;
            } else if (res.status === 404) {
                notFound++;
            } else if (res.status === 429) {
                console.log(`  Rate limited at ${i}, waiting 10s...`);
                await new Promise(r => setTimeout(r, 10000));
                i--;
                continue;
            } else {
                errors++;
                if (errors <= 3) {
                    const txt = await res.text();
                    console.log(`  Error ${res.status}: ${txt.substring(0, 100)}`);
                }
            }
        } catch (e) {
            errors++;
            if (errors <= 3) console.log(`  Fetch error: ${e.message}`);
        }

        if ((i + 1) % 500 === 0) {
            console.log(`  ${i + 1}/${emails.length} — removed: ${removed}, not found: ${notFound}, errors: ${errors}`);
        }

        await new Promise(r => setTimeout(r, 80));
    }

    console.log(`\nDONE: removed=${removed}, notFound=${notFound}, errors=${errors}`);
    fs.unlinkSync('_fake_emails.json');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
