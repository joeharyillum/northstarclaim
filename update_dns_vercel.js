// Update Cloudflare DNS to point northstarmedic.com to Vercel
// Vercel requires: A @ -> 76.76.21.21, CNAME www -> cname.vercel-dns.com
// Proxy OFF (DNS only) so Vercel can handle SSL

const CF_API_KEY = '9fb1e1e4951ea58c81ad3f4aca589f67b2e3b';
const CF_EMAIL = 'joeharyillum85@gmail.com';
const DOMAIN = 'northstarmedic.com';

async function cfApi(path, method = 'GET', body = null) {
    const opts = {
        method,
        headers: {
            'X-Auth-Key': CF_API_KEY,
            'X-Auth-Email': CF_EMAIL,
            'Content-Type': 'application/json',
        },
    };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch('https://api.cloudflare.com/client/v4' + path, opts);
    return r.json();
}

async function run() {
    // 1. Get Zone ID
    console.log('Step 1: Finding zone for', DOMAIN);
    const zones = await cfApi('/zones?name=' + DOMAIN);
    if (!zones.success || !zones.result?.length) {
        console.error('Zone not found:', JSON.stringify(zones.errors || zones));
        return;
    }
    const zoneId = zones.result[0].id;
    console.log('  Zone ID:', zoneId);

    // 2. List current DNS records
    console.log('\nStep 2: Current DNS records');
    const records = await cfApi('/zones/' + zoneId + '/dns_records');
    for (const r of records.result || []) {
        console.log(`  ${r.type.padEnd(6)} ${r.name.padEnd(30)} -> ${r.content.padEnd(30)} proxy:${r.proxied}`);
    }

    // 3. Delete existing root CNAME (Railway) then create A record for Vercel
    console.log('\nStep 3: Setting A record for @ -> 76.76.21.21 (DNS only)');
    const rootRecord = records.result?.find(r => (r.type === 'CNAME' || r.type === 'A') && r.name === DOMAIN);
    if (rootRecord && rootRecord.type === 'CNAME') {
        console.log('  Deleting old CNAME for @:', rootRecord.content);
        const del = await cfApi('/zones/' + zoneId + '/dns_records/' + rootRecord.id, 'DELETE');
        console.log('  Deleted:', del.success ? 'YES' : JSON.stringify(del.errors));
    }
    if (rootRecord && rootRecord.type === 'A') {
        const update = await cfApi('/zones/' + zoneId + '/dns_records/' + rootRecord.id, 'PATCH', {
            type: 'A', name: '@', content: '76.76.21.21', proxied: false, ttl: 60,
        });
        console.log('  Updated:', update.success ? 'YES' : JSON.stringify(update.errors));
    } else {
        const create = await cfApi('/zones/' + zoneId + '/dns_records', 'POST', {
            type: 'A', name: '@', content: '76.76.21.21', proxied: false, ttl: 60,
        });
        console.log('  Created:', create.success ? 'YES' : JSON.stringify(create.errors));
    }

    // 4. Find and update/create CNAME for www -> cname.vercel-dns.com
    console.log('\nStep 4: Setting CNAME www -> cname.vercel-dns.com (DNS only)');
    const wwwRecord = records.result?.find(r => (r.type === 'CNAME' || r.type === 'A') && r.name === 'www.' + DOMAIN);
    if (wwwRecord) {
        // Delete existing then create new (can't PATCH type change A->CNAME)
        if (wwwRecord.type === 'A') {
            await cfApi('/zones/' + zoneId + '/dns_records/' + wwwRecord.id, 'DELETE');
            console.log('  Deleted old A record for www');
        }
        if (wwwRecord.type === 'CNAME') {
            const update = await cfApi('/zones/' + zoneId + '/dns_records/' + wwwRecord.id, 'PATCH', {
                type: 'CNAME',
                name: 'www',
                content: 'cname.vercel-dns.com',
                proxied: false,
                ttl: 60,
            });
            console.log('  Updated:', update.success ? 'YES' : JSON.stringify(update.errors));
        } else {
            const create = await cfApi('/zones/' + zoneId + '/dns_records', 'POST', {
                type: 'CNAME',
                name: 'www',
                content: 'cname.vercel-dns.com',
                proxied: false,
                ttl: 60,
            });
            console.log('  Created:', create.success ? 'YES' : JSON.stringify(create.errors));
        }
    } else {
        const create = await cfApi('/zones/' + zoneId + '/dns_records', 'POST', {
            type: 'CNAME',
            name: 'www',
            content: 'cname.vercel-dns.com',
            proxied: false,
            ttl: 60,
        });
        console.log('  Created:', create.success ? 'YES' : JSON.stringify(create.errors));
    }

    // 5. Verify final state
    console.log('\nStep 5: Final DNS state');
    const final = await cfApi('/zones/' + zoneId + '/dns_records');
    for (const r of final.result || []) {
        const status = r.proxied ? 'PROXIED' : 'DNS-ONLY';
        console.log(`  ${r.type.padEnd(6)} ${r.name.padEnd(30)} -> ${r.content.padEnd(35)} ${status}`);
    }

    console.log('\nDone! DNS changes propagate in ~60 seconds.');
    console.log('Vercel will auto-issue SSL certificates once DNS is verified.');
}

run().catch(e => console.error('Error:', e));
