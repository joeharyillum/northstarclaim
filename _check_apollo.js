require('dotenv').config();

async function checkApollo() {
    const apiKey = process.env.APOLLO_API_KEY;
    console.log('🔍 Checking Apollo API credits...');
    
    // Check Email sequences or accounts to see if user has Apollo Setup
    const res = await fetch('https://api.apollo.io/v1/auth/health', {
        headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' }
    });
    
    // Let's check user limits
    const limits = await fetch(`https://api.apollo.io/api/v1/users/me?api_key=${apiKey}`, {
        headers: { 'Content-Type': 'application/json' }
    });
    const lData = await limits.json();
    console.log(JSON.stringify(lData, null, 2));
}

checkApollo();
