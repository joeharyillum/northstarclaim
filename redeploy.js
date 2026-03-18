
const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const configPath = path.join(os.homedir(), '.railway', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = config.user ? config.user.token : config.token;

    // Redeploy the last successful deployment
    const deployId = "ca91acd9-a88b-4691-87ca-856f163fb20a";
    console.log("Redeploying last successful deployment:", deployId);
    
    const mutation = `mutation {
        deploymentRedeploy(id: "${deployId}") {
            id
            status
        }
    }`;

    const res = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query: mutation })
    });
    console.log("Result:", JSON.stringify(await res.json(), null, 2));
}
run();
