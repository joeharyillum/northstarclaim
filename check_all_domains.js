const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const projectId = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
    const envId = 'd9d7a080-2781-4e12-9ebd-ba8b268b5eda';

    // Get all services
    const res = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `query { project(id: "${projectId}") { name services { edges { node { id name } } } } }`
        })
    });

    const data = await res.json();
    console.log('Project:', data.data?.project?.name);

    if (data.data?.project?.services?.edges) {
        for (const edge of data.data.project.services.edges) {
            const svc = edge.node;
            console.log(`\n═══ Service: ${svc.name} (${svc.id}) ═══`);

            const domRes = await fetch('https://backboard.railway.com/graphql/v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({
                    query: `query { customDomains(projectId: "${projectId}", serviceId: "${svc.id}", environmentId: "${envId}") { id domain status { certificateStatus dnsRecords { currentValue requiredValue status hostlabel recordType purpose } } } }`
                })
            });
            const domData = await domRes.json();
            
            if (domData.data?.customDomains?.length > 0) {
                for (const d of domData.data.customDomains) {
                    console.log(`  Domain: ${d.domain}`);
                    console.log(`  SSL Cert: ${d.status?.certificateStatus}`);
                    if (d.status?.dnsRecords) {
                        for (const r of d.status.dnsRecords) {
                            console.log(`  DNS: ${r.hostlabel} ${r.recordType} → ${r.requiredValue}`);
                            console.log(`    Current: ${r.currentValue || 'NOT SET'}`);
                            console.log(`    Status: ${r.status}`);
                        }
                    }
                }
            } else {
                console.log('  No custom domains');
            }
        }
    }
}

run().catch(e => console.error(e));
