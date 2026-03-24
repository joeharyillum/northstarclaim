const https = require('https');

const BASE = 'https://northstarmedic.com';

const endpoints = [
  // Public pages
  { path: '/', name: 'Homepage' },
  { path: '/terms', name: 'Terms of Service' },
  { path: '/privacy', name: 'Privacy Policy' },
  { path: '/baa', name: 'BAA Agreement' },
  { path: '/auth/signin', name: 'Sign In Page' },
  
  // API endpoints
  { path: '/api/auth/providers', name: 'Auth Providers API' },
  { path: '/api/system/stats', name: 'System Stats API' },
  { path: '/api/claims', name: 'Claims API (GET)' },
  
  // Dashboard pages (will redirect to login if auth required)
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/dashboard/upload', name: 'Upload Page' },
  { path: '/dashboard/claims', name: 'My Claims' },
  { path: '/dashboard/war-room', name: 'War Room' },
  { path: '/dashboard/review', name: 'Review Page' },
  { path: '/dashboard/settlements', name: 'Settlements' },
];

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, BASE);
    const req = https.get(url.toString(), { 
      headers: { 'Host': 'northstarmedic.com' },
      timeout: 15000,
      rejectUnauthorized: true 
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const status = res.statusCode;
        const location = res.headers.location || '';
        let info = '';
        
        if (status === 200) {
          const title = data.match(/<title>(.*?)<\/title>/)?.[1];
          if (title) info = `Title: ${title.substring(0, 60)}`;
          else if (data.startsWith('{') || data.startsWith('[')) {
            try {
              const j = JSON.parse(data);
              info = `JSON keys: ${Object.keys(j).join(', ').substring(0, 60)}`;
            } catch { info = `Body: ${data.substring(0, 60)}`; }
          } else {
            info = `Body: ${data.substring(0, 60)}`;
          }
        } else if (status >= 300 && status < 400) {
          info = `→ ${location}`;
        } else {
          info = data.substring(0, 80);
        }
        
        const icon = status === 200 ? '✅' : status >= 300 && status < 400 ? '↪️' : '❌';
        console.log(`${icon} ${status} | ${endpoint.name.padEnd(22)} | ${info}`);
        resolve({ name: endpoint.name, status, ok: status < 400 });
      });
    });
    req.on('error', e => {
      console.log(`❌ ERR | ${endpoint.name.padEnd(22)} | ${e.message}`);
      resolve({ name: endpoint.name, status: 0, ok: false });
    });
    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ TMO | ${endpoint.name.padEnd(22)} | Timeout`);
      resolve({ name: endpoint.name, status: 0, ok: false });
    });
  });
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NORTHSTAR MEDIC — LIVE SYSTEM HEALTH CHECK');
  console.log('  Target: ' + BASE);
  console.log('  Time: ' + new Date().toISOString());
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  const results = [];
  for (const ep of endpoints) {
    const r = await checkEndpoint(ep);
    results.push(r);
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  const ok = results.filter(r => r.ok).length;
  const fail = results.filter(r => !r.ok).length;
  console.log(`  Results: ${ok} passed, ${fail} failed out of ${results.length}`);
  
  if (fail > 0) {
    console.log('  FAILED:');
    results.filter(r => !r.ok).forEach(r => console.log(`    ❌ ${r.name} (${r.status})`));
  }
  console.log('═══════════════════════════════════════════════════════════════');
}

main();
