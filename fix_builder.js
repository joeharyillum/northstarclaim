const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const configPath = path.join(os.homedir(), '.railway', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = config.user ? config.user.token : config.token;

    const serviceId = "5436d4eb-9ab5-4f25-b42d-5e6783f103d9";
    const environmentId = "7eeb15ef-533b-414d-90b2-05c7b3f30961";

    // Check current service instance config
    const query = `query {
        serviceInstance(serviceId: "${serviceId}", environmentId: "${environmentId}") {
            buildCommand
            startCommand
            builder
            nixpacksPlan
            source {
                repo
            }
        }
    }`;

    const res = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query })
    });
    const data = await res.json();
    console.log("Current config:", JSON.stringify(data, null, 2));

    // Update to use Dockerfile builder
    const mutation = `mutation {
        serviceInstanceUpdate(
            serviceId: "${serviceId}"
            environmentId: "${environmentId}"
            input: {
                builder: DOCKERFILE
                dockerfilePath: "Dockerfile"
            }
        )
    }`;

    const mutRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query: mutation })
    });
    console.log("\nUpdate result:", JSON.stringify(await mutRes.json(), null, 2));
}
run();
