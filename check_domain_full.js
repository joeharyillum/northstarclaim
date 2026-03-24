const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;

    const res = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `{
                customDomain(id: "9ef97135-3eca-44c8-abaa-8ac428e2076a", projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb") {
                    id domain environmentId serviceId targetPort createdAt updatedAt
                    status {
                        certificateStatus
                        dnsRecords { currentValue requiredValue status hostlabel recordType purpose zone fqdn }
                    }
                }
            }`
        })
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));

    // Also list ALL custom domains on the service
    const res2 = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `{
                customDomains(projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb", serviceId: "5436d4eb-9ab5-4f25-b42d-5e6783f103d9", environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961") {
                    customDomains { id domain status { certificateStatus } }
                }
            }`
        })
    });

    const data2 = await res2.json();
    console.log("\n--- All Custom Domains ---");
    console.log(JSON.stringify(data2, null, 2));
}

run();
