require('dotenv').config();
const fs = require('fs');

async function harvestBillers() {
    const apolloKey = process.env.APOLLO_API_KEY;
    const instantlyKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    if (!apolloKey || !instantlyKey || !campaignId) {
        console.error('❌ Missing API keys or campaign ID in .env');
        return;
    }

    console.log('👷 [BILLER HUNTER] Searching for Independent Billing Partners...');

    const searchBody = {
        api_key: apolloKey,
        per_page: 50,
        person_titles: [
            'Owner', 'Founder', 'President', 'CEO', 'Principal',
            'Business Owner', 'Managing Partner'
        ],
        person_locations: ['Texas', 'Florida', 'California', 'New York', 'Illinois'],
        q_organization_keyword_tags: ['medical billing', 'revenue cycle management', 'rcm'],
        organization_num_employees_ranges: ['1-10', '11-20', '21-50'], // Focus on small-to-mid billing shops
        contact_email_status: ['verified'],
    };

    try {
        const searchRes = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Api-Key': apolloKey },
            body: JSON.stringify(searchBody),
        });

        if (!searchRes.ok) throw new Error(`Apollo Search Failed: ${searchRes.statusText}`);
        const searchData = await searchRes.json();
        const people = searchData.people || [];

        if (people.length === 0) {
            console.log('❌ No billers found matching criteria.');
            return;
        }

        console.log(`✅ Found ${people.length} potential biller partners. Sample: ${people[0].email || 'no email in search'}`);

        const ids = people.map(p => p.id);
        const enrichmentRes = await fetch('https://api.apollo.io/api/v1/people/bulk_match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Api-Key': apolloKey },
            body: JSON.stringify({ details: ids.map(id => ({ id })) }),
        });

        const enrichmentData = await enrichmentRes.json();
        const matches = enrichmentData.matches || [];
        console.log(`🔍 Enrichment Data: ${matches.length} matches found.`);

        const dataToUse = matches.length > 0 ? matches : people;

        const billersReady = dataToUse.map(m => ({
            email: m.email,
            firstName: m.first_name,
            lastName: m.last_name,
            company: m.organization?.name || m.organization_name,
            title: m.title,
            city: m.city,
            state: m.state,
            personalization: `As the ${m.title} of ${m.organization?.name || m.organization_name}, you know how frustrating complex denials are for your clinic clients. We've built an AI safety net that pays you a 15% override for every win. It's found money for you and your clients.`
        })).filter(w => w.email);

        console.log(`📋 Pushing ${billersReady.length} biller leads to Instantly...`);
        
        let successCount = 0;
        for (const w of billersReady) {
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

            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${instantlyKey}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                successCount++;
                console.log(`   ✅ Sent: ${w.email}`);
            } else {
                const err = await res.text();
                if (err.includes('Lead limit reached')) {
                    console.warn('   🛑 Instantly lead limit reached. Stopping.');
                    break;
                }
                console.warn(`   ❌ Failed: ${w.email} - ${err}`);
            }
            await new Promise(r => setTimeout(r, 500));
        }

        console.log(`\n🏁 Biller recruitment complete. ${successCount} leads added to NorthStar campaign.`);

    } catch (e) {
        console.error('❌ Error during biller harvest:', e.message);
    }
}

harvestBillers();
