require('dotenv').config();

const CF_KEY = '9fb1e1e4951ea58c81ad3f4aca589f67b2e3b';
const CF_EMAIL = 'joeharyillum85@gmail.com';
const ZONE_ID = '2858e926c526fe75893143e6e54163b7';
const ACCOUNT_ID_PLACEHOLDER = 'NEED_TO_FIND';

const cfHeaders = { 'X-Auth-Key': CF_KEY, 'X-Auth-Email': CF_EMAIL, 'Content-Type': 'application/json' };

const WORKER_SCRIPT = `
export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'northstar-website-production.up.railway.app';
    
    const newRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'manual'
    });
    
    // Override the Host header to Railway's service domain
    const modifiedHeaders = new Headers(newRequest.headers);
    modifiedHeaders.set('Host', 'northstar-website-production.up.railway.app');
    modifiedHeaders.set('X-Forwarded-Host', request.headers.get('Host') || 'northstarmedic.com');
    
    return fetch(url.toString(), {
      method: request.method,
      headers: modifiedHeaders,
      body: request.body,
      redirect: 'manual'
    });
  }
};
`;

async function main() {
  // Step 1: Get account ID
  console.log('=== Step 1: Getting Cloudflare account ID ===');
  const accounts = await fetch('https://api.cloudflare.com/client/v4/accounts', {
    headers: cfHeaders
  }).then(r => r.json());
  
  const accountId = accounts.result?.[0]?.id;
  if (!accountId) {
    console.error('Could not get account ID:', JSON.stringify(accounts));
    return;
  }
  console.log('Account ID:', accountId);

  // Step 2: Create/update the Worker script
  console.log('\n=== Step 2: Creating Worker script ===');
  const workerName = 'northstar-proxy';
  
  const formData = new FormData();
  const metadata = JSON.stringify({
    main_module: 'worker.js',
    compatibility_date: '2024-01-01'
  });
  formData.append('metadata', new Blob([metadata], { type: 'application/json' }));
  formData.append('worker.js', new Blob([WORKER_SCRIPT], { type: 'application/javascript+module' }), 'worker.js');

  const workerResp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`, {
    method: 'PUT',
    headers: { 'X-Auth-Key': CF_KEY, 'X-Auth-Email': CF_EMAIL },
    body: formData
  }).then(r => r.json());
  console.log('Worker create:', workerResp.success ? 'SUCCESS' : `FAILED: ${JSON.stringify(workerResp.errors)}`);

  if (!workerResp.success) return;

  // Step 3: Create Worker route for the domain
  console.log('\n=== Step 3: Creating Worker routes ===');
  
  // First, check existing routes
  const existingRoutes = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/workers/routes`, {
    headers: cfHeaders
  }).then(r => r.json());
  console.log('Existing routes:', existingRoutes.result?.length || 0);
  
  // Delete old routes for our patterns
  for (const route of (existingRoutes.result || [])) {
    if (route.pattern.includes('northstarmedic.com')) {
      await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/workers/routes/${route.id}`, {
        method: 'DELETE', headers: cfHeaders
      });
      console.log('Deleted old route:', route.pattern);
    }
  }

  // Add route for root domain
  const route1 = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/workers/routes`, {
    method: 'POST', headers: cfHeaders,
    body: JSON.stringify({ pattern: 'northstarmedic.com/*', script: workerName })
  }).then(r => r.json());
  console.log('Root route:', route1.success ? 'CREATED' : `FAILED: ${JSON.stringify(route1.errors)}`);

  // Add route for www
  const route2 = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/workers/routes`, {
    method: 'POST', headers: cfHeaders,
    body: JSON.stringify({ pattern: 'www.northstarmedic.com/*', script: workerName })
  }).then(r => r.json());
  console.log('WWW route:', route2.success ? 'CREATED' : `FAILED: ${JSON.stringify(route2.errors)}`);

  console.log('\n=== Done! Testing in 5 seconds... ===');
  await new Promise(r => setTimeout(r, 5000));
  
  try {
    const test = await fetch('https://northstarmedic.com', { redirect: 'manual' });
    console.log('HTTP Status:', test.status);
    if (test.status === 200) {
      const html = await test.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      console.log('Title:', titleMatch?.[1] || 'No title found');
      console.log('Content length:', html.length);
    } else {
      console.log('Response:', await test.text().then(t => t.substring(0, 200)));
    }
  } catch (e) {
    console.log('Test error:', e.message);
  }
}

main().catch(console.error);
