// Quick lead counter — resilient with retries
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const API = process.env.INSTANTLY_API_KEY;
const CID = process.env.INSTANTLY_CAMPAIGN_ID;

let total = 0, startingKey = '', retries = 0;

async function fetchPage(startKey) {
  const body = { campaign_id: CID, limit: 100 };
  if (startKey) body.starting_after = startKey;
  
  const r = await fetch('https://api.instantly.ai/api/v2/leads/list', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + API, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (r.status === 429) {
    retries++;
    const wait = Math.min(retries * 2000, 30000);
    await new Promise(ok => setTimeout(ok, wait));
    return fetchPage(startKey);
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
  retries = Math.max(0, retries - 1);
  return r.json();
}

async function run() {
  const t0 = Date.now();
  console.log('Counting leads...');
  
  while (true) {
    const data = await fetchPage(startingKey);
    const items = data.items || data;
    if (!Array.isArray(items) || items.length === 0) break;
    
    total += items.length;
    startingKey = items[items.length - 1]?.id || '';
    
    if (total % 10000 === 0) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
      console.log(`  ${total.toLocaleString()} leads | ${elapsed}s`);
    }
    
    await new Promise(ok => setTimeout(ok, 30)); // small safety delay
  }
  
  console.log(`\n=== TOTAL LEADS: ${total.toLocaleString()} ===`);
  console.log(`Time: ${((Date.now() - t0) / 1000 / 60).toFixed(1)} minutes`);
}

run().catch(e => console.error('FATAL:', e));
