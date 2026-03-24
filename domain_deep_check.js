const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    
    const ENV = '7eeb15ef-533b-414d-90b2-05c7b3f30961';
    const PROJ = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
    const SERVICES = [
        { id: '1f04bbfc-d8f8-4ec6-bda0-8c543697674a', name: 'northstar-app' },
        { id: '5436d4eb-9ab5-4f25-b42d-5e6783f103d9', name: 'northstar-website' },
    ];

    async function gql(query) {
        const r = await fetch('https://backboard.railway.com/graphql/v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ query })
        });
        return (await r.json());
    }

    // Check all domains on each service
    for (const svc of SERVICES) {
        console.log(`\n=== ${svc.name} ===`);
        
        const cd = await gql(`{ customDomains(projectId: "${PROJ}", serviceId: "${svc.id}", environmentId: "${ENV}") { id domain status { certificateStatus dnsRecords { requiredValue currentValue status hostlabel recordType } } } }`);
        const customs = cd.data?.customDomains || [];
        console.log(`Custom domains: ${customs.length}`);
        for (const d of customs) {
            console.log(`  📌 ${d.domain} (id: ${d.id}) SSL: ${d.status?.certificateStatus}`);
        }
        
        const sd = await gql(`{ serviceDomains(projectId: "${PROJ}", serviceId: "${svc.id}", environmentId: "${ENV}") { id domain } }`);
        const sdoms = sd.data?.serviceDomains || [];
        console.log(`Service domains: ${sdoms.length}`);
        for (const s of sdoms) {
            console.log(`  🌐 ${s.domain} (id: ${s.id})`);
        }

        // Try to delete any service domains on northstar-app to free up slots
        if (svc.name === 'northstar-app') {
            for (const s of sdoms) {
                console.log(`  Deleting service domain ${s.domain}...`);
                const del = await gql(`mutation { serviceDomainDelete(id: "${s.id}", environmentId: "${ENV}") }`);
                console.log(`    Result:`, JSON.stringify(del.data || del.errors?.[0]?.message));
            }
            for (const d of customs) {
                console.log(`  Deleting custom domain ${d.domain}...`);
                const del = await gql(`mutation { customDomainDelete(id: "${d.id}") }`);
                console.log(`    Result:`, JSON.stringify(del.data || del.errors?.[0]?.message));
            }
        }
    }

    // Also try a broader query - maybe domains exist but aren't linked right
    console.log('\n=== Orphan domain check (by known ID) ===');
    // The orphan: 5496bf9e-a0b5-402a-96ac-ede89a34d5eb
    // Let's try to query it directly
    const orphan = await gql(`{ customDomain(id: "5496bf9e-a0b5-402a-96ac-ede89a34d5eb") { id domain status { certificateStatus } } }`);
    console.log('Orphan query:', JSON.stringify(orphan));
    
    // Let's also check the northstarmedic.com domain that was "added" before
    // It showed id in fix_domains_v3.js output - let me check the deployment's staticUrl context
    console.log('\n=== Deployment details ===');
    const dep = await gql(`{ deployments(input: { serviceId: "5436d4eb-9ab5-4f25-b42d-5e6783f103d9", environmentId: "${ENV}" }, first: 3) { edges { node { id status staticUrl createdAt } } } }`);
    for (const e of dep.data?.deployments?.edges || []) {
        const n = e.node;
        console.log(`  ${n.status} | ${n.createdAt} | URL: ${n.staticUrl}`);
    }
}

run().catch(e => console.error(e));
