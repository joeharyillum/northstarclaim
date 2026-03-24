const APIKEY = 'pk1_d0df44c612a6dd7e898dc653306cf583d04d5846473770484d88c0532fd43758';
const SECRET = 'sk1_c6938ca34a2926fe0df6c671d3ab4c0e741454b5f0229b9cc6d4dbc9f487e637';
const DOMAIN = 'northstarmedic.com';

async function porkbun(endpoint, body = {}) {
  const resp = await fetch(`https://api.porkbun.com/api/json/v3${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: APIKEY, secretapikey: SECRET, ...body })
  });
  return resp.json();
}

async function main() {
  // Step 1: Test auth
  console.log('1. Testing Porkbun API...');
  const ping = await porkbun('/ping');
  console.log('   ', JSON.stringify(ping));
  if (ping.status !== 'SUCCESS') { console.log('   AUTH FAILED - stopping'); return; }

  // Step 2: Get current DNS records
  console.log('\n2. Current DNS records:');
  const records = await porkbun(`/dns/retrieve/${DOMAIN}`);
  for (const r of records.records || []) {
    console.log(`   [${r.id}] ${r.type} ${r.name} -> ${r.content} (TTL:${r.ttl})`);
  }

  // Step 3: Update www CNAME
  console.log('\n3. Updating www CNAME to e53i6lw6.up.railway.app...');
  const wwwRecord = records.records?.find(r => r.type === 'CNAME' && r.name === `www.${DOMAIN}`);
  if (wwwRecord) {
    const update = await porkbun(`/dns/edit/${DOMAIN}/${wwwRecord.id}`, {
      type: 'CNAME', name: 'www', content: 'e53i6lw6.up.railway.app', ttl: '300'
    });
    console.log('   Result:', JSON.stringify(update));
  } else {
    const create = await porkbun(`/dns/create/${DOMAIN}`, {
      type: 'CNAME', name: 'www', content: 'e53i6lw6.up.railway.app', ttl: '300'
    });
    console.log('   Created:', JSON.stringify(create));
  }

  // Step 4: Fix naked domain
  console.log('\n4. Fixing root domain...');
  const aRecords = records.records?.filter(r => (r.type === 'A' || r.type === 'AAAA') && r.name === DOMAIN) || [];
  for (const a of aRecords) {
    console.log(`   Deleting ${a.type} [${a.id}]: ${a.content}`);
    const del = await porkbun(`/dns/delete/${DOMAIN}/${a.id}`);
    console.log('   ', JSON.stringify(del));
  }

  // Try ALIAS first, then CNAME
  console.log('   Adding ALIAS for root -> qa0t47op.up.railway.app');
  let alias = await porkbun(`/dns/create/${DOMAIN}`, {
    type: 'ALIAS', name: '', content: 'qa0t47op.up.railway.app', ttl: '300'
  });
  console.log('   ', JSON.stringify(alias));
  if (alias.status !== 'SUCCESS') {
    console.log('   Trying CNAME instead...');
    alias = await porkbun(`/dns/create/${DOMAIN}`, {
      type: 'CNAME', name: '', content: 'qa0t47op.up.railway.app', ttl: '300'
    });
    console.log('   ', JSON.stringify(alias));
  }

  // Step 5: Verify
  console.log('\n5. Updated DNS records:');
  const verify = await porkbun(`/dns/retrieve/${DOMAIN}`);
  for (const r of verify.records || []) {
    console.log(`   [${r.id}] ${r.type} ${r.name} -> ${r.content}`);
  }
  console.log('\nDONE - SSL should provision within a few minutes!');
}

main().catch(console.error);
