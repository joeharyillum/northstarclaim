const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const configPath = path.join(os.homedir(), '.railway', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = config.user ? config.user.token : config.token;

    const projectId = "0a1d83d6-dd26-4305-9163-b06da174c4fb";
    const serviceId = "5436d4eb-9ab5-4f25-b42d-5e6783f103d9";
    const environmentId = "7eeb15ef-533b-414d-90b2-05c7b3f30961";

    // Check full domain status with all available fields
    const query = `query {
        domains(projectId: "${projectId}", serviceId: "${serviceId}", environmentId: "${environmentId}") {
            customDomains {
                id
                domain
                targetPort
                status {
                    certificateStatus
                    dnsRecords {
                        currentValue
                        requiredValue
                        status
                        hostlabel
                        zone
                        recordType
                    }
                }
            }
        }
    }`;

    const res = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query })
    });
    const data = await res.json();
    console.log("Domain status:", JSON.stringify(data, null, 2));

    // Get latest deployment
    const deployQuery = `query {
        deployments(input: {
            projectId: "${projectId}"
            serviceId: "${serviceId}"
            environmentId: "${environmentId}"
        }) {
            edges {
                node {
                    id
                    status
                    createdAt
                }
            }
        }
    }`;

    const deployRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query: deployQuery })
    });
    const deployData = await deployRes.json();
    const edges = deployData.data?.deployments?.edges || [];
    console.log("\nLatest deployments:");
    edges.slice(0, 3).forEach(e => console.log(`  ${e.node.id} - ${e.node.status} - ${e.node.createdAt}`));

    // Trigger redeploy using the latest deployment
    if (edges.length > 0) {
        const latestId = edges[0].node.id;
        console.log("\nTriggering redeploy of:", latestId);
        const redeployMutation = `mutation {
            deploymentRedeploy(id: "${latestId}")
        }`;
        const rdRes = await fetch('https://backboard.railway.com/graphql/v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ query: redeployMutation })
        });
        console.log("Redeploy result:", JSON.stringify(await rdRes.json()));
    }
}
run();
