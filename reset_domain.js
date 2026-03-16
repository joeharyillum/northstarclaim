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
    const domainId = 'ba04e741-5f23-439b-a1f9-eb540186bf25';

    // Step 1: Delete existing custom domain
    console.log('Deleting custom domain...');
    const delResult = await gql(`mutation { customDomainDelete(id: "${domainId}") }`);
    console.log('Delete result:', JSON.stringify(delResult, null, 2));

    // Step 2: Wait a moment
    await new Promise(r => setTimeout(r, 3000));

    // Step 3: Re-add www.northstarmedic.com
    const projectId = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
    console.log('Re-adding custom domain...');
    const addResult = await gql(`mutation {
        customDomainCreate(input: {
            domain: "www.northstarmedic.com",
            projectId: "${projectId}",
            serviceId: "${serviceId}",
            environmentId: "${envId}"
        }) {
            id
            domain
            status {
                certificateStatus
                dnsRecords {
                    requiredValue
                    hostlabel
                    recordType
                    purpose
                }
            }
        }
    }`);
    console.log('Add result:', JSON.stringify(addResult, null, 2));
}

run().catch(console.error);
