require('dotenv').config();
const fs = require('fs');

async function harvestWhales() {
    const apolloKey = process.env.APOLLO_API_KEY;
    const instantlyKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log('🐋 [WHALE HUNTER] Searching Apollo for the 11 Whales (Texas & Florida)...');

    const searchBody = {
        api_key: apolloKey,
        per_page: 11,
        person_titles: [
            'CEO', 'CFO', 'Chief Financial Officer', 'Medical Director',
            'Practice Manager', 'Revenue Cycle Manager', 'Billing Manager',
            'Director of Revenue Cycle', 'VP Finance', 'Office Manager', 'Administrator',
        ],
        person_locations: ['Texas', 'Florida'],
        q_organization_keyword_tags: ['healthcare', 'medical', 'hospital', 'clinic', 'health'],
        contact_email_status: ['verified'],
    };

    const searchRes = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': apolloKey },
        body: JSON.stringify(searchBody),
    });

    const searchData = await searchRes.json();
    const people = searchData.people || [];

    if (people.length === 0) {
        console.log('❌ No whales found in search.');
        return;
    }

    console.log(`✅ Found ${people.length} potential whales. Getting emails...`);

    const ids = people.map(p => p.id);
    const enrichmentRes = await fetch('https://api.apollo.io/api/v1/people/bulk_match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': apolloKey },
        body: JSON.stringify({ details: ids.map(id => ({ id })) }),
    });

    const enrichmentData = await enrichmentRes.json();
    console.log('DEBUG Enrichment Data:', JSON.stringify(enrichmentData, null, 2));
    const whales = enrichmentData.matches || [];

    console.log(`✅ Enriched ${whales.length} whales with real data.`);

    const whalesReady = whales.map(m => ({
        email: m.email,
        firstName: m.first_name,
        lastName: m.last_name,
        company: m.organization?.name,
        title: m.title,
        city: m.city,
        state: m.state,
        personalization: `As ${m.organization?.name}'s ${m.title}, you understand that A/R leaks in ${m.state} are costing healthcare providers millions. Our AI plugs those leaks automatically.`
    })).filter(w => w.email);

    console.log(`📋 Ready to push ${whalesReady.length} whales to Instantly.`);
    
    fs.writeFileSync('the_11_whales.json', JSON.stringify(whalesReady, null, 2));
    console.log('💾 [SAVED] the_11_whales.json');

    for (const w of whalesReady) {
        const payload = {
            email: w.email,
            first_name: w.firstName,
            last_name: w.lastName,
            company_name: w.company,
            campaign_id: campaignId,
            skip_if_in_workspace: false,
            custom_variables: {
                title: w.title,
                city: w.city,
                state: w.state,
                personalization: w.personalization
            }
        };

        try {
            console.log(`🚀 [PUSHING] ${w.email}...`);
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${instantlyKey}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                console.log(`   ✅ Success!`);
            } else {
                const err = await res.text();
                console.log(`   ❌ Failed: ${err}`);
                if (err.includes('Lead limit reached')) {
                    console.log('   🛑 [ABORT] Hard limit reached on Instantly.');
                    break;
                }
            }
        } catch (e) {
            console.error(`   ❌ Error: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('\n🏁 Whale hunt complete.');
}

harvestWhales().catch(console.error);
