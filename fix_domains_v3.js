const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const projectId = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
    const envId = '7eeb15ef-533b-414d-90b2-05c7b3f30961';

    async function gql(query) {
        const r = await fetch('https://backboard.railway.com/graphql/v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ query })
        });
        return (await r.json());
    }

    const services = {
        '1f04bbfc-d8f8-4ec6-bda0-8c543697674a': 'northstar-app',
        '5436d4eb-9ab5-4f25-b42d-5e6783f103d9': 'northstar-website'
    };

    for (const [svcId, name] of Object.entries(services)) {
        console.log(`\n=== ${name} (${svcId}) ===`);
        
        // Get recent deployments
        const deps = await gql(`{ deployments(input: { projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${envId}" }, first: 3) { edges { node { id status createdAt } } } }`);
        const deploys = deps.data?.deployments?.edges || [];
        console.log('Recent deployments:');
        for (const d of deploys) {
            console.log('  ', d.node.status, '-', d.node.createdAt, '(id:', d.node.id + ')');
        }

        // Get service domains
        const sdList = await gql(`{ serviceDomains(projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${envId}") { id domain } }`);
        const sds = sdList.data?.serviceDomains || [];
        console.log('Service domains:', sds.length > 0 ? sds.map(s => s.domain + ' (id:' + s.id + ')').join(', ') : 'NONE');

        // Get custom domains
        const cdList = await gql(`{ customDomains(projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${envId}") { id domain status { certificateStatus } } }`);
        const cds = cdList.data?.customDomains || [];
        console.log('Custom domains:', cds.length > 0 ? cds.map(c => c.domain + ' SSL:' + c.status?.certificateStatus + ' (id:' + c.id + ')').join(', ') : 'NONE');
    }

    // Try adding domains to northstar-website since that's what's running
    console.log('\n=== ATTEMPTING TO ADD DOMAINS TO northstar-website ===');
    const webSvc = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9';

    // First make sure it has a service domain
    console.log('Creating service domain...');
    const sd = await gql(`mutation { serviceDomainCreate(input: { serviceId: "${webSvc}", environmentId: "${envId}" }) { id domain } }`);
    console.log('  Result:', JSON.stringify(sd.data?.serviceDomainCreate || sd.errors?.[0]?.message));

    // Add www domain
    console.log('Adding www.northstarmedic.com...');
    const www = await gql(`mutation { customDomainCreate(input: { domain: "www.northstarmedic.com", serviceId: "${webSvc}", environmentId: "${envId}", projectId: "${projectId}" }) { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`);
    if (www.data?.customDomainCreate) {
        const d = www.data.customDomainCreate;
        console.log('  ✅', d.domain, 'SSL:', d.status?.certificateStatus);
        for (const r of d.status?.dnsRecords || []) {
            console.log('    DNS:', r.hostlabel || '@', r.recordType, '→', r.requiredValue);
        }
    } else {
        console.log('  ', www.errors?.[0]?.message || JSON.stringify(www));
    }

    // Add naked domain 
    console.log('Adding northstarmedic.com...');
    const naked = await gql(`mutation { customDomainCreate(input: { domain: "northstarmedic.com", serviceId: "${webSvc}", environmentId: "${envId}", projectId: "${projectId}" }) { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`);
    if (naked.data?.customDomainCreate) {
        const d = naked.data.customDomainCreate;
        console.log('  ✅', d.domain, 'SSL:', d.status?.certificateStatus);
        for (const r of d.status?.dnsRecords || []) {
            console.log('    DNS:', r.hostlabel || '@', r.recordType, '→', r.requiredValue);
        }
    } else {
        console.log('  ', naked.errors?.[0]?.message || JSON.stringify(naked));
    }
}

run().catch(e => console.error(e));
