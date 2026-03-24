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

    // Connect the GitHub repo to the service
    console.log('Connecting GitHub repo...');
    const connectResult = await gql(`mutation {
        serviceConnect(
            id: "${serviceId}",
            input: {
                repo: "joeharyillum/northstarclaim",
                branch: "master"
            }
        ) {
            id
            name
        }
    }`);
    console.log('Connect result:', JSON.stringify(connectResult, null, 2));
}

run().catch(console.error);
