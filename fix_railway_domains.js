// Railway Domain Fix Script
// Moves northstarmedic.com from northstar-app to northstar-website service
// Then forces SSL re-provisioning

const RAILWAY_TOKEN = process.argv[2];
const PROJECT_ID = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
const ENVIRONMENT_ID = '7eeb15ef-533b-414d-90b2-05c7b3f30961';
const NORTHSTAR_APP_SERVICE = '1f04bbfc-d8f8-4ec6-bda0-8c543697674a';
const NORTHSTAR_WEBSITE_SERVICE = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9';

async function gql(query, variables = {}) {
  const resp = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RAILWAY_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await resp.json();
  if (data.errors) {
    console.error('GraphQL Error:', JSON.stringify(data.errors, null, 2));
  }
  return data;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   RAILWAY DOMAIN FIX — SSL CERTIFICATE REPAIR  ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Step 1: List all custom domains on both services
  console.log('━━━ STEP 1: Listing domains on both services ━━━');
  
  const domainsQuery = `
    query {
      domains(
        projectId: "${PROJECT_ID}"
        environmentId: "${ENVIRONMENT_ID}"
        serviceId: "%SERVICE_ID%"
      ) {
        customDomains {
          id
          domain
          status {
            dnsRecords {
              requiredValue
              currentValue
              status
              hostlabel
              zone
            }
            certificateStatus
          }
        }
        serviceDomains {
          id
          domain
        }
      }
    }
  `;

  const appDomains = await gql(domainsQuery.replace('%SERVICE_ID%', NORTHSTAR_APP_SERVICE));
  console.log('\n  northstar-app domains:');
  if (appDomains.data?.domains?.customDomains) {
    for (const d of appDomains.data.domains.customDomains) {
      console.log(`    - ${d.domain} (ID: ${d.id})`);
      console.log(`      SSL: ${d.status?.certificateStatus || 'unknown'}`);
      if (d.status?.dnsRecords) {
        for (const dns of d.status.dnsRecords) {
          console.log(`      DNS: ${dns.hostlabel}.${dns.zone} → required: ${dns.requiredValue} | current: ${dns.currentValue} | status: ${dns.status}`);
        }
      }
    }
  }
  if (appDomains.data?.domains?.serviceDomains) {
    for (const d of appDomains.data.domains.serviceDomains) {
      console.log(`    - ${d.domain} (railway domain, ID: ${d.id})`);
    }
  }

  const webDomains = await gql(domainsQuery.replace('%SERVICE_ID%', NORTHSTAR_WEBSITE_SERVICE));
  console.log('\n  northstar-website domains:');
  if (webDomains.data?.domains?.customDomains) {
    for (const d of webDomains.data.domains.customDomains) {
      console.log(`    - ${d.domain} (ID: ${d.id})`);
      console.log(`      SSL: ${d.status?.certificateStatus || 'unknown'}`);
      if (d.status?.dnsRecords) {
        for (const dns of d.status.dnsRecords) {
          console.log(`      DNS: ${dns.hostlabel}.${dns.zone} → required: ${dns.requiredValue} | current: ${dns.currentValue} | status: ${dns.status}`);
        }
      }
    }
  }
  if (webDomains.data?.domains?.serviceDomains) {
    for (const d of webDomains.data.domains.serviceDomains) {
      console.log(`    - ${d.domain} (railway domain, ID: ${d.id})`);
    }
  }

  // Step 2: Delete northstarmedic.com from northstar-app
  console.log('\n━━━ STEP 2: Removing northstarmedic.com from northstar-app ━━━');
  const rootDomain = appDomains.data?.domains?.customDomains?.find(d => d.domain === 'northstarmedic.com');
  if (rootDomain) {
    console.log(`  Deleting domain ID: ${rootDomain.id}`);
    const delResult = await gql(`
      mutation {
        customDomainDelete(id: "${rootDomain.id}")
      }
    `);
    console.log('  Result:', JSON.stringify(delResult.data || delResult.errors));
  } else {
    console.log('  Root domain not found on northstar-app');
  }

  // Step 3: Also delete www.northstarmedic.com from northstar-website to re-add fresh
  console.log('\n━━━ STEP 3: Removing www.northstarmedic.com from northstar-website ━━━');
  const wwwDomain = webDomains.data?.domains?.customDomains?.find(d => d.domain === 'www.northstarmedic.com');
  if (wwwDomain) {
    console.log(`  Deleting domain ID: ${wwwDomain.id}`);
    const delResult = await gql(`
      mutation {
        customDomainDelete(id: "${wwwDomain.id}")
      }
    `);
    console.log('  Result:', JSON.stringify(delResult.data || delResult.errors));
  } else {
    console.log('  www domain not found on northstar-website');
  }

  // Step 4: Wait a moment for cleanup
  console.log('\n━━━ STEP 4: Waiting 3s for cleanup... ━━━');
  await new Promise(r => setTimeout(r, 3000));

  // Step 5: Add northstarmedic.com to northstar-website
  console.log('\n━━━ STEP 5: Adding northstarmedic.com → northstar-website ━━━');
  const addRoot = await gql(`
    mutation {
      customDomainCreate(input: {
        domain: "northstarmedic.com"
        projectId: "${PROJECT_ID}"
        environmentId: "${ENVIRONMENT_ID}"
        serviceId: "${NORTHSTAR_WEBSITE_SERVICE}"
      }) {
        id
        domain
        status {
          certificateStatus
        }
      }
    }
  `);
  console.log('  Result:', JSON.stringify(addRoot.data || addRoot.errors, null, 2));

  // Step 6: Add www.northstarmedic.com to northstar-website
  console.log('\n━━━ STEP 6: Adding www.northstarmedic.com → northstar-website ━━━');
  const addWww = await gql(`
    mutation {
      customDomainCreate(input: {
        domain: "www.northstarmedic.com"
        projectId: "${PROJECT_ID}"
        environmentId: "${ENVIRONMENT_ID}"
        serviceId: "${NORTHSTAR_WEBSITE_SERVICE}"
      }) {
        id
        domain
        status {
          certificateStatus
        }
      }
    }
  `);
  console.log('  Result:', JSON.stringify(addWww.data || addWww.errors, null, 2));

  // Step 7: Final verification
  console.log('\n━━━ STEP 7: Verifying final domain state ━━━');
  await new Promise(r => setTimeout(r, 2000));
  
  const finalDomains = await gql(domainsQuery.replace('%SERVICE_ID%', NORTHSTAR_WEBSITE_SERVICE));
  console.log('\n  northstar-website final domains:');
  if (finalDomains.data?.domains?.customDomains) {
    for (const d of finalDomains.data.domains.customDomains) {
      console.log(`    ✓ ${d.domain}`);
      console.log(`      SSL Status: ${d.status?.certificateStatus || 'provisioning...'}`);
      if (d.status?.dnsRecords) {
        for (const dns of d.status.dnsRecords) {
          console.log(`      DNS: ${dns.hostlabel || '@'}.${dns.zone} → ${dns.status} (required: ${dns.requiredValue}, current: ${dns.currentValue})`);
        }
      }
    }
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║           DOMAIN MIGRATION COMPLETE              ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  Both domains now on northstar-website service   ║');
  console.log('║  SSL should provision within 2-5 minutes         ║');
  console.log('║  Run this script again to check cert status      ║');
  console.log('╚══════════════════════════════════════════════════╝');
}

main().catch(console.error);
