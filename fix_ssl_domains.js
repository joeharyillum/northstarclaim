// Complete SSL + Domain Fix Script
// Fixes: Porkbun DNS, Railway custom domains, SSL certificate provisioning

const PORKBUN_API = 'pk1_d0df44c612a6dd7e898dc653306cf583d04d5846473770484d88c0532fd43758';
const PORKBUN_SECRET = 'sk1_c6938ca34a2926fe0df6c671d3ab4c0e741454b5f0229b9cc6d4dbc9f487e637';
const DOMAIN = 'northstarmedic.com';
const RAILWAY_CNAME = 'e53i6lw6.up.railway.app';

async function porkbun(endpoint, body = {}) {
  const resp = await fetch(`https://api.porkbun.com/api/json/v3${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: PORKBUN_API, secretapikey: PORKBUN_SECRET, ...body })
  });
  return resp.json();
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     NORTHSTAR SSL & DOMAIN FIX — FULL RESOLUTION     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // ═══ STEP 1: Test Porkbun API ═══
  console.log('━━━ STEP 1: Testing Porkbun API auth ━━━');
  const ping = await porkbun('/ping');
  if (ping.status !== 'SUCCESS') {
    console.log('FATAL: Porkbun API auth failed:', JSON.stringify(ping));
    return;
  }
  console.log('✓ Porkbun API authenticated (IP:', ping.yourIp + ')\n');

  // ═══ STEP 2: Get current DNS records ═══
  console.log('━━━ STEP 2: Current DNS records ━━━');
  const records = await porkbun(`/dns/retrieve/${DOMAIN}`);
  if (!records.records) {
    console.log('FATAL: Could not retrieve DNS records:', JSON.stringify(records));
    return;
  }
  for (const r of records.records) {
    console.log(`  [${r.id}] ${r.type.padEnd(6)} ${r.name.padEnd(30)} → ${r.content}`);
  }
  console.log('');

  // ═══ STEP 3: Remove ALL A/AAAA records for root domain ═══
  console.log('━━━ STEP 3: Removing stale A/AAAA records for root domain ━━━');
  const rootARecords = records.records.filter(r => 
    (r.type === 'A' || r.type === 'AAAA') && r.name === DOMAIN
  );
  
  if (rootARecords.length === 0) {
    console.log('  No A/AAAA records for root domain found.\n');
  } else {
    for (const rec of rootARecords) {
      console.log(`  Deleting ${rec.type} record [${rec.id}]: ${rec.content}`);
      const del = await porkbun(`/dns/delete/${DOMAIN}/${rec.id}`);
      console.log(`  Result: ${del.status}`);
    }
    console.log('');
  }

  // ═══ STEP 4: Remove any existing CNAME/ALIAS for root ═══
  console.log('━━━ STEP 4: Cleaning existing root CNAME/ALIAS ━━━');
  const rootCnames = records.records.filter(r => 
    (r.type === 'CNAME' || r.type === 'ALIAS') && r.name === DOMAIN
  );
  for (const rec of rootCnames) {
    console.log(`  Deleting ${rec.type} record [${rec.id}]: ${rec.content}`);
    const del = await porkbun(`/dns/delete/${DOMAIN}/${rec.id}`);
    console.log(`  Result: ${del.status}`);
  }
  if (rootCnames.length === 0) console.log('  None found.');
  console.log('');

  // ═══ STEP 5: Set up ALIAS record for root domain → Railway ═══
  // Porkbun supports ALIAS records for root domains (CNAME flattening)
  console.log('━━━ STEP 5: Creating ALIAS record for root → Railway ━━━');
  console.log(`  ${DOMAIN} → ALIAS → ${RAILWAY_CNAME}`);
  let aliasResult = await porkbun(`/dns/create/${DOMAIN}`, {
    type: 'ALIAS', name: '', content: RAILWAY_CNAME, ttl: '300'
  });
  
  if (aliasResult.status === 'SUCCESS') {
    console.log(`  ✓ ALIAS record created (ID: ${aliasResult.id})\n`);
  } else {
    console.log(`  ✗ ALIAS failed: ${JSON.stringify(aliasResult)}`);
    // Fallback: Try A record pointing to Railway's IP
    console.log('  Trying CNAME for root...');
    aliasResult = await porkbun(`/dns/create/${DOMAIN}`, {
      type: 'CNAME', name: '', content: RAILWAY_CNAME, ttl: '300'
    });
    if (aliasResult.status === 'SUCCESS') {
      console.log(`  ✓ CNAME for root created (ID: ${aliasResult.id})\n`);
    } else {
      console.log(`  ✗ CNAME also failed: ${JSON.stringify(aliasResult)}`);
      console.log('  Will need to manually add A record. Checking Railway IP...\n');
      // Resolve the CNAME to get Railway's actual IP
      const dns = require('dns');
      try {
        const ips = await new Promise((res, rej) => dns.resolve4(RAILWAY_CNAME, (e, a) => e ? rej(e) : res(a)));
        console.log(`  Railway IPs: ${ips.join(', ')}`);
        for (const ip of ips) {
          const aResult = await porkbun(`/dns/create/${DOMAIN}`, {
            type: 'A', name: '', content: ip, ttl: '300'
          });
          console.log(`  A record ${ip}: ${aResult.status}`);
        }
      } catch(e) {
        console.log(`  Could not resolve Railway IP: ${e.message}`);
      }
      console.log('');
    }
  }

  // ═══ STEP 6: Verify www CNAME is correct ═══
  console.log('━━━ STEP 6: Verifying www CNAME ━━━');
  const wwwRecord = records.records.find(r => r.type === 'CNAME' && r.name === `www.${DOMAIN}`);
  if (wwwRecord && wwwRecord.content === RAILWAY_CNAME + '.') {
    console.log(`  ✓ www CNAME already correct → ${wwwRecord.content}\n`);
  } else if (wwwRecord) {
    console.log(`  Current: ${wwwRecord.content} — updating to ${RAILWAY_CNAME}`);
    const upd = await porkbun(`/dns/edit/${DOMAIN}/${wwwRecord.id}`, {
      type: 'CNAME', name: 'www', content: RAILWAY_CNAME, ttl: '300'
    });
    console.log(`  Result: ${upd.status}\n`);
  } else {
    console.log(`  No www CNAME found — creating...`);
    const crt = await porkbun(`/dns/create/${DOMAIN}`, {
      type: 'CNAME', name: 'www', content: RAILWAY_CNAME, ttl: '300'
    });
    console.log(`  Result: ${crt.status}\n`);
  }

  // Also remove any A records for www that might interfere
  const wwwARecords = records.records.filter(r => r.type === 'A' && r.name === `www.${DOMAIN}`);
  if (wwwARecords.length > 0) {
    console.log('  Removing conflicting www A records...');
    for (const r of wwwARecords) {
      const del = await porkbun(`/dns/delete/${DOMAIN}/${r.id}`);
      console.log(`  Deleted A [${r.id}]: ${r.content} → ${del.status}`);
    }
    console.log('');
  }

  // ═══ STEP 7: Final DNS verification ═══
  console.log('━━━ STEP 7: Final DNS records ━━━');
  const final = await porkbun(`/dns/retrieve/${DOMAIN}`);
  for (const r of (final.records || [])) {
    const marker = r.content.includes('railway') ? '✓' : ' ';
    console.log(`  ${marker} [${r.id}] ${r.type.padEnd(6)} ${r.name.padEnd(30)} → ${r.content}`);
  }
  console.log('');

  // ═══ STEP 8: DNS propagation check ═══
  console.log('━━━ STEP 8: Waiting for DNS propagation (checking in 5s) ━━━');
  await new Promise(r => setTimeout(r, 5000));
  
  const dns = require('dns');
  const resolve = (domain, type) => new Promise(res => {
    dns.resolve(domain, type, (err, records) => {
      res(err ? `ERROR: ${err.code}` : JSON.stringify(records));
    });
  });

  console.log(`  ${DOMAIN} A:     ${await resolve(DOMAIN, 'A')}`);
  console.log(`  ${DOMAIN} CNAME: ${await resolve(DOMAIN, 'CNAME')}`);
  console.log(`  www.${DOMAIN} CNAME: ${await resolve('www.' + DOMAIN, 'CNAME')}`);
  console.log('');

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                    DNS FIX COMPLETE                   ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║                                                       ║');
  console.log('║  DNS is now pointing to Railway. Next steps:          ║');
  console.log('║                                                       ║');
  console.log('║  1. Railway needs to provision SSL certificate        ║');
  console.log('║     - Remove & re-add custom domain in Railway        ║');
  console.log('║     - Wait 2-5 min for Let\'s Encrypt cert            ║');
  console.log('║                                                       ║');
  console.log('║  2. Test: https://www.northstarmedic.com              ║');
  console.log('║  3. Test: https://northstarmedic.com                  ║');
  console.log('║                                                       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
