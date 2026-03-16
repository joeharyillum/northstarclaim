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

    const serviceId = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9';
    const envId = '7eeb15ef-533b-414d-90b2-05c7b3f30961';

    // Check service instance for repo info
    const r = await gql(`query {
        service(id: "${serviceId}") {
            name
        }
        serviceInstance(serviceId: "${serviceId}", environmentId: "${envId}") {
            builder
            source {
                repo
                image
            }
        }
    }`);
    console.log('Service:', JSON.stringify(r, null, 2));
}

run().catch(console.error);
