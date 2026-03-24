const fs = require('fs');
const path = require('path');
const os = require('os');

const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
const token = cfg.user.token;

const PROJECT_ID = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
const ENV_ID = '7eeb15ef-533b-414d-90b2-05c7b3f30961';
const WEBSITE_SERVICE_ID = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9'; // northstar-website (main app)
const APP_SERVICE_ID = '1f04bbfc-d8f8-4ec6-bda0-8c543697674a'; // northstar-app

const PORKBUN_API = 'pk1_d0df44c612a6dd7e898dc653306cf583d04d5846473770484d88c0532fd43758';
const PORKBUN_SECRET = 'sk1_c6938ca34a2926fe0df6c671d3ab4c0e741454b5f0229b9cc6d4dbc9f487e637';

async function gql(query) {
  const r = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ query })
  });
  return r.json();
}

async function porkbun(endpoint, body = {}) {
  const r = await fetch('https://api.porkbun.com/api/json/v3' + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: PORKBUN_API, secretapikey: PORKBUN_SECRET, ...body })
  });
  return r.json();
}

async function getDomains(serviceId) {
  const q = `{domains(projectId:"${PROJECT_ID}",environmentId:"${ENV_ID}",serviceId:"${serviceId}"){customDomains{id domain status{certificateStatus dnsRecords{requiredValue currentValue status hostlabel zone}}}}}`;
  const r = await gql(q);
  return r.data?.domains?.customDomains || [];
}

async function deleteDomain(domainId) {
  const q = `mutation{customDomainDelete(id:"${domainId}")}`;
  return gql(q);
}

