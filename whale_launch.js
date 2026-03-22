require('dotenv').config();
const fs = require('fs');

async function deepPurgeAndLoadWhales() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log('🔥 DEEP PURGE + WHALE LOAD');
    console.log('Campaign ID:', campaignId);

    // === STEP 1: Deep Purge — page through ALL leads ===
    let purged = 0;
    let startAfter = null;
    let round = 0;

    do {
        round++;
        console.log(`\n📄 Purge Round ${round} (startAfter: ${startAfter || 'beginning'})...`);

        const body = { campaign_id: campaignId, limit: 100 };
        if (startAfter) body.starting_after = startAfter;

        const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        const items = data.items || [];
        console.log(`Found ${items.length} leads to nuke.`);

        if (items.length === 0) break;

        for (const lead of items) {
            try {
                await fetch('https://api.instantly.ai/api/v2/leads', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: lead.email, campaign_id: campaignId })
                });
                purged++;
                process.stdout.write(`\r- Nuked ${purged}...`);
                await new Promise(r => setTimeout(r, 80));
            } catch (e) {}
        }

        startAfter = data.next_starting_after || null;
        if (!startAfter) break;

    } while (true);

    console.log(`\n✅ Purge complete. ${purged} leads removed.`);

    // === STEP 2: Load Whales ===
    console.log('\n🐋 Loading Whale Targets from CSV...');
    const csvContent = fs.readFileSync('whale_targets.csv', 'utf8');
    const lines = csvContent.split('\n').filter(l => l.trim() !== '').slice(1);

    const whales = lines.map(line => {
        const parts = line.match(/(".*?"|[^,]+)(?=,|$)/g);
        if (!parts || parts.length < 6) return null;
        const email = parts[5].replace(/"/g, '').replace(/&apos;/g, "'").trim();
        const person = parts[3].replace(/"/g, '').trim();
        const nameParts = person.split(' ');
        return {
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            company_name: parts[0].replace(/"/g, '').replace(/&apos;/g, "'").trim(),
            title: parts[4].replace(/"/g, '').trim(),
            email
        };
    }).filter(x => x && x.email && x.email.includes('@'));

    console.log(`Ready to upload ${whales.length} whale targets.`);

    let pushed = 0, failed = 0;
    for (const whale of whales) {
        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign: campaignId,
                    email: whale.email,
                    first_name: whale.first_name,
                    last_name: whale.last_name,
                    company_name: whale.company_name,
                    title: whale.title,
                    personalization: `Hi ${whale.first_name}, as ${whale.title} at ${whale.company_name}, you handle significant denied claims volume that our AI can recover automatically.`,
                    skip_if_in_campaign: true
                })
            });

            if (res.ok) {
                pushed++;
                console.log(`✅ ${pushed}. ${whale.email} (${whale.company_name})`);
            } else {
                const d = await res.json();
                console.error(`❌ FAILED ${whale.email}: ${d.message || JSON.stringify(d)}`);
                failed++;
                if (d.message && d.message.includes('limit reached')) {
                    console.error('⛔ Lead upload limit reached! Upgrade Instantly plan at https://app.instantly.ai/app/settings/billing');
                    break;
                }
            }
            await new Promise(r => setTimeout(r, 120));
        } catch (e) {
            console.error(`❌ Error for ${whale.email}:`, e.message);
            failed++;
        }
    }

    console.log(`\n🐋 Upload complete: ${pushed} pushed, ${failed} failed.`);

    // === STEP 3: Verify ===
    const verRes = await fetch('https://api.instantly.ai/api/v2/leads/list', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId, limit: 10 })
    });
    const verData = await verRes.json();
    console.log(`\n✅ VERIFICATION: ${(verData.items || []).length} leads now in campaign.`);
    (verData.items || []).slice(0, 5).forEach(l => console.log(`  - ${l.email} @ ${l.company_name || 'N/A'}`));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  CAMPAIGN ACTIVATION REQUIRED:');
    console.log('  The Instantly free plan API cannot auto-activate campaigns.');
    console.log('  Go to: https://app.instantly.ai/app/campaigns');
    console.log(`  Find: "NorthStar Denied Claims Recovery"`);
    console.log('  Click the ▶️ PLAY button to launch the campaign.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

deepPurgeAndLoadWhales().catch(console.error);
