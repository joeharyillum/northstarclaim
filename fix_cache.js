const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
    
    const gql = (query) => fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST', headers,
        body: JSON.stringify({ query })
    }).then(r => r.json());

    const projectId = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
    const serviceId = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9';
    const envId = '7eeb15ef-533b-414d-90b2-05c7b3f30961';

    // Set NIXPACKS_NO_CACHE=1 environment variable
    console.log('Setting NIXPACKS_NO_CACHE=1...');
    const upsertQuery = `mutation {
        variableUpsert(input: {
            projectId: "${projectId}",
            serviceId: "${serviceId}",
            environmentId: "${envId}",
            name: "NIXPACKS_NO_CACHE",
            value: "1"
        })
    }`;
    const result = await gql(upsertQuery);
    console.log('Result:', JSON.stringify(result, null, 2));

    if (!result.errors) {
        // Trigger redeploy
        console.log('Triggering redeploy...');
        const redeployResult = await gql(`mutation {
            deploymentRedeploy(id: "ca91acd9-a88b-4691-87ca-856f163fb20a") {
                id status
            }
        }`);
        console.log('Redeploy:', JSON.stringify(redeployResult, null, 2));
    }
}

run().catch(console.error);
