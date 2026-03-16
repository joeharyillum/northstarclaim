// Clean up Gemini damage from SendGrid suppression lists
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const H = { 'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY, 'Content-Type': 'application/json' };

async function main() {
  // Delete ALL blocks
  console.log('Clearing blocks...');
  const r1 = await fetch('https://api.sendgrid.com/v3/suppression/blocks', {
    method: 'DELETE', headers: H, body: JSON.stringify({ delete_all: true })
  });
  console.log('Blocks clear:', r1.status, r1.status === 204 ? 'SUCCESS' : await r1.text());

  // Delete ALL bounces
  console.log('Clearing bounces...');
  const r2 = await fetch('https://api.sendgrid.com/v3/suppression/bounces', {
    method: 'DELETE', headers: H, body: JSON.stringify({ delete_all: true })
  });
  console.log('Bounces clear:', r2.status, r2.status === 204 ? 'SUCCESS' : await r2.text());

  // Verify clean
  const [blocks, bounces] = await Promise.all([
    fetch('https://api.sendgrid.com/v3/suppression/blocks?limit=10', { headers: H }).then(r => r.json()),
    fetch('https://api.sendgrid.com/v3/suppression/bounces?limit=10', { headers: H }).then(r => r.json()),
  ]);
  console.log('\nAfter cleanup:');
  console.log('Remaining blocks:', Array.isArray(blocks) ? blocks.length : '?');
  console.log('Remaining bounces:', Array.isArray(bounces) ? bounces.length : '?');
  console.log('\nSuppression lists cleaned. Reputation will recover over time.');
}
main().catch(e => console.error(e));
