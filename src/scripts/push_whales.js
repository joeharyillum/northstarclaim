require('dotenv').config();
const fs = require('fs');

async function pushWhales() {
    console.log('🚀 [HYPER-SYNC] Starting API upload for medical_whales_5000.csv');
    
    const k = process.env.INSTANTLY_API_KEY;
    const c = process.env.INSTANTLY_CAMPAIGN_ID;
    
    if (!k || !c) {
        console.log('❌ Missing API key or Campaign ID in .env');
        return;
    }

    const lines = fs.readFileSync('medical_whales_5000.csv', 'utf8').split('\n').filter(x => x.trim());
    console.log(`📥 Loaded ${lines.length - 1} leads from CSV.`);
    
    let success = 0;
    let failed = 0;
    let limitReached = false;
    
    // We will push the first 500 right now to populate the campaign instantly
    const leadsToPush = 4000;
    console.log(`📤 Pushing ${leadsToPush} Fortune 500 Whales directly to Instantly (starting from index 1001)...`);

    for (let i = 1001; i <= 1001 + leadsToPush; i++) {
        if (!lines[i]) break;
        
        // CSV: Email,FirstName,LastName,CompanyName,Title,City,State
        const parts = lines[i].split(',');
        const lead = {
            email: parts[0].trim(),
            first_name: parts[1].trim(),
            last_name: parts[2].trim(),
            company_name: parts[3].trim().replace(/"/g, ''),
            campaign_id: c,
            skip_if_in_workspace: true,
            custom_variables: {
                title: parts[4].trim(),
                city: parts[5].trim(),
                state: parts[6].trim()
            }
        };

        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + k,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(lead)
            });

            if (res.ok) {
                success++;
                process.stdout.write('🟢');
            } else {
                const text = await res.text();
                // console.log('\nError debug:', text);
                if (text.includes('Lead limit reached')) {
                    console.log('\n🛑 LIMIT REACHED. Instantly stopped accepting new leads.');
                    console.log('Response:', text);
                    limitReached = true;
                    break;
                } else if (text.includes('already exists')) {
                    // Just skip it silently
                    process.stdout.write('🟡');
                } else {
                    console.log(`\n❌ Failed adding ${lead.email}: ${text}`);
                    failed++;
                    process.stdout.write('🔴');
                }
            }
        } catch (e) {
            console.log(`\n❌ Error for ${lead.email}: ${e.message}`);
            failed++;
            process.stdout.write('🔴');
        }
        
        // Brief 150ms pause to respect API rate limits
        await new Promise(r => setTimeout(r, 150));
    }

    console.log(`\n\n✅ [SYNC COMPLETE]`);
    console.log(`   Successfully Added: ${success}`);
    if (failed > 0) console.log(`   Failed: ${failed}`);
    if (limitReached) console.log(`   Note: Stopped early due to account limits. You are maxed out!`);
    console.log(`\n🔥 Campaign is now loaded. They are ready to be contacted!`);
}

pushWhales();
