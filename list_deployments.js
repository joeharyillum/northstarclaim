const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const configPath = path.join(os.homedir(), '.railway', 'config.json');
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = configData.token || configData.user?.token;
    const project = "247503fa-e374-42f5-87bd-806da174c4fb";

    const query = `query {
        deployments(projectId: "${project}", limit: 5) {
            edges {
                node {
                    id
                    status
                    createdAt
                    canRollback
                    environment { name }
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
    console.log(JSON.stringify(data, null, 2));
}
run();
