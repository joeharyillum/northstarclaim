const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const projectId = '0a1d83d6-dd26-4305-9163-b06da174c4fb';

    async function gql(query) {
        const r = await fetch('https://backboard.railway.com/graphql/v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ query })
        });
        return (await r.json());
    }

    // Step 1: Delete the orphaned www domain (5496bf9e) that's stuck in VALIDATING
    console.log('STEP 1: Removing orphaned www.northstarmedic.com domain...');
    const del1 = await gql(`mutation { customDomainDelete(id: "5496bf9e-a0b5-402a-96ac-ede89a34d5eb", projectId: "${projectId}") }`);
    console.log('  Result:', JSON.stringify(del1.data || del1.errors?.[0]?.message));

    // Step 2: Create a service domain for northstar-app first
    const envId = '7eeb15ef-533b-414d-90b2-05c7b3f30961';
    const appSvc = '1f04bbfc-d8f8-4ec6-bda0-8c543697674a';

    console.log('\nSTEP 2: Creating service domain for northstar-app...');
    const sd = await gql(`mutation { serviceDomainCreate(input: { serviceId: "${appSvc}", environmentId: "${envId}" }) { id domain } }`);
    if (sd.data?.serviceDomainCreate) {
        console.log('  ✅ Service domain:', sd.data.serviceDomainCreate.domain);
    } else {
        console.log('  Result:', JSON.stringify(sd.errors?.[0]?.message || sd));
    }

    // Step 3: Now add www.northstarmedic.com to northstar-app (properly this time)
    console.log('\nSTEP 3: Adding www.northstarmedic.com to northstar-app...');
    const www = await gql(`mutation { customDomainCreate(input: { domain: "www.northstarmedic.com", serviceId: "${appSvc}", environmentId: "${envId}", projectId: "${projectId}" }) { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`);
    if (www.data?.customDomainCreate) {
        const d = www.data.customDomainCreate;
        console.log('  ✅ Added:', d.domain, '(id:', d.id + ')');
        console.log('  SSL:', d.status?.certificateStatus);
        for (const r of d.status?.dnsRecords || []) {
            console.log('  DNS REQUIRED:', r.hostlabel || '@', r.recordType, '→', r.requiredValue);
        }
    } else {
        console.log('  Result:', JSON.stringify(www.errors?.[0]?.message || www));
    }

    // Step 4: Add northstarmedic.com (naked) to northstar-app
    console.log('\nSTEP 4: Adding northstarmedic.com (naked) to northstar-app...');
    const naked = await gql(`mutation { customDomainCreate(input: { domain: "northstarmedic.com", serviceId: "${appSvc}", environmentId: "${envId}", projectId: "${projectId}" }) { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`);
    if (naked.data?.customDomainCreate) {
        const d = naked.data.customDomainCreate;
        console.log('  ✅ Added:', d.domain, '(id:', d.id + ')');
        console.log('  SSL:', d.status?.certificateStatus);
        for (const r of d.status?.dnsRecords || []) {
            console.log('  DNS REQUIRED:', r.hostlabel || '@', r.recordType, '→', r.requiredValue);
        }
    } else {
        console.log('  Result:', JSON.stringify(naked.errors?.[0]?.message || naked));
    }

    // Step 5: Verify final state
    console.log('\nSTEP 5: Verifying final state...');
    const verify = await gql(`{ customDomains(projectId: "${projectId}", serviceId: "${appSvc}", environmentId: "${envId}") { id domain status { certificateStatus dnsRecords { requiredValue currentValue status hostlabel recordType } } } }`);
    const doms = verify.data?.customDomains || [];
    console.log('  Found', doms.length, 'custom domains:');
    for (const d of doms) {
        console.log('  📌', d.domain, '- SSL:', d.status?.certificateStatus);
        for (const r of d.status?.dnsRecords || []) {
            console.log('    ', r.hostlabel || '@', r.recordType, '→', r.requiredValue, '| Status:', r.status);
        }
    }

    // Service domains
    const svDoms = await gql(`{ serviceDomains(projectId: "${projectId}", serviceId: "${appSvc}", environmentId: "${envId}") { id domain } }`);
    console.log('\n  Railway subdomains:');
    for (const s of svDoms.data?.serviceDomains || []) {
        console.log('    ', s.domain);
    }

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  DNS SETUP — Go to Porkbun (or Cloudflare) and set:        ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  IMPORTANT: If using Cloudflare proxy (orange cloud):      ║');
    console.log('║  Cloudflare handles SSL → Railway doesnt need to issue cert║');
    console.log('║                                                             ║');
    console.log('║  If DNS-only (gray cloud / Porkbun direct):                ║');
    console.log('║  Railway MUST issue SSL cert → CNAME must point directly   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

run().catch(e => console.error(e));
