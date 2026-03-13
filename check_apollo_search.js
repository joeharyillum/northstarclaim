require('dotenv').config();

async function checkApolloSearch() {
    const apiKey = process.env.APOLLO_API_KEY;
    const body = {
        api_key: apiKey,
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

    const res = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log('Search Results:', JSON.stringify(data.people ? data.people.length : 0));
    if (data.people) {
        data.people.forEach((p, i) => {
            console.log(`${i+1}. ${p.first_name} ${p.last_name} | ${p.title} @ ${p.organization?.name || 'Unknown'} (${p.organization?.primary_domain || 'no domain'}) | ${p.email || 'NO EMAIL'}`);
        });
    } else {
        console.log('Error/No people:', data);
    }
}

checkApolloSearch();
