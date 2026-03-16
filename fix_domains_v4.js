const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    
    const SVC = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9'; // northstar-website
    const ENV = '7eeb15ef-533b-414d-90b2-05c7b3f30961';
    const PROJ = '0a1d83d6-dd26-4305-9163-b06da174c4fb';

    async function gql(query) {
        const r = await fetch('https://backboard.railway.com/graphql/v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ query })
        });
        return (await r.json());
    }

    // Step 1: Create a Railway subdomain
    console.log('Step 1: Creating Railway subdomain for northstar-website...');
    const sd = await gql(`mutation { serviceDomainCreate(input: { serviceId: "${SVC}", environmentId: "${ENV}" }) { id domain } }`);
    if (sd.data?.serviceDomainCreate) {
        console.log('  Created:', sd.data.serviceDomainCreate.domain);
    } else {
        console.log('  Result:', JSON.stringify(sd.errors?.[0]?.message || sd));
    }

    // Step 2: Add northstarmedic.com (naked)
    console.log('\nStep 2: Adding northstarmedic.com...');
    const naked = await gql(`mutation { customDomainCreate(input: { domain: "northstarmedic.com", serviceId: "${SVC}", environmentId: "${ENV}", projectId: "${PROJ}" }) { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`);
    if (naked.data?.customDomainCreate) {
        const d = naked.data.customDomainCreate;
        console.log('  Added:', d.domain, '(id:', d.id + ')');
        console.log('  SSL:', d.status?.certificateStatus);
        for (const r of d.status?.dnsRecords || []) {
            console.log('  DNS:', r.hostlabel || '@', r.recordType, '->', r.requiredValue, '|', r.status);
        }
    } else {
        console.log('  Error:', JSON.stringify(naked.errors?.[0]?.message || naked));
    }

    // Step 3: Add www
    console.log('\nStep 3: Adding www.northstarmedic.com...');
    const www = await gql(`mutation { customDomainCreate(input: { domain: "www.northstarmedic.com", serviceId: "${SVC}", environmentId: "${ENV}", projectId: "${PROJ}" }) { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`);
    if (www.data?.customDomainCreate) {
        const d = www.data.customDomainCreate;
        console.log('  Added:', d.domain, '(id:', d.id + ')');
        console.log('  SSL:', d.status?.certificateStatus);
        for (const r of d.status?.dnsRecords || []) {
            console.log('  DNS:', r.hostlabel || 'www', r.recordType, '->', r.requiredValue, '|', r.status);
        }
    } else {
        console.log('  Error:', JSON.stringify(www.errors?.[0]?.message || www));
    }

    // Step 4: Deploy status
    console.log('\nStep 4: Latest deploy for northstar-website...');
    const dep = await gql(`{ deployments(input: { serviceId: "${SVC}", environmentId: "${ENV}" }, first: 1) { edges { node { id status createdAt staticUrl } } } }`);
    const deploy = dep.data?.deployments?.edges?.[0]?.node;
    if (deploy) {
        console.log('  Status:', deploy.status);
        console.log('  Created:', deploy.createdAt);
        console.log('  URL:', deploy.staticUrl);
    }

    // Step 5: Verify
    console.log('\nStep 5: All domains on northstar-website...');
    const cd = await gql(`{ customDomains(projectId: "${PROJ}", serviceId: "${SVC}", environmentId: "${ENV}") { id domain status { certificateStatus } } }`);
    const sds = await gql(`{ serviceDomains(projectId: "${PROJ}", serviceId: "${SVC}", environmentId: "${ENV}") { id domain } }`);
    
    console.log('  Custom:', (cd.data?.customDomains || []).map(d => `${d.domain} (${d.status?.certificateStatus})`).join(', ') || 'none');
    console.log('  Railway:', (sds.data?.serviceDomains || []).map(d => d.domain).join(', ') || 'none');

    console.log('\n=== DNS CHANGES NEEDED ===');
    const nd = naked.data?.customDomainCreate?.status?.dnsRecords?.[0];
    if (nd) console.log(`Porkbun: ${nd.hostlabel || '@'} ${nd.recordType} -> ${nd.requiredValue}`);
    const wd = www.data?.customDomainCreate?.status?.dnsRecords?.[0];
    if (wd) console.log(`Porkbun: ${wd.hostlabel || 'www'} ${wd.recordType} -> ${wd.requiredValue}`);
    if (!wd) console.log('www: Still blocked by orphan domain. Contact Railway support or delete via dashboard.');
}

run().catch(e => console.error(e));
