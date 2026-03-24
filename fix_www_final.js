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

    // Step 1: Delete the orphaned www domain
    console.log('Step 1: Deleting orphaned www.northstarmedic.com...');
    const del = await gql(`mutation { customDomainDelete(id: "5496bf9e-a0b5-402a-96ac-ede89a34d5eb") }`);
    console.log('  Delete result:', JSON.stringify(del.data || del.errors?.[0]?.message));

    // Wait for it to process
    console.log('  Waiting 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));

    // Step 2: Add www to northstar-website
    console.log('\nStep 2: Adding www.northstarmedic.com to northstar-website...');
    const www = await gql(`mutation { customDomainCreate(input: { domain: "www.northstarmedic.com", serviceId: "5436d4eb-9ab5-4f25-b42d-5e6783f103d9", environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961", projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb" }) { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`);
    if (www.data?.customDomainCreate) {
        const d = www.data.customDomainCreate;
        console.log('  ✅ Added:', d.domain);
        console.log('  SSL:', d.status?.certificateStatus);
        for (const r of d.status?.dnsRecords || []) {
            console.log('  DNS:', r.hostlabel || '@', r.recordType, '→', r.requiredValue, '| Status:', r.status);
        }
    } else {
        console.log('  Result:', JSON.stringify(www.errors?.[0]?.message || www));
    }

    // Step 3: Verify 
    console.log('\nStep 3: Verifying all domains on northstar-website...');
    const verify = await gql(`{ customDomains(projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb", serviceId: "5436d4eb-9ab5-4f25-b42d-5e6783f103d9", environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961") { id domain status { certificateStatus dnsRecords { requiredValue currentValue status hostlabel recordType } } } }`);
    const doms = verify.data?.customDomains || [];
    console.log('  Custom domains found:', doms.length);
    for (const d of doms) {
        console.log('  📌', d.domain, '(id:', d.id + ')');
        console.log('     SSL:', d.status?.certificateStatus);
        for (const r of d.status?.dnsRecords || []) {
            console.log('     DNS:', r.hostlabel || '@', r.recordType, '→', r.requiredValue);
            console.log('       Current:', r.currentValue || 'NOT SET');
            console.log('       Status:', r.status);
        }
    }

    const sd = await gql(`{ serviceDomains(projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb", serviceId: "5436d4eb-9ab5-4f25-b42d-5e6783f103d9", environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961") { id domain } }`);
    const sds = sd.data?.serviceDomains || [];
    console.log('\n  Railway subdomains:');
    for (const s of sds) console.log('    ', s.domain);
}

run().catch(e => console.error(e));
