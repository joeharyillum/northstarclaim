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

    const deployId = '92fad05f-8b36-4233-a96b-a0f4c1291fef';

    // Check deployment status
    const statusQuery = `query {
        deployment(id: "${deployId}") {
            id
            status
            createdAt
            updatedAt
        }
    }`;
    const status = await gql(statusQuery);
    console.log('Status:', JSON.stringify(status, null, 2));

    // Get build logs
    const logQuery = `query {
        buildLogs(deploymentId: "${deployId}", limit: 50) {
            message
            severity
        }
    }`;
    const logs = await gql(logQuery);
    if (logs.errors) {
        console.log('Log query errors:', JSON.stringify(logs.errors));
    } else {
        const logLines = logs.data?.buildLogs || [];
        console.log('\nBuild logs (' + logLines.length + ' lines):');
        logLines.slice(-30).forEach(l => console.log('[' + l.severity + ']', l.message));
    }

    // Also try deploymentLogs
    const deployLogQuery = `query {
        deploymentLogs(deploymentId: "${deployId}") {
            message
            severity
        }
    }`;
    const dLogs = await gql(deployLogQuery);
    if (dLogs.errors) {
        console.log('deploymentLogs errors:', JSON.stringify(dLogs.errors));
    } else {
        const dLogLines = dLogs.data?.deploymentLogs || [];
        console.log('\nDeployment logs (' + dLogLines.length + ' lines):');
        dLogLines.slice(-30).forEach(l => console.log('[' + l.severity + ']', l.message));
    }
}

run().catch(console.error);
