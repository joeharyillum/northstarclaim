require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function main() {
  // Daily stats
  const r1 = await fetch('https://api.sendgrid.com/v3/stats?start_date=2025-01-01&end_date=2026-03-15', {
    headers: { 'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY }
  });
  const stats = await r1.json();
  const active = stats.filter(day => day.stats.some(s => s.metrics.requests > 0));
  
  console.log('═══ SENDGRID ACTIVITY HISTORY ═══\n');
  console.log('Date           | Requests | Delivered | Opens | Clicks | Bounces | Blocks | Spam');
  console.log('─'.repeat(90));
  active.forEach(day => {
    const m = day.stats[0].metrics;
    console.log(`${day.date}  |    ${String(m.requests).padStart(4)}   |     ${String(m.delivered).padStart(4)}  |  ${String(m.opens).padStart(4)} |   ${String(m.clicks).padStart(4)} |    ${String(m.bounces).padStart(4)} |   ${String(m.blocks).padStart(4)} |  ${String(m.spam_reports).padStart(4)}`);
  });

  // Category stats (shows what type of emails were sent)
  const r2 = await fetch('https://api.sendgrid.com/v3/categories/stats?start_date=2025-01-01&end_date=2026-03-15', {
    headers: { 'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY }
  });
  const catStats = await r2.json();
  if (Array.isArray(catStats) && catStats.length > 0) {
    console.log('\n═══ BY CATEGORY ═══');
    catStats.forEach(c => console.log(JSON.stringify(c)));
  }

  // Recent email activity (last messages)
  const r3 = await fetch('https://api.sendgrid.com/v3/messages?limit=20', {
    headers: { 'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY }
  });
  const messages = await r3.json();
  if (messages.messages && messages.messages.length > 0) {
    console.log('\n═══ RECENT MESSAGES ═══');
    messages.messages.forEach(m => {
      console.log(`${m.last_event_time} | ${m.status} | To: ${m.to_email} | Subject: ${m.subject} | From: ${m.from_email}`);
    });
  } else {
    console.log('\n(No recent message activity available via /v3/messages)');
  }

  // Suppressions (bounced/blocked emails)
  const r4 = await fetch('https://api.sendgrid.com/v3/suppression/blocks?limit=10', {
    headers: { 'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY }
  });
  const blocks = await r4.json();
  if (Array.isArray(blocks) && blocks.length > 0) {
    console.log('\n═══ RECENT BLOCKS (sample) ═══');
    blocks.slice(0, 5).forEach(b => {
      console.log(`${new Date(b.created * 1000).toISOString()} | ${b.email} | Reason: ${b.reason?.substring(0, 80)}`);
    });
    console.log(`... ${blocks.length} blocks returned`);
  }

  const r5 = await fetch('https://api.sendgrid.com/v3/suppression/bounces?limit=10', {
    headers: { 'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY }
  });
  const bounces = await r5.json();
  if (Array.isArray(bounces) && bounces.length > 0) {
    console.log('\n═══ RECENT BOUNCES (sample) ═══');
    bounces.slice(0, 5).forEach(b => {
      console.log(`${new Date(b.created * 1000).toISOString()} | ${b.email} | Reason: ${b.reason?.substring(0, 80)}`);
    });
    console.log(`... ${bounces.length} bounces returned`);
  }
}

main().catch(e => console.error('Error:', e));
