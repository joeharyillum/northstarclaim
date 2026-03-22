require('dotenv').config();
const fs = require('fs');

async function researchWhaleOrgs() {
    const apolloKey = process.env.APOLLO_API_KEY;

    if (!apolloKey) {
        console.error('❌ Missing Apollo API key');
        return;
    }

    console.log('🏛️ [ORG RESEARCH] Finding Top 100 Regional Health Systems...');

    const searchBody = {
        api_key: apolloKey,
        per_page: 100,
        organization_locations: ['Texas', 'Florida', 'Georgia', 'Arizona'],
        q_organization_keyword_tags: ['hospital', 'health system', 'medical center'],
        organization_num_employees_ranges: ['1001-2000', '2001-5000', '5001-10000', '10001+'],
    };

    try {
        const searchRes = await fetch('https://api.apollo.io/api/v1/organizations/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Api-Key': apolloKey },
            body: JSON.stringify(searchBody),
        });

        if (!searchRes.ok) throw new Error(`Apollo Org Search Failed: ${searchRes.statusText}`);
        const searchData = await searchRes.json();
        const orgs = searchData.organizations || [];

        if (orgs.length === 0) {
            console.log('❌ No large health systems found.');
            return;
        }

        console.log(`✅ Found ${orgs.length} major health systems. Extracting contacts for Top 10...`);

        const topOrgs = orgs.slice(0, 10);
        const contacts = [];

        for (const org of topOrgs) {
            console.log(`🔍 Searching executives for: ${org.name}`);
            
            const personSearchBody = {
                api_key: apolloKey,
                q_organization_domains: org.primary_domain,
                person_titles: ['CFO', 'Chief Financial Officer', 'VP Revenue Cycle', 'VP Finance'],
                per_page: 5,
                contact_email_status: ['verified'],
            };

            const personRes = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': apolloKey },
                body: JSON.stringify(personSearchBody),
            });

            if (personRes.ok) {
                const personData = await personRes.json();
                const people = personData.people || [];
                people.forEach(p => {
                    contacts.push({
                        email: p.email,
                        firstName: p.first_name,
                        lastName: p.last_name,
                        title: p.title,
                        company: org.name,
                        website: org.primary_domain,
                        location: `${p.city || ''}, ${p.state || ''}`,
                        employees: org.estimated_num_employees || 'Large'
                    });
                });
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log(`📋 Found ${contacts.length} confirmed C-suite whale leads.`);
        fs.writeFileSync('whale_leads_high_priority.json', JSON.stringify(contacts, null, 2));
        console.log('💾 Saved to whale_leads_high_priority.json');

        // Optional: Push to Instantly
        const instantlyKey = process.env.INSTANTLY_API_KEY;
        const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
        if (instantlyKey && campaignId && contacts.length > 0) {
            console.log(`🚀 Pushing ${contacts.length} whale leads to Instantly...`);
            for (const c of contacts) {
                if (!c.email) continue;
                const payload = {
                    email: c.email,
                    first_name: c.firstName,
                    last_name: c.lastName,
                    company_name: c.company,
                    campaign_id: campaignId,
                    custom_variables: {
                        title: c.title,
                        location: c.location,
                        personalization: `As ${c.company}'s ${c.title}, you're managing one of the region's largest systems. Our AI safety net catches the complex denials your current team misses.`
                    }
                };
                await fetch('https://api.instantly.ai/api/v2/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${instantlyKey}` },
                    body: JSON.stringify(payload)
                });
            }
            console.log('✅ Pushed to Instantly.');
        }

    } catch (e) {
        console.error('❌ Error during org research:', e.message);
    }
}

researchWhaleOrgs();
