const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const projectId = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
    const envId = '7eeb15ef-533b-414d-90b2-05c7b3f30961'; // production
    const appServiceId = '1f04bbfc-d8f8-4ec6-bda0-8c543697674a'; // northstar-app

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  NORTHSTAR MEDIC — DOMAIN & SSL SETUP                      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // Step 1: First generate a service domain so the app is accessible
    console.log('STEP 1: Checking/creating service domain...\n');
    const sdRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `mutation { serviceDomainCreate(input: { serviceId: "${appServiceId}", environmentId: "${envId}" }) { id domain } }`
        })
    });
    const sdData = await sdRes.json();
    if (sdData.data?.serviceDomainCreate) {
        console.log('  ✅ Service domain created: ' + sdData.data.serviceDomainCreate.domain);
    } else if (sdData.errors) {
        console.log('  ℹ️  Service domain result:', sdData.errors[0]?.message || JSON.stringify(sdData.errors));
    }

    // Step 2: Add www.northstarmedic.com custom domain
    console.log('\nSTEP 2: Adding www.northstarmedic.com...\n');
    const wwwRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `mutation { customDomainCreate(input: { domain: "www.northstarmedic.com", serviceId: "${appServiceId}", environmentId: "${envId}", projectId: "${projectId}" }) { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`
        })
    });
    const wwwData = await wwwRes.json();
    if (wwwData.data?.customDomainCreate) {
        const d = wwwData.data.customDomainCreate;
        console.log('  ✅ Domain added: ' + d.domain);
        console.log('  SSL Status: ' + d.status?.certificateStatus);
        if (d.status?.dnsRecords) {
            for (const r of d.status.dnsRecords) {
                console.log(`  DNS REQUIRED: ${r.hostlabel} ${r.recordType} → ${r.requiredValue} (Status: ${r.status})`);
            }
        }
    } else {
        console.log('  Result:', JSON.stringify(wwwData.errors || wwwData, null, 2));
    }

    // Step 3: Add northstarmedic.com (naked domain)
    console.log('\nSTEP 3: Adding northstarmedic.com (naked domain)...\n');
    const nakedRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `mutation { customDomainCreate(input: { domain: "northstarmedic.com", serviceId: "${appServiceId}", environmentId: "${envId}", projectId: "${projectId}" }) { id domain status { certificateStatus dnsRecords { requiredValue hostlabel recordType status } } } }`
        })
    });
    const nakedData = await nakedRes.json();
    if (nakedData.data?.customDomainCreate) {
        const d = nakedData.data.customDomainCreate;
        console.log('  ✅ Domain added: ' + d.domain);
        console.log('  SSL Status: ' + d.status?.certificateStatus);
        if (d.status?.dnsRecords) {
            for (const r of d.status.dnsRecords) {
                console.log(`  DNS REQUIRED: ${r.hostlabel} ${r.recordType} → ${r.requiredValue} (Status: ${r.status})`);
            }
        }
    } else {
        console.log('  Result:', JSON.stringify(nakedData.errors || nakedData, null, 2));
    }

    // Step 4: Verify setup
    console.log('\nSTEP 4: Verifying domain setup...\n');
    const verifyRes = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
            query: `query { customDomains(projectId: "${projectId}", serviceId: "${appServiceId}", environmentId: "${envId}") { id domain status { certificateStatus dnsRecords { currentValue requiredValue status hostlabel recordType } } } }`
        })
    });
    const verifyData = await verifyRes.json();
    const domains = verifyData.data?.customDomains || [];

    if (domains.length > 0) {
        console.log(`  Found ${domains.length} custom domain(s):\n`);
        for (const d of domains) {
            console.log(`  📌 ${d.domain}`);
            console.log(`     SSL: ${d.status?.certificateStatus}`);
            if (d.status?.dnsRecords) {
                for (const r of d.status.dnsRecords) {
                    const statusIcon = r.status === 'DNS_RECORD_STATUS_VALID' ? '✅' : '❌';
                    console.log(`     ${statusIcon} DNS: ${r.hostlabel || '@'} → ${r.recordType} → ${r.requiredValue}`);
                    if (r.currentValue) console.log(`        Current: ${r.currentValue}`);
                    if (r.status !== 'DNS_RECORD_STATUS_VALID') {
                        console.log(`        ⚠️  ACTION NEEDED: Update DNS at Porkbun`);
                    }
                }
            }
        }
    } else {
        console.log('  ❌ No domains found after setup');
    }

    // Print DNS instructions
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  DNS CONFIGURATION INSTRUCTIONS (Porkbun)                   ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log('║  1. Go to porkbun.com → DNS Management → northstarmedic.com ║');
    console.log('║  2. Set these records:                                       ║');
    console.log('║                                                              ║');
    console.log('║  www  CNAME  → (value shown above from Railway)             ║');
    console.log('║  @    A/CNAME → (value shown above from Railway)            ║');
    console.log('║                                                              ║');
    console.log('║  3. DISABLE Cloudflare proxy (orange cloud OFF) if using CF ║');
    console.log('║     Railway needs direct DNS to issue SSL certs             ║');
    console.log('║                                                              ║');
    console.log('║  4. Wait 5-15 minutes for Railway to validate + issue cert  ║');
    console.log('║  5. Re-run: node check_domain_status.js to verify           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

run().catch(e => console.error(e));
