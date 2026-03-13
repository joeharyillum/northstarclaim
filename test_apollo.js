require('dotenv').config();

async function testApollo() {
    const apiKey = process.env.APOLLO_API_KEY;
    const body = {
        api_key: apiKey,
        per_page: 5,
        person_titles: ['CEO'],
        person_locations: ['Texas'],
    };

    const res = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log('Results:', JSON.stringify(data, null, 2));
}

testApollo();
