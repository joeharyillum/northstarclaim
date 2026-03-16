const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const projectId = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
    const envId = '7eeb15ef-533b-414d-90b2-05c7b3f30961';

    const allServices = [
        '1f04bbfc-d8f8-4ec6-bda0-8c543697674a', // northstar-app
        '5436d4eb-9ab5-4f25-b42d-5e6783f103d9', // northstar-website
        '5a365612-bbc2-478c-a3bf-f85da2f529ed', // Postgres
        'bcd8c665-3727-480f-aa14-a23a2ab4b95e', // Postgres-5kvm
        'e67f5f13-0679-48d3-ab6b-055355101cee', // Postgres-PL--
    ];

    console.log('Searching for orphaned custom domains across all services...\n');

    // Also try old environment ID
    const envIds = [envId, 'd9d7a080-2781-4e12-9ebd-ba8b268b5eda'];

    for (const eId of envIds) {
        for (const svcId of allServices) {
            const domRes = await fetch('https://backboard.railway.com/graphql/v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({
                    query: `query { customDomains(projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${eId}") { id domain status { certificateStatus } } }`
                })
            });
            const domData = await domRes.json();
            const domains = domData.data?.customDomains || [];
            if (domains.length > 0) {
                for (const d of domains) {
                    console.log(`Found: ${d.domain} (ID: ${d.id}) on service ${svcId} env ${eId}`);
                    console.log(`  SSL: ${d.status?.certificateStatus}`);
                }
            }
        }
    }

    // Also directly query the known domain ID
    console.log('\nDirect query for known domain ID 5496bf9e-a0b5-402a-96ac-ede89a34d5eb...');
    const directRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `query { customDomain(id: "5496bf9e-a0b5-402a-96ac-ede89a34d5eb", projectId: "${projectId}") { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`
        })
    });
    const directData = await directRes.json();
    if (directData.data?.customDomain) {
        const d = directData.data.customDomain;
        console.log(`  Domain: ${d.domain} | SSL: ${d.status?.certificateStatus}`);
        if (d.status?.dnsRecords) {
            for (const r of d.status.dnsRecords) {
                console.log(`  DNS: ${r.hostlabel} ${r.recordType} → ${r.requiredValue} | Status: ${r.status}`);
            }
        }
    }

    // Check service domains too
    console.log('\nService domains across all services:');
    for (const eId of envIds) {
        for (const svcId of allServices) {
            const sdRes = await fetch('https://backboard.railway.com/graphql/v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({
                    query: `query { serviceDomains(projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${eId}") { id domain } }`
                })
            });
            const sdData = await sdRes.json();
            const sds = sdData.data?.serviceDomains || [];
            for (const sd of sds) {
                console.log(`  ${svcId} (env: ${eId}): ${sd.domain} (ID: ${sd.id})`);
            }
        }
    }
}

run().catch(e => console.error(e));
