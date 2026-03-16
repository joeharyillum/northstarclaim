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

    // First get the list of domains
    const query1 = `query {
        domains(projectId: "${projectId}", serviceId: "${serviceId}", environmentId: "${environmentId}") {
            serviceDomains { id domain }
            customDomains { 
                id 
                domain
                status {
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

    const query = query1;

    const res = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
run();
