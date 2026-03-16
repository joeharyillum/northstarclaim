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

    // Get latest deployments
    const r = await gql(`query {
        deployments(input: { serviceId: "${serviceId}", environmentId: "${envId}" }) {
            edges {
                node {
                    id
                    status
                    createdAt
                    meta
                }
            }
        }
    }`);

    if (r.data) {
        const deps = r.data.deployments.edges.slice(0, 5);
        deps.forEach(d => {
            const meta = d.node.meta ? JSON.stringify(d.node.meta).substring(0, 80) : '';
            console.log(d.node.id, d.node.status, d.node.createdAt, meta);
        });

        // If latest is building, get its build logs
        const latest = deps[0]?.node;
        if (latest && (latest.status === 'BUILDING' || latest.status === 'DEPLOYING' || latest.status === 'SUCCESS')) {
            const logs = await gql(`query { buildLogs(deploymentId: "${latest.id}", limit: 30) { message severity } }`);
            if (logs.data?.buildLogs) {
                console.log('\n--- Build logs for', latest.id, '---');
                logs.data.buildLogs.slice(-15).forEach(l => console.log('[' + l.severity + ']', l.message));
            }
        }
    } else {
        console.log(JSON.stringify(r));
    }
}

run().catch(console.error);
