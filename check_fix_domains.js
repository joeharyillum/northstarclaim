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

    // 1. Check known www domain
    console.log('=== KNOWN DOMAIN (5496bf9e) ===');
    const d1 = await gql(`{ customDomain(id: "5496bf9e-a0b5-402a-96ac-ede89a34d5eb", projectId: "${projectId}") { id domain status { certificateStatus dnsRecords { currentValue requiredValue status hostlabel recordType } } } }`);
    const cd = d1.data?.customDomain;
    if (cd) {
        console.log('  Domain:', cd.domain);
        console.log('  SSL:', cd.status?.certificateStatus);
        for (const r of cd.status?.dnsRecords || []) {
            console.log('  DNS:', r.hostlabel, r.recordType, '→', r.requiredValue, '| Current:', r.currentValue || 'NONE', '| Status:', r.status);
        }
    }

    // 2. Check each service
    const svcNames = {
        '1f04bbfc-d8f8-4ec6-bda0-8c543697674a': 'northstar-app',
        '5436d4eb-9ab5-4f25-b42d-5e6783f103d9': 'northstar-website'
    };

    for (const [svcId, name] of Object.entries(svcNames)) {
        console.log(`\n=== Service: ${name} (${svcId}) ===`);

        // Service domains (auto-generated *.up.railway.app)
        const sd = await gql(`{ serviceDomains(projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${envId}") { id domain } }`);
        const sdoms = sd.data?.serviceDomains || [];
        if (sdoms.length > 0) {
            for (const s of sdoms) console.log('  Railway domain:', s.domain, '(id:', s.id + ')');
        } else {
            console.log('  No railway subdomain');
        }

        // Custom domains
        const cdr = await gql(`{ customDomains(projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${envId}") { id domain status { certificateStatus dnsRecords { requiredValue currentValue status hostlabel recordType } } } }`);
        const cdoms = cdr.data?.customDomains || [];
        if (cdoms.length > 0) {
            for (const c of cdoms) {
                console.log('  Custom domain:', c.domain, '(id:', c.id + ')');
                console.log('    SSL:', c.status?.certificateStatus);
                for (const r of c.status?.dnsRecords || []) {
                    console.log('    DNS:', r.hostlabel || '@', r.recordType, '→', r.requiredValue, '| Current:', r.currentValue || 'NONE', '| Status:', r.status);
                }
            }
        } else {
            console.log('  No custom domains');
        }
    }

    // 3. Try adding naked domain to northstar-app
    console.log('\n=== ATTEMPTING TO ADD northstarmedic.com TO northstar-app ===');
    const addResult = await gql(`mutation { customDomainCreate(input: { domain: "northstarmedic.com", serviceId: "1f04bbfc-d8f8-4ec6-bda0-8c543697674a", environmentId: "${envId}", projectId: "${projectId}" }) { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`);
    if (addResult.data?.customDomainCreate) {
        const d = addResult.data.customDomainCreate;
        console.log('  ✅ Added:', d.domain);
        console.log('  SSL:', d.status?.certificateStatus);
        for (const r of d.status?.dnsRecords || []) {
            console.log('  DNS:', r.hostlabel || '@', r.recordType, '→', r.requiredValue, '| Status:', r.status);
        }
    } else {
        console.log('  Result:', JSON.stringify(addResult.errors?.[0]?.message || addResult));
    }
}

run().catch(e => console.error(e));
