const fs = require('fs');
const path = require('path');
const os = require('os');

const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
const token = cfg.user.token;

const PROJECT_ID = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
const ENV_ID = '7eeb15ef-533b-414d-90b2-05c7b3f30961';
const WEBSITE_SERVICE_ID = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9';
const APP_SERVICE_ID = '1f04bbfc-d8f8-4ec6-bda0-8c543697674a';

async function gql(query) {
  const resp = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return resp.json();
}

async function main() {
  console.log('='.repeat(60));
  console.log('RAILWAY SSL/DOMAIN STATUS CHECK — ' + new Date().toISOString());
  console.log('='.repeat(60));

  // Check www domain
  const www = await gql(`query {
    domains(projectId: "${PROJECT_ID}", environmentId: "${ENV_ID}", serviceId: "${WEBSITE_SERVICE_ID}") {
      customDomains { id domain status { dnsRecords { currentValue requiredValue status } certificateStatus } }
    }
  }`);

  const wwwDomain = www?.data?.domains?.customDomains?.[0];
  if (wwwDomain) {
    const dns = wwwDomain.status.dnsRecords[0];
    console.log('\n1. www.northstarmedic.com (northstar-website service)');
    console.log('   DNS Current:  ' + dns.currentValue);
    console.log('   DNS Required: ' + dns.requiredValue);
    console.log('   DNS Status:   ' + dns.status);
    console.log('   SSL Status:   ' + wwwDomain.status.certificateStatus);
    console.log('   DNS Match:    ' + (dns.currentValue === dns.requiredValue ? 'YES ✅' : 'NO ❌'));
  } else {
    console.log('\n1. www.northstarmedic.com — NOT FOUND');
  }

  // Check naked domain
  const naked = await gql(`query {
    domains(projectId: "${PROJECT_ID}", environmentId: "${ENV_ID}", serviceId: "${APP_SERVICE_ID}") {
      customDomains { id domain status { dnsRecords { currentValue requiredValue status recordType } certificateStatus } }
    }
  }`);

  const nakedDomain = naked?.data?.domains?.customDomains?.[0];
  if (nakedDomain) {
    const dns = nakedDomain.status.dnsRecords[0];
    console.log('\n2. northstarmedic.com (northstar-app service)');
    console.log('   DNS Current:  ' + (dns.currentValue || '(none)'));
    console.log('   DNS Required: ' + dns.requiredValue);
    console.log('   DNS Status:   ' + dns.status);
    console.log('   SSL Status:   ' + nakedDomain.status.certificateStatus);
    console.log('   DNS Match:    ' + (dns.currentValue === dns.requiredValue ? 'YES ✅' : 'NO ❌'));
  } else {
    console.log('\n2. northstarmedic.com — NOT FOUND');
  }

  // Live test
  console.log('\n' + '='.repeat(60));
  console.log('LIVE CONNECTIVITY TEST');
  console.log('='.repeat(60));

  // Test Railway subdomain
  try {
    const r = await fetch('https://northstar-website-production.up.railway.app');
    console.log('\n   Railway subdomain: ' + r.status + ' ' + r.statusText + ' ✅');
  } catch (e) {
    console.log('\n   Railway subdomain: ERROR — ' + e.message);
  }

  // Test www with SSL
  try {
    const r = await fetch('https://www.northstarmedic.com');
    console.log('   www.northstarmedic.com (HTTPS): ' + r.status + ' ' + r.statusText + ' ✅');
  } catch (e) {
    console.log('   www.northstarmedic.com (HTTPS): ❌ ' + (e.cause?.code || e.message));
  }

  // Test naked with SSL
  try {
    const r = await fetch('https://northstarmedic.com');
    console.log('   northstarmedic.com (HTTPS): ' + r.status + ' ' + r.statusText + ' ✅');
  } catch (e) {
    console.log('   northstarmedic.com (HTTPS): ❌ ' + (e.cause?.code || e.message));
  }

  // Test without SSL verification
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  try {
    const r = await fetch('https://www.northstarmedic.com');
    console.log('   www (skip SSL verify): ' + r.status + ' ' + r.statusText);
  } catch (e) {
    console.log('   www (skip SSL verify): ERROR — ' + e.message);
  }

  // Check actual cert
  const tls = require('tls');
  const certCheck = (host) => new Promise((resolve) => {
    const sock = tls.connect(443, host, { rejectUnauthorized: false }, () => {
      const cert = sock.getPeerCertificate();
      resolve({ subject: cert.subject?.CN, issuer: cert.issuer?.CN, valid: sock.authorized });
      sock.end();
    });
    sock.on('error', (e) => resolve({ error: e.message }));
  });

  console.log('\n   SSL Cert on www.northstarmedic.com:');
  const wwwCert = await certCheck('www.northstarmedic.com');
  if (wwwCert.error) {
    console.log('     Error: ' + wwwCert.error);
  } else {
    console.log('     Subject: ' + wwwCert.subject);
    console.log('     Issuer:  ' + wwwCert.issuer);
    console.log('     Valid:   ' + wwwCert.valid);
    const match = wwwCert.subject?.includes('northstarmedic') || wwwCert.subject === 'www.northstarmedic.com';
    console.log('     Match:   ' + (match ? 'YES ✅' : 'NO ❌ (cert is for ' + wwwCert.subject + ')'));
  }

  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
