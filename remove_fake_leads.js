require('dotenv').config();
const fs = require('fs');

// Parse CSV to get the 50 emails we pushed
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else { inQuotes = !inQuotes; }
        } else if (ch === ',' && !inQuotes) {
            result.push(current); current = '';
        } else { current += ch; }
    }
    result.push(current);
    return result;
}

async function removeFakeLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    if (!apiKey || !campaignId) {
        console.error('Missing INSTANTLY_API_KEY or INSTANTLY_CAMPAIGN_ID');
        process.exit(1);
    }

    // Read the CSV and get first 50 emails (what we pushed)
    const raw = fs.readFileSync('medical_whales_5000.csv', 'utf-8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim());
    const headers = parseCSVLine(lines[0]);
    const emailIdx = headers.findIndex(h => h.trim().toLowerCase() === 'email');

    const emails = [];
    for (let i = 1; i <= 50 && i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const email = (values[emailIdx] || '').trim();
        if (email) emails.push(email);
    }

    console.log(`🗑️  Removing ${emails.length} synthetic leads from Instantly campaign...\n`);

    let removed = 0;
    let errors = 0;

    for (const email of emails) {
        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    email: email,
                    campaign_id: campaignId,
                    delete_all_from_company: false,
                }),
            });

            if (res.ok) {
                removed++;
                console.log(`✅ Removed: ${email}`);
            } else {
                const err = await res.text();
                errors++;
                console.log(`❌ Failed: ${email} — ${err}`);
            }
        } catch (e) {
            errors++;
            console.error(`❌ Error: ${email} — ${e.message}`);
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n🏁 Done. Removed: ${removed} | Errors: ${errors}`);
}

removeFakeLeads();
