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
                    services {
                        edges {
                            node {
                                id
                                name
                                config {
                                    buildCommand
                                    installCommand
                                    startCommand
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
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
inspectRailway();
