const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const configPath = path.join(os.homedir(), '.railway', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = config.user ? config.user.token : config.token;

    // Check latest failed deployment logs
    const deployId = "74cabb02-da07-4675-94b3-5bd5e88aad99";
    
    const query = `query {
        buildLogs(deploymentId: "${deployId}", limit: 100) {
            message
            severity
        }
    }`;

    const res = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query })
    });
    const data = await res.json();
    
    if (data.data?.buildLogs) {
        data.data.buildLogs.forEach(log => {
            console.log(`[${log.severity}] ${log.message}`);
        });
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}
run();
