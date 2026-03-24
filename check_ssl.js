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
                customDomain(id: "5496bf9e-a0b5-402a-96ac-ede89a34d5eb", projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb") {
                    id domain
                    status {
                        certificateStatus
                        dnsRecords { currentValue requiredValue status hostlabel recordType purpose }
                    }
                }
            }`
        })
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

run();
