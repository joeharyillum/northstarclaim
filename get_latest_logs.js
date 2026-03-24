const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const configPath = path.join(os.homedir(), '.railway', 'config.json');
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = configData.token || configData.user?.token;
    const project = "247503fa-e374-42f5-87bd-806da174c4fb";

    // 1. Get latest deployment ID
    const queryDeploy = `query {
        deployments(input: { projectId: "${project}", first: 1 }) {
            edges {
                node {
                    id
                    status
                }
            }
        }
    }`;

    const resDeploy = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query: queryDeploy })
    });
    const dataDeploy = await resDeploy.json();
    
    if (!dataDeploy.data?.deployments?.edges?.[0]) {
        console.log("No deployments found.");
        console.log(JSON.stringify(dataDeploy, null, 2));
        return;
    }

    const latestId = dataDeploy.data.deployments.edges[0].node.id;
    console.log(`Latest Deployment ID: ${latestId} (Status: ${dataDeploy.data.deployments.edges[0].node.status})`);

    // 2. Get build logs for this ID
    const queryLogs = `query {
        buildLogs(deploymentId: "${latestId}", limit: 50) {
            message
            severity
        }
    }`;

    const resLogs = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query: queryLogs })
    });
    const dataLogs = await resLogs.json();
    
    if (dataLogs.data?.buildLogs) {
        dataLogs.data.buildLogs.forEach(log => {
            console.log(`[${log.severity}] ${log.message}`);
        });
    } else {
        console.log("No logs found.");
        console.log(JSON.stringify(dataLogs, null, 2));
    }
}
run();
