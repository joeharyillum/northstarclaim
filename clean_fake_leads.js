require('dotenv').config();

function isFake(lead) {
  const email = lead.email || '';
  const domain = email.split('@')[1] || '';
  const lastName = lead.last_name || '';
  return (
    domain.includes('example') ||
    email.startsWith('test-success') ||
    email.startsWith('executive@') ||
    lastName === 'Professional'
  );
}

async function delLead(id) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch('https://api.instantly.ai/api/v2/leads/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + process.env.INSTANTLY_API_KEY }
    });
    if (res.ok) return true;
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, 3000));
      continue;
    }
    return false;
  }
  return false;
}

async function cleanFakeLeads() {
  let deleted = 0;
  let kept = 0;
  let round = 0;
  const startTime = Date.now();

  console.log('=== FAKE LEAD CLEANUP ===');
  console.log('Removing: @example-medical.com, executive@, test-, Professional');
  console.log('');

  // Strategy: Fakes start around position 380+. 
  // After deleting fakes, the list shifts. So we repeatedly fetch
  // from the start and process whatever comes up.
  // We keep looping until a full pass finds zero fakes.

  while (true) {
    round++;
    let roundDeleted = 0;
    let cursor = null;

    while (true) {
      const body = { campaign_id: process.env.INSTANTLY_CAMPAIGN_ID, limit: 100 };
      if (cursor) body.starting_after = cursor;

      const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.INSTANTLY_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        if (res.status === 429) {
          console.log('Rate limited, waiting 5s...');
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        console.log('API error:', res.status);
        break;
      }

      const data = await res.json();
      const items = data.items || [];
      if (items.length === 0) break;

      // Delete fakes in parallel batches of 10
      const fakes = items.filter(isFake);
      const reals = items.filter(l => !isFake(l));
      
      // Delete fakes
      for (let i = 0; i < fakes.length; i += 10) {
        const batch = fakes.slice(i, i + 10);
        const results = await Promise.all(batch.map(l => delLead(l.id)));
        const successCount = results.filter(Boolean).length;
        deleted += successCount;
        roundDeleted += successCount;
      }

      kept = kept; // reals already counted in previous rounds
      
      // Set cursor to last real lead's id to advance past it
      if (reals.length > 0) {
        cursor = reals[reals.length - 1].id;
      } else {
        // All fakes in this batch - they're deleted, fetch from same position
        cursor = null;
      }

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      if (roundDeleted > 0 && roundDeleted % 500 < 10) {
        console.log('[' + elapsed + 's] Round ' + round + ' | Deleted so far: ' + deleted);
      }

      if (items.length < 100) break;
    }

    console.log('Round ' + round + ' complete: deleted ' + roundDeleted + ' fakes this round (total: ' + deleted + ')');

    if (roundDeleted === 0) {
      console.log('No more fakes found!');
      break;
    }
  }

  // Final count of remaining leads
  console.log('');
  console.log('Counting remaining real leads...');
  let remaining = 0;
  let countCursor = null;
  while (true) {
    const body = { campaign_id: process.env.INSTANTLY_CAMPAIGN_ID, limit: 100 };
    if (countCursor) body.starting_after = countCursor;
    const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.INSTANTLY_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    const items = data.items || [];
    if (items.length === 0) break;
    remaining += items.length;
    countCursor = items[items.length - 1].id;
    if (items.length < 100) break;
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);
  console.log('');
  console.log('=== CLEANUP COMPLETE ===');
  console.log('Fake leads deleted: ' + deleted);
  console.log('Real leads remaining: ' + remaining);
  console.log('Time: ' + totalTime + 's (' + Math.round(totalTime / 60) + ' min)');
}

cleanFakeLeads().catch(e => console.error('Fatal:', e));
