const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
    
    const gql = (query) => fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
    }).then(r => r.json());

    const serviceId = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9';
    const envId = '7eeb15ef-533b-414d-90b2-05c7b3f30961';
    const lastGoodDeploy = 'ca91acd9-a88b-4691-87ca-856f163fb20a';

    // Step 1: Switch builder to NIXPACKS
    console.log('Switching builder to NIXPACKS...');
    const updateQuery = `mutation {
        serviceInstanceUpdate(
            serviceId: "${serviceId}",
            environmentId: "${envId}",
            input: { builder: NIXPACKS }
        )
    }`;
    const updateResult = await gql(updateQuery);
    console.log('Builder update:', JSON.stringify(updateResult, null, 2));

    if (updateResult.errors) {
        console.log('Builder update failed, aborting.');
        return;
    }

    // Step 2: Verify builder changed
    const verifyQuery = `query {
        serviceInstance(serviceId: "${serviceId}", environmentId: "${envId}") {
            builder
        }
    }`;
    const verifyResult = await gql(verifyQuery);
    console.log('Verified builder:', JSON.stringify(verifyResult, null, 2));

    // Step 3: Trigger redeploy
    console.log('Triggering redeploy...');
    const redeployQuery = `mutation {
        deploymentRedeploy(id: "${lastGoodDeploy}") {
            id
            status
        }
    }`;
    const redeployResult = await gql(redeployQuery);
    console.log('Redeploy:', JSON.stringify(redeployResult, null, 2));
}

run().catch(console.error);
