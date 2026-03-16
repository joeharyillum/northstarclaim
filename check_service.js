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

    // Check service source/repo connection
    const r = await gql(`query {
        service(id: "${serviceId}") {
            name
            repoTriggers {
                provider
                repo
                branch
            }
            source {
                repo
                image
            }
        }
    }`);
    console.log('Service config:', JSON.stringify(r, null, 2));

    // Also check cert status
    const cert = await gql(`query {
        customDomain(id: "ba04e741-5f23-439b-a1f9-eb540186bf25", projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb") {
            domain
            status {
                certificateStatus
            }
        }
    }`);
    console.log('\nCert status:', JSON.stringify(cert, null, 2));
}

run().catch(console.error);
