const fs = require('fs'), path = require('path'), os = require('os');
require('dotenv').config();

const token = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8')).user.token;
const CF_KEY = '9fb1e1e4951ea58c81ad3f4aca589f67b2e3b';
const CF_EMAIL = 'joeharyillum85@gmail.com';
const ZONE_ID = '2858e926c526fe75893143e6e54163b7';
const ROOT_ID = 'f609d8ac57519653064b3fd23a2d0c99';
const WWW_ID = 'b491af97d46ddf528d1ad025edfaba82';
const RAILWAY_SERVICE_DOMAIN = 'northstar-website-production.up.railway.app';
const DOMAIN_ID = 'b5348b80-19ea-4e58-809a-88fed30920bf';

const cfHeaders = { 'X-Auth-Key': CF_KEY, 'X-Auth-Email': CF_EMAIL, 'Content-Type': 'application/json' };

async function railwayGql(query, variables = {}) {
  const res = await fetch('https://backboard.railway.app/graphql/v2', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  return res.json();
}

async function main() {
  // Step 1: Delete custom domain from Railway (it won't verify due to Cloudflare CNAME flattening)
  console.log('=== Step 1: Delete custom domain from Railway ===');
  const del = await railwayGql(`mutation { customDomainDelete(id: "${DOMAIN_ID}") }`);
  console.log('Delete result:', JSON.stringify(del));

  // Step 2: Update Cloudflare CNAMEs to point to Railway service domain (not custom domain target)
  console.log('\n=== Step 2: Update Cloudflare CNAMEs to service domain ===');
  const r1 = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${ROOT_ID}`, {
    method: 'PATCH', headers: cfHeaders,
    body: JSON.stringify({ content: RAILWAY_SERVICE_DOMAIN, proxied: true })
  }).then(r => r.json());
  console.log('Root:', r1.success ? `CNAME → ${RAILWAY_SERVICE_DOMAIN} (proxied)` : `FAILED: ${JSON.stringify(r1.errors)}`);

  const r2 = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${WWW_ID}`, {
    method: 'PATCH', headers: cfHeaders,
    body: JSON.stringify({ content: RAILWAY_SERVICE_DOMAIN, proxied: true })
  }).then(r => r.json());
  console.log('WWW:', r2.success ? `CNAME → ${RAILWAY_SERVICE_DOMAIN} (proxied)` : `FAILED: ${JSON.stringify(r2.errors)}`);

  // Step 3: Set SSL mode to Full
  const ssl = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/ssl`, {
    method: 'PATCH', headers: cfHeaders,
    body: JSON.stringify({ value: 'full' })
  }).then(r => r.json());
  console.log('SSL Mode:', ssl.success ? ssl.result.value : 'FAILED');

  // Step 4: Create Cloudflare Origin Rule to change Host header to Railway service domain
  // This is the key — Railway will see Host: northstar-website-production.up.railway.app
  // instead of Host: northstarmedic.com, so it routes correctly
  console.log('\n=== Step 3: Create Cloudflare Origin Rule (Host header override) ===');
  
  // First check existing rulesets
  const rulesets = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rulesets?phase=http_request_origin`, {
    headers: cfHeaders
  }).then(r => r.json());
  console.log('Existing origin rulesets:', rulesets.result?.length || 0);

  // Create/update origin rule
  const originRule = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rulesets/phases/http_request_origin/entrypoint`, {
    method: 'PUT', headers: cfHeaders,
    body: JSON.stringify({
      rules: [{
        expression: '(http.host eq "northstarmedic.com") or (http.host eq "www.northstarmedic.com")',
        description: 'Route to Railway service',
        action: 'route',
        action_parameters: {
          host_header: RAILWAY_SERVICE_DOMAIN,
          origin: {
            host: RAILWAY_SERVICE_DOMAIN
          }
        }
      }]
    })
  }).then(r => r.json());
  console.log('Origin Rule:', JSON.stringify(originRule, null, 2));
}

main().catch(console.error);
