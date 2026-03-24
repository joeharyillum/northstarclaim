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

    const deployId = '9d3f2607-0296-4d0c-91f2-7c0ebecf8c2c';

    const logs = await gql(`query { buildLogs(deploymentId: "${deployId}", limit: 100) { message severity } }`);
    if (logs.data?.buildLogs) {
        const lines = logs.data.buildLogs;
        console.log('Build logs (' + lines.length + ' lines):');
        lines.forEach(l => console.log('[' + l.severity + ']', l.message));
    } else {
        console.log(JSON.stringify(logs));
    }
}

run().catch(console.error);
