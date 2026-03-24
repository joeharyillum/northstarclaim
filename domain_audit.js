const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;

    async function gql(query) {
        const r = await fetch('https://backboard.railway.com/graphql/v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ query })
        });
        return (await r.json());
    }

    // Get all services and their domains
    console.log('=== Full Project Domain Audit ===\n');

    const proj = await gql(`{ project(id: "0a1d83d6-dd26-4305-9163-b06da174c4fb") { name services { edges { node { id name } } } environments { edges { node { id name } } } } }`);
    
    const services = proj.data?.project?.services?.edges?.map(e => e.node) || [];
    const envs = proj.data?.project?.environments?.edges?.map(e => e.node) || [];
    
    console.log('Project:', proj.data?.project?.name);
    console.log('Services:', services.map(s => `${s.name} (${s.id})`).join(', '));
    console.log('Environments:', envs.map(e => `${e.name} (${e.id})`).join(', '));
    
    for (const svc of services) {
        for (const env of envs) {
            console.log(`\n--- ${svc.name} / ${env.name} ---`);
            
            const cd = await gql(`{ customDomains(projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb", serviceId: "${svc.id}", environmentId: "${env.id}") { id domain status { certificateStatus dnsRecords { requiredValue currentValue status hostlabel recordType } } } }`);
            const customs = cd.data?.customDomains || [];
            
            const sd = await gql(`{ serviceDomains(projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb", serviceId: "${svc.id}", environmentId: "${env.id}") { id domain } }`);
            const sdoms = sd.data?.serviceDomains || [];
            
            if (customs.length === 0 && sdoms.length === 0) {
                console.log('  (no domains)');
                continue;
            }
            
            for (const d of customs) {
                console.log(`  Custom: ${d.domain} (id: ${d.id})`);
                console.log(`    SSL: ${d.status?.certificateStatus}`);
                for (const r of d.status?.dnsRecords || []) {
                    console.log(`    DNS: ${r.hostlabel || '@'} ${r.recordType} → ${r.requiredValue} | Current: ${r.currentValue || 'NOT SET'} | ${r.status}`);
                }
            }
            for (const s of sdoms) {
                console.log(`  Railway: ${s.domain} (id: ${s.id})`);
            }
        }
    }

    // Also check: what's the plan?
    console.log('\n=== Account Info ===');
    const me = await gql(`{ me { email name teams { edges { node { id name } } } } }`);
    console.log('User:', me.data?.me?.email, me.data?.me?.name);
    
    // Try to force-delete via different approach - maybe the domain is on northstar-app?
    console.log('\n=== Trying to remove orphan from northstar-app ===');
    const del1 = await gql(`mutation { customDomainDelete(id: "5496bf9e-a0b5-402a-96ac-ede89a34d5eb") }`);
    console.log('Result:', JSON.stringify(del1));
}

run().catch(e => console.error(e));
