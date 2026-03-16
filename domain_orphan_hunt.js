const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const PROJ = '0a1d83d6-dd26-4305-9163-b06da174c4fb';

    async function gql(query) {
        const r = await fetch('https://backboard.railway.com/graphql/v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ query })
        });
        return (await r.json());
    }

    // Query orphan with projectId
    console.log('=== Orphan domain query ===');
    const orphan = await gql(`{ customDomain(id: "5496bf9e-a0b5-402a-96ac-ede89a34d5eb", projectId: "${PROJ}") { id domain status { certificateStatus dnsRecords { requiredValue currentValue hostlabel recordType status } } } }`);
    console.log(JSON.stringify(orphan, null, 2));

    // Try to get ALL domains at project level - use introspection to find the right query
    console.log('\n=== Project domains ===');
    const projDomains = await gql(`{ project(id: "${PROJ}") { name services { edges { node { id name serviceInstances(environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961") { edges { node { domains { customDomains { id domain status { certificateStatus } } serviceDomains { id domain } } } } } } } } } }`);
    
    if (projDomains.errors) {
        console.log('Error:', JSON.stringify(projDomains.errors[0].message));
        
        // Try simpler nested approach  
        const proj2 = await gql(`{ project(id: "${PROJ}") { name services { edges { node { id name } } } } }`);
        console.log('Project:', proj2.data?.project?.name);
    } else {
        const services = projDomains.data?.project?.services?.edges || [];
        for (const svc of services) {
            const n = svc.node;
            console.log(`\n  ${n.name}:`);
            const instances = n.serviceInstances?.edges || [];
            for (const inst of instances) {
                const doms = inst.node?.domains;
                if (doms) {
                    for (const d of doms.customDomains || []) {
                        console.log(`    Custom: ${d.domain} (${d.id}) SSL: ${d.status?.certificateStatus}`);
                    }
                    for (const d of doms.serviceDomains || []) {
                        console.log(`    Railway: ${d.domain} (${d.id})`);
                    }
                }
            }
        }
    }

    // Also try to get amount of domains used by checking the plan usage
    console.log('\n=== Checking subscription/usage ===');
    const usage = await gql(`{ me { customer { billingPeriodEnd state } resourceAccess { project(id: "${PROJ}") { customDomainsPerService databaseDeployment } } } }`);
    console.log(JSON.stringify(usage, null, 2));
    
    // Try a totally different approach - use the Railway CLI-style query
    console.log('\n=== All custom domains via project ===');
    const allCD = await gql(`{ allCustomDomains(projectId: "${PROJ}", environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961") { id domain serviceId status { certificateStatus } } }`);
    console.log(JSON.stringify(allCD, null, 2));
}

run().catch(e => console.error(e));
