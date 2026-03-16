const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const configPath = path.join(os.homedir(), '.railway', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = config.user ? config.user.token : config.token;

    const domainId = "7d74dba8-0464-4aa4-9533-d2bd89955a26";
    const projectId = "0a1d83d6-dd26-4305-9163-b06da174c4fb";
    const serviceId = "5436d4eb-9ab5-4f25-b42d-5e6783f103d9";
    const environmentId = "7eeb15ef-533b-414d-90b2-05c7b3f30961";

    // Step 1: Delete existing domain
    console.log("Deleting existing custom domain...");
    const deleteMutation = `mutation {
        customDomainDelete(id: "${domainId}")
    }`;

    const delRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query: deleteMutation })
    });
    console.log("Delete result:", JSON.stringify(await delRes.json()));

    // Wait 3 seconds
    await new Promise(r => setTimeout(r, 3000));

    // Step 2: Re-add the domain
    console.log("\nRe-adding www.northstarmedic.com...");
    const createMutation = `mutation {
        customDomainCreate(input: {
            projectId: "${projectId}"
            serviceId: "${serviceId}"
            environmentId: "${environmentId}"
            domain: "www.northstarmedic.com"
        }) {
            id
            domain
            status {
                dnsRecords {
                    requiredValue
                    currentValue
                    recordType
                    hostlabel
                    zone
                    status
                }
            }
        }
    }`;

    const createRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query: createMutation })
    });
    const createData = await createRes.json();
    console.log("Create result:", JSON.stringify(createData, null, 2));
}
run();
