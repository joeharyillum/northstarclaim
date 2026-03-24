const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.join(os.homedir(), '.railway', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const token = config.user.token;

const PROJECT_ID = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
const ENV_ID = '7eeb15ef-533b-414d-90b2-05c7b3f30961';
const WEBSITE_SERVICE_ID = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9';
const APP_SERVICE_ID = '1f04bbfc-d8f8-4ec6-bda0-8c543697674a';

async function gql(query) {
  const resp = await fetch('https://backboard.railway.app/graphql/v2', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return resp.json();
}

async function main() {
  // Step 1: Delete naked domain from northstar-app
  console.log('1. Deleting naked domain (northstarmedic.com) from northstar-app...');
  const delResult = await gql(`mutation { customDomainDelete(id: "d27662ef-7f4a-4fe0-83c5-22b8c1f41372") }`);
  console.log('   Result:', JSON.stringify(delResult));

  // Step 2: Re-add naked domain
  console.log('\n2. Re-adding northstarmedic.com to northstar-app...');
  const addResult = await gql(`mutation {
    customDomainCreate(input: {
      domain: "northstarmedic.com"
      environmentId: "${ENV_ID}"
      serviceId: "${APP_SERVICE_ID}"
      projectId: "${PROJECT_ID}"
    }) {
      id domain
      status {
        dnsRecords { currentValue fqdn hostlabel purpose recordType requiredValue status zone }
        certificateStatus
      }
    }
  }`);
  console.log('   Result:', JSON.stringify(addResult, null, 2));

  // Step 3: Check www domain status (already re-added)
  console.log('\n3. Checking www.northstarmedic.com status...');
  const wwwResult = await gql(`query {
    domains(projectId: "${PROJECT_ID}", environmentId: "${ENV_ID}", serviceId: "${WEBSITE_SERVICE_ID}") {
      customDomains {
        id domain
        status {
          dnsRecords { currentValue fqdn requiredValue status }
          certificateStatus
        }
      }
    }
  }`);
  console.log('   Result:', JSON.stringify(wwwResult, null, 2));

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('DNS CHANGES REQUIRED:');
  console.log('='.repeat(60));
  
  const wwwDomain = wwwResult?.data?.domains?.customDomains?.[0];
  if (wwwDomain) {
    const dns = wwwDomain.status.dnsRecords[0];
    console.log(`\n  www.northstarmedic.com:`);
    console.log(`    Record Type: CNAME`);
    console.log(`    Current Value: ${dns.currentValue}`);
    console.log(`    Required Value: ${dns.requiredValue}`);
    console.log(`    Needs Update: ${dns.currentValue !== dns.requiredValue ? 'YES ⚠️' : 'NO ✅'}`);
  }

  const nakedDomain = addResult?.data?.customDomainCreate;
  if (nakedDomain) {
    const dns = nakedDomain.status.dnsRecords[0];
    console.log(`\n  northstarmedic.com:`);
    console.log(`    Record Type: ${dns.recordType}`);
    console.log(`    Current Value: ${dns.currentValue || '(none)'}`);
    console.log(`    Required Value: ${dns.requiredValue}`);
    console.log(`    Needs Update: ${!dns.currentValue || dns.currentValue !== dns.requiredValue ? 'YES ⚠️' : 'NO ✅'}`);
  }
}

main().catch(console.error);
