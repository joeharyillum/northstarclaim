const fs = require('fs');
const path = require('path');
const os = require('os');
const tls = require('tls');

const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
const token = cfg.user.token;

async function gql(query) {
  const r = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ query })
  });
  return r.json();
}

function checkTLS(host) {
  return new Promise(res => {
    const s = tls.connect(443, '151.101.2.15', { servername: host, rejectUnauthorized: false }, () => {
      const c = s.getPeerCertificate();
      res({ cn: c.subject?.CN, alt: c.subjectaltname, auth: s.authorized });
      s.end();
    });
    s.setTimeout(5000);
    s.on('error', e => res({ error: e.message }));
    s.on('timeout', () => { s.destroy(); res({ error: 'timeout' }); });
  });
}

async function check() {
  const time = new Date().toLocaleTimeString();
  
  // Check Railway API status
  const results = [];
  for (const [name, sid] of [['website', '5436d4eb-9ab5-4f25-b42d-5e6783f103d9'], ['app', '1f04bbfc-d8f8-4ec6-bda0-8c543697674a']]) {
    const q = `{domains(projectId:"0a1d83d6-dd26-4305-9163-b06da174c4fb",environmentId:"7eeb15ef-533b-414d-90b2-05c7b3f30961",serviceId:"${sid}"){customDomains{domain status{certificateStatus}}}}`;
    const r = await gql(q);
    for (const d of r.data?.domains?.customDomains || []) {
      results.push({ domain: d.domain, ssl: d.status.certificateStatus });
    }
  }

  // Check actual TLS cert
  const rootTls = await checkTLS('northstarmedic.com');
  const wwwTls = await checkTLS('www.northstarmedic.com');

  const rootSSL = results.find(r => r.domain === 'northstarmedic.com');
  const wwwSSL = results.find(r => r.domain === 'www.northstarmedic.com');

  const rootDone = rootTls.cn && rootTls.cn !== '*.up.railway.app';
  const wwwDone = wwwTls.cn && wwwTls.cn !== '*.up.railway.app';

  console.log(`[${time}] ROOT: ${rootSSL?.ssl?.replace('CERTIFICATE_STATUS_TYPE_','')} | TLS: ${rootTls.cn || rootTls.error} ${rootDone ? '✅' : '⏳'}`);
  console.log(`[${time}] WWW:  ${wwwSSL?.ssl?.replace('CERTIFICATE_STATUS_TYPE_','')} | TLS: ${wwwTls.cn || wwwTls.error} ${wwwDone ? '✅' : '⏳'}`);

  if (rootDone && wwwDone) {
    console.log('\n🎉 BOTH SSL CERTS ISSUED! Site is live with HTTPS!');
    console.log('   https://northstarmedic.com');
    console.log('   https://www.northstarmedic.com');
    return true;
  }
  if (rootDone) console.log('  ✓ Root cert issued! Waiting for www...');
  if (wwwDone) console.log('  ✓ WWW cert issued! Waiting for root...');
  
  return false;
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log(' SSL CERT MONITOR — Polling every 60 seconds');
  console.log(' Railway says: "within 1 hour of DNS update"');
  console.log(' Press Ctrl+C to stop');
  console.log('═══════════════════════════════════════════════');
  
  for (let i = 0; i < 60; i++) { // max 60 checks (1 hour)
    const done = await check();
    if (done) break;
    console.log('---');
    await new Promise(r => setTimeout(r, 60000)); // wait 60s
  }
}

main().catch(console.error);
