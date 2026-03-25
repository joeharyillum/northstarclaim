const fs = require('fs');
const os = require('os');
const path = require('path');

async function inspectRailway() {
    const configPath = path.join(os.homedir(), '.railway', 'config.json');
    if (!fs.existsSync(configPath)) {
        console.error('Railway config not found');
        return;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = config.user ? config.user.token : config.token;

    const query = `query {
        projects {
            edges {
                node {
                    id
                    name
                    deployments(first: 20) {
                        edges {
                            node {
                                id
                                status
                                staticUrl
                                createdAt
                                buildLogs(limit: 50) {
                                    message
                                    severity
                                }
                            }
                        }
                    }
                }
            }
        }
    }`;

    try {
        const res = await fetch('https://backboard.railway.com/graphql/v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        
        if (data.data?.projects?.edges) {
            data.data.projects.edges.forEach(proj => {
                console.log(`\n### Project: ${proj.node.name}`);
                proj.node.deployments.edges.forEach(dep => {
                    console.log(`- ${dep.node.id} [${dep.node.status}] ${dep.node.createdAt}`);
                    if (dep.node.status === 'FAILED') {
                        console.log('  LATEST LOGS:');
                        dep.node.buildLogs.slice(-5).forEach(log => console.log(`    [${log.severity}] ${log.message}`));
                    }
                });
            });
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}
inspectRailway();
