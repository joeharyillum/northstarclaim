// Final DNS fix — update ALIAS to new Railway target
// Railway changed the CNAME from e53i6lw6 to t80gj0av after domain re-add

const PORKBUN_API = 'pk1_d0df44c612a6dd7e898dc653306cf583d04d5846473770484d88c0532fd43758';
const PORKBUN_SECRET = 'sk1_c6938ca34a2926fe0df6c671d3ab4c0e741454b5f0229b9cc6d4dbc9f487e637';
const DOMAIN = 'northstarmedic.com';
const NEW_RAILWAY_CNAME = 't80gj0av.up.railway.app';

async function porkbun(endpoint, body = {}) {
  const resp = await fetch(`https://api.porkbun.com/api/json/v3${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: PORKBUN_API, secretapikey: PORKBUN_SECRET, ...body })
  });
  return resp.json();
}

async function main() {
  console.log('=== Updating DNS to new Railway target ===\n');
  
  // Get current records
  const records = await porkbun(`/dns/retrieve/${DOMAIN}`);
  console.log('Current records:');
  for (const r of records.records || []) {
    console.log(`  [${r.id}] ${r.type} ${r.name} → ${r.content}`);
  }

  // 1. Delete old ALIAS for root (pointing to wrong target)
  const aliasRecords = records.records.filter(r => r.type === 'ALIAS' && r.name === DOMAIN);
  for (const r of aliasRecords) {
    console.log(`\nDeleting old ALIAS [${r.id}]: ${r.content}`);
    const del = await porkbun(`/dns/delete/${DOMAIN}/${r.id}`);
    console.log('  Result:', del.status);
  }

  // 2. Create new ALIAS pointing to correct Railway target
  console.log(`\nCreating ALIAS: ${DOMAIN} → ${NEW_RAILWAY_CNAME}`);
  const alias = await porkbun(`/dns/create/${DOMAIN}`, {
    type: 'ALIAS', name: '', content: NEW_RAILWAY_CNAME, ttl: '300'
  });
  console.log('  Result:', alias.status, alias.id ? `(ID: ${alias.id})` : '');

  // 3. Update www CNAME to also point to the new target
  const wwwCname = records.records.find(r => r.type === 'CNAME' && r.name === `www.${DOMAIN}`);
  if (wwwCname) {
    console.log(`\nUpdating www CNAME [${wwwCname.id}] → ${NEW_RAILWAY_CNAME}`);
    // Delete and recreate since Porkbun edit can be flaky
    await porkbun(`/dns/delete/${DOMAIN}/${wwwCname.id}`);
    const cname = await porkbun(`/dns/create/${DOMAIN}`, {
      type: 'CNAME', name: 'www', content: NEW_RAILWAY_CNAME, ttl: '300'
    });
    console.log('  Result:', cname.status, cname.id ? `(ID: ${cname.id})` : '');
  }

  // 4. Verify final state
  console.log('\n=== Final DNS Records ===');
  const final = await porkbun(`/dns/retrieve/${DOMAIN}`);
  for (const r of (final.records || [])) {
    console.log(`  [${r.id}] ${r.type.padEnd(6)} ${r.name.padEnd(30)} → ${r.content}`);
  }

  // 5. Quick DNS check
  console.log('\n=== DNS Resolution Check (after 3s) ===');
  await new Promise(r => setTimeout(r, 3000));
  const dns = require('dns');
  const resolve = (d, t) => new Promise(res => dns.resolve(d, t, (e, rr) => res(e ? e.code : rr)));
  
  const rootA = await resolve(DOMAIN, 'A');
  const wwwCnameCheck = await resolve(`www.${DOMAIN}`, 'CNAME');
  console.log(`  ${DOMAIN} A: ${JSON.stringify(rootA)}`);
  console.log(`  www.${DOMAIN} CNAME: ${JSON.stringify(wwwCnameCheck)}`);

  console.log('\n=== DONE ===');
  console.log('Root domain: northstarmedic.com → ALIAS → ' + NEW_RAILWAY_CNAME);
  console.log('WWW domain:  www.northstarmedic.com → CNAME → ' + NEW_RAILWAY_CNAME);
  console.log('\nRailway SSL cert is validating. Check back in ~2-5 min.');
  console.log('Note: Railway plan limits you to 1 custom domain. Root is primary.');
  console.log('www will resolve to same Railway IP but may need a redirect.');
}

main().catch(console.error);
