const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const configPath = path.join(os.homedir(), '.railway', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = config.user ? config.user.token : config.token;

    const query = `query {
        customDomain(id: "ba04e741-5f23-439b-a1f9-eb540186bf25", projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb") {
            id
            domain
            status {
                certificateStatus
                dnsRecords {
                    currentValue
                    requiredValue
                    status
                    hostlabel
                    zone
                    recordType
                    purpose
                }
            }
        }
    }`;

    const res = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query })
    });
    console.log(JSON.stringify(await res.json(), null, 2));
}
run();