async function addDomain(domain, serviceId) {
  const q = `mutation{customDomainCreate(input:{domain:"${domain}",projectId:"${PROJECT_ID}",environmentId:"${ENV_ID}",serviceId:"${serviceId}"}){id domain status{certificateStatus dnsRecords{requiredValue currentValue status hostlabel zone}}}}`;
  return gql(q);
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  CONSOLIDATE BOTH DOMAINS → northstar-website (Hobby = 2 max)  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  // Step 1: Get current domains
  console.log('\n━━━ STEP 1: Current domain state ━━━');
  const websiteDomains = await getDomains(WEBSITE_SERVICE_ID);
  const appDomains = await getDomains(APP_SERVICE_ID);

  console.log('  northstar-website:', websiteDomains.map(d => d.domain).join(', ') || 'none');
  console.log('  northstar-app:', appDomains.map(d => d.domain).join(', ') || 'none');

  // Step 2: Delete www from northstar-app
  const wwwOnApp = appDomains.find(d => d.domain === 'www.northstarmedic.com');
  if (wwwOnApp) {
    console.log('\n━━━ STEP 2: Remove www.northstarmedic.com from northstar-app ━━━');
    const del = await deleteDomain(wwwOnApp.id);
    console.log('  Deleted:', JSON.stringify(del.data));
  } else {
    console.log('\n━━━ STEP 2: www.northstarmedic.com NOT on northstar-app (skip) ━━━');
  }

  // Step 3: Wait
  console.log('\n━━━ STEP 3: Wait 5s for cleanup... ━━━');
  await new Promise(r => setTimeout(r, 5000));

  // Step 4: Add www to northstar-website (which should now accept 2nd domain on Hobby)
  console.log('\n━━━ STEP 4: Add www.northstarmedic.com → northstar-website ━━━');
  const addResult = await addDomain('www.northstarmedic.com', WEBSITE_SERVICE_ID);

  if (addResult.errors) {
    console.log('  ERROR:', JSON.stringify(addResult.errors, null, 2));
    console.log('\n  ⚠ Cannot add 2nd domain. Plan may not allow it.');
    console.log('  Current plan: HOBBY (should allow 2 custom domains per service)');
    console.log('  If this fails, upgrade plan or contact Railway support.');
    return;
  }

  const wwwDomain = addResult.data.customDomainCreate;
  console.log('  ✓ Added! ID:', wwwDomain.id);
  console.log('  SSL:', wwwDomain.status.certificateStatus);

  const wwwDns = wwwDomain.status.dnsRecords?.[0];
  if (wwwDns) {
    console.log('  DNS Required:', wwwDns.hostlabel + '.' + wwwDns.zone, '→', wwwDns.requiredValue);
    console.log('  DNS Current:', wwwDns.currentValue || '(not detected yet)');

    // Step 5: Update Porkbun CNAME if needed
    if (wwwDns.requiredValue && wwwDns.currentValue !== wwwDns.requiredValue) {
      console.log('\n━━━ STEP 5: Update Porkbun www CNAME ━━━');
      
      // Delete old www CNAME
      const records = await porkbun('/dns/retrieve/northstarmedic.com');
      const oldWww = (records.records || []).find(r => r.type === 'CNAME' && r.name === 'www.northstarmedic.com');
      if (oldWww) {
        await porkbun('/dns/delete/northstarmedic.com/' + oldWww.id);
        console.log('  Deleted old www CNAME (was:', oldWww.content + ')');
      }

      // Create new www CNAME
      const create = await porkbun('/dns/create/northstarmedic.com', {
        type: 'CNAME', name: 'www', content: wwwDns.requiredValue, ttl: '300'
      });
      console.log('  Created www CNAME → ' + wwwDns.requiredValue + ' (' + create.status + ')');
    } else {
      console.log('\n━━━ STEP 5: www CNAME already correct (skip) ━━━');
    }
  }

  // Step 6: Also check root domain ALIAS is correct
  console.log('\n━━━ STEP 6: Verify root domain ALIAS ━━━');
  const updatedWebsite = await getDomains(WEBSITE_SERVICE_ID);
  const rootDomain = updatedWebsite.find(d => d.domain === 'northstarmedic.com');
  if (rootDomain) {
    const rootDns = rootDomain.status.dnsRecords?.[0];
    console.log('  Root DNS Required:', rootDns?.requiredValue);
    
    // Check if ALIAS points to the right place
    const records = await porkbun('/dns/retrieve/northstarmedic.com');
    const alias = (records.records || []).find(r => r.type === 'ALIAS');
    if (alias) {
      console.log('  Current ALIAS:', alias.content);
      if (alias.content !== rootDns?.requiredValue) {
        console.log('  ⚠ Mismatch! Updating ALIAS...');
        await porkbun('/dns/delete/northstarmedic.com/' + alias.id);
        const create = await porkbun('/dns/create/northstarmedic.com', {
          type: 'ALIAS', name: '', content: rootDns.requiredValue, ttl: '300'
        });
        console.log('  Updated ALIAS → ' + rootDns.requiredValue + ' (' + create.status + ')');
      } else {
        console.log('  ✓ ALIAS matches');
      }
    }
  }

  // Step 7: Final state
  console.log('\n━━━ STEP 7: Final domain state ━━━');
  const finalWebsite = await getDomains(WEBSITE_SERVICE_ID);
  const finalApp = await getDomains(APP_SERVICE_ID);

  console.log('\n  northstar-website:');
  for (const d of finalWebsite) {
    console.log('    ' + d.domain);
    console.log('      SSL: ' + d.status.certificateStatus);
    for (const dns of d.status.dnsRecords || []) {
      console.log('      DNS: ' + dns.hostlabel + '.' + dns.zone + ' → ' + dns.requiredValue + ' (' + dns.status + ')');
    }
  }

  console.log('\n  northstar-app:');
  if (finalApp.length === 0) console.log('    (no custom domains)');
  for (const d of finalApp) {
    console.log('    ' + d.domain);
  }

  // Step 8: Verify DNS records one more time
  console.log('\n━━━ STEP 8: Final DNS records ━━━');
  const allRecords = await porkbun('/dns/retrieve/northstarmedic.com');
  for (const rec of (allRecords.records || [])) {
    if (['ALIAS', 'CNAME', 'A', 'AAAA', 'TXT'].includes(rec.type)) {
      console.log('  ' + rec.type.padEnd(6) + rec.name.padEnd(40) + '→ ' + rec.content.substring(0, 60));
    }
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  DONE! Both domains on northstar-website.                       ║');
  console.log('║  SSL should provision within 1 hour (per Railway docs).         ║');
  console.log('║  Run check_ssl_status.js to monitor cert status.               ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
}

main().catch(e => console.error('FATAL:', e));
