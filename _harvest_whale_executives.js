require('dotenv').config();
const fs = require('fs');

async function harvestWhaleExecutives() {
    const apolloKey = process.env.APOLLO_API_KEY;
    const instantlyKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    if (!apolloKey || !instantlyKey || !campaignId) {
        console.error('❌ Missing API keys or campaign ID in .env');
        return;
    }

    console.log('🐋 [WHALE HUNTER] Loading more High-Value Hospital Executives...');

    const searchBody = {
        api_key: apolloKey,
        per_page: 50, // Get a decent batch
        person_titles: [
            'VP Revenue Cycle', 'CFO', 'Chief Financial Officer', 
            'Director of Patient Accounts', 'VP Finance', 'Revenue Cycle Director',
            'Business Office Manager', 'VP Managed Care'
        ],
        organization_num_employees_ranges: ['501-1000', '1001-2000', '2001-5000', '5001-10000', '10001+'], // Focus on LARGER hospitals
        q_organization_keyword_tags: ['hospital', 'health system', 'medical center'],
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
            console.log('❌ No new whales found matching criteria.');
            return;
        }

        console.log(`✅ Found ${people.length} potential whales. Sample: ${people[0].email || 'no email in search'}`);

        const ids = people.map(p => p.id);
        const enrichmentRes = await fetch('https://api.apollo.io/api/v1/people/bulk_match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Api-Key': apolloKey },
            body: JSON.stringify({ details: ids.map(id => ({ id })) }),
        });

        const enrichmentData = await enrichmentRes.json();
        const whales = enrichmentData.matches || [];
        console.log(`🔍 Enrichment Data: ${whales.length} matches found.`);

        // Use search data directly if enrichment fails to provide email
        const dataToUse = whales.length > 0 ? whales : people;

        const whalesReady = dataToUse.map(m => ({
            email: m.email,
            firstName: m.first_name,
            lastName: m.last_name,
            company: m.organization?.name || m.organization_name,
            title: m.title,
            city: m.city,
            state: m.state,
            employees: m.organization?.estimated_num_employees || m.organization_num_employees || 'Large',
            personalization: `As ${m.organization?.name || m.organization_name}'s ${m.title}, you're overseeing a major health system. Our AI specifically targets the high-value denials that slip past your current billing team.`
        })).filter(w => w.email);

        console.log(`📋 Pushing ${whalesReady.length} high-value executives to Instantly...`);
        
        let successCount = 0;
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
                    employees: w.employees.toString(),
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

        console.log(`\n🏁 Whale extraction complete. ${successCount} leads added to NorthStar campaign.`);

    } catch (e) {
        console.error('❌ Error during whale harvest:', e.message);
    }
}

harvestWhaleExecutives();
