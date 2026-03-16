const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const projectId = '0a1d83d6-dd26-4305-9163-b06da174c4fb';

    // Get environments
    const res = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `query { project(id: "${projectId}") { name environments { edges { node { id name } } } } }`
        })
    });
    const data = await res.json();
    console.log('Environments:', JSON.stringify(data.data?.project?.environments, null, 2));

    const envs = data.data?.project?.environments?.edges || [];
    const services = ['1f04bbfc-d8f8-4ec6-bda0-8c543697674a', '5436d4eb-9ab5-4f25-b42d-5e6783f103d9'];

    for (const env of envs) {
        console.log(`\n═══ Environment: ${env.node.name} (${env.node.id}) ═══`);
        for (const svcId of services) {
            const domRes = await fetch('https://backboard.railway.com/graphql/v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({
                    query: `query { customDomains(projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${env.node.id}") { id domain status { certificateStatus dnsRecords { currentValue requiredValue status hostlabel recordType purpose } } } }`
                })
            });
            const domData = await domRes.json();
            const domains = domData.data?.customDomains || [];
            if (domains.length > 0) {
                console.log(`  Service ${svcId}:`);
                for (const d of domains) {
                    console.log(`    Domain: ${d.domain}`);
                    console.log(`    SSL: ${d.status?.certificateStatus}`);
                    if (d.status?.dnsRecords) {
                        for (const r of d.status.dnsRecords) {
                            console.log(`    DNS ${r.hostlabel}: ${r.recordType} → ${r.requiredValue} | Current: ${r.currentValue || 'NOT SET'} | Status: ${r.status}`);
                        }
                    }
                }
            }
        }
    }

    // Also check service domains (Railway auto-generated)
    console.log('\n═══ Service Domains (auto-generated) ═══');
    for (const svcId of services) {
        for (const env of envs) {
            const sdRes = await fetch('https://backboard.railway.com/graphql/v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({
                    query: `query { serviceDomains(projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${env.node.id}") { id domain } }`
                })
            });
            const sdData = await sdRes.json();
            const sds = sdData.data?.serviceDomains || [];
            if (sds.length > 0) {
                for (const sd of sds) {
                    console.log(`  ${svcId} (${env.node.name}): ${sd.domain}`);
                }
            }
        }
    }
}

run().catch(e => console.error(e));
