require('dotenv').config();

async function checkApolloCredits() {
    const apiKey = process.env.APOLLO_API_KEY;
    console.log('--- APOLLO CREDIT CHECK ---');
    try {
        const res = await fetch('https://api.apollo.io/api/v1/auth/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey
            }
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error checking credits:', e.message);
    }
}

checkApolloCredits();
