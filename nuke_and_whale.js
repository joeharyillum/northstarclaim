require('dotenv').config();
const fs = require('fs');

async function nukeAndWhale() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log('☢️ NUKE & WHALE: Campaign', campaignId);

    // 1. Get ALL leads in this campaign (v2 list)
    console.log('Listing leads...');
    let currentLeads = [];
    try {
        const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: campaignId, limit: 1000 })
        });
        const data = await res.json();
        currentLeads = data.items || [];
    } catch (e) {
        console.error('Failed to list leads:', e.message);
    }

    console.log(`Found ${currentLeads.length} leads to nuke.`);

    // 2. Nuke 'em!
    for (const lead of currentLeads) {
        try {
            console.log(`- Nuking ${lead.email}...`);
            await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: lead.email, campaign_id: campaignId })
            });
            await new Promise(r => setTimeout(r, 100)); // Be gentle
        } catch (e) {}
    }

    // 3. Load Whales (up to 100)
    console.log('🐋 Loading Whales from CSV...');
    const csvContent = fs.readFileSync('whale_targets.csv', 'utf8');
    const lines = csvContent.split('\n').filter(l => l.trim() !== '').slice(1);
    const whaleData = lines.map(line => {
        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!parts || parts.length < 6) return null;
        return {
            company: parts[0].replace(/"/g, ''),
            person: parts[3].replace(/"/g, ''),
            title: parts[4].replace(/"/g, ''),
            email: parts[5].replace(/"/g, '')
        };
    }).filter(x => x && x.email).slice(0, 100);

    console.log(`Ready to upload ${whaleData.length} whales.`);

    for (const whale of whaleData) {
        try {
            console.log(`+ Uploading ${whale.email} (${whale.company})...`);
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign: campaignId,
                    email: whale.email,
                    first_name: whale.person.split(' ')[0],
                    last_name: whale.person.split(' ').slice(1).join(' '),
                    company_name: whale.company,
                    title: whale.title,
                    personalization: `I noticed your role as ${whale.title} at ${whale.company}.`,
                    skip_if_in_campaign: true
                })
            });
            const d = await res.json();
            if (!res.ok) console.error(`❌ Failed:`, d);
            await new Promise(r => setTimeout(r, 100));
        } catch (e) {}
    }

    // 4. Activate! (Attempt all possible statuses)
    console.log('🔥 ACTIVATE!');
    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 1 }) // 1 usually means active/running
        });
        const data = await res.json();
        console.log('Update status result:', data.status);
    } catch (e) {
        console.error('Activation error:', e.message);
    }
}

nukeAndWhale();
