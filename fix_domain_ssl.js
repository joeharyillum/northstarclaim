const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;

    // List all domains on the project  
    const res = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `{
                domains(projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb", serviceId: "5436d4eb-9ab5-4f25-b42d-5e6783f103d9", environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961") {
                    serviceDomains { id domain }
                    customDomains { id domain status { certificateStatus } }
                }
            }`
        })
    });

    const data = await res.json();
    console.log("=== All Domains ===");
    console.log(JSON.stringify(data, null, 2));

    // Try to delete and re-create the custom domain
    console.log("\n=== Deleting stuck domain ===");
    const deleteRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `mutation { customDomainDelete(id: "9ef97135-3eca-44c8-abaa-8ac428e2076a", projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb") }`
        })
    });
    const deleteData = await deleteRes.json();
    console.log(JSON.stringify(deleteData, null, 2));

    // Wait 3 seconds
    await new Promise(r => setTimeout(r, 3000));

    // Re-add the domain
    console.log("\n=== Re-adding domain ===");
    const addRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `mutation {
                customDomainCreate(input: {
                    domain: "www.northstarmedic.com"
                    projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb"
                    serviceId: "5436d4eb-9ab5-4f25-b42d-5e6783f103d9"
                    environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961"
                }) {
                    id domain
                    status { certificateStatus dnsRecords { currentValue requiredValue status hostlabel recordType } }
                }
            }`
        })
    });
    const addData = await addRes.json();
    console.log(JSON.stringify(addData, null, 2));
}

run();
