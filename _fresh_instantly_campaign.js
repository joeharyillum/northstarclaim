require('dotenv').config();
const fs = require('fs');

async function createCampaignAndUploadWhales() {
    const apiKey = process.env.INSTANTLY_API_KEY;

    console.log('🚀 Step 1: Creating fresh campaign...');
    
    // Create new campaign with required schedule
    const createRes = await fetch('https://api.instantly.ai/api/v2/campaigns', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: "NORTHSTAR WHALE OUTREACH",
            campaign_schedule: {
                schedules: [
                    {
                        name: "Normal Business Hours",
                        timing: {
                            from: "09:00",
                            to: "17:00"
                        },
                        timezone: "America/New_York",
                        days: [1, 1, 1, 1, 1, 0, 0] // Mon-Fri
                    }
                ]
            }
        })
    });
    
    const createData = await createRes.json();
    if (createRes.status !== 200 && createRes.status !== 201) {
        console.error('Failed to create campaign:', JSON.stringify(createData, null, 2));
        return;
    }
    
    const newCampaignId = createData.id;
    console.log(`✅ SUCCESS! New Campaign ID: ${newCampaignId}`);

    // Update .env
    let envFile = fs.readFileSync('.env', 'utf8');
    envFile = envFile.replace(/INSTANTLY_CAMPAIGN_ID=".+"/g, `INSTANTLY_CAMPAIGN_ID="${newCampaignId}"`);
    fs.writeFileSync('.env', envFile);
    
    console.log('✅ Updated .env with new Campaign ID');

    // ── STEP 2: Add sequence to campaign (Step 1 email) ──
    console.log('\n📝 Step 2: Adding Email Sequence...');
    await fetch('https://api.instantly.ai/api/v2/campaigns/'+newCampaignId+'/sequence', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            steps: [{
                day: 1,
                subject: "Recovering denied claims for {{companyName}}",
                variants: [{
                    subject: "Recovering denied claims for {{companyName}}",
                    body: "Hi {{firstName}},<br><br>As {{title}} at {{companyName}}, you know denied claims represent a massive revenue leak.<br><br>We built an enterprise AI engine that reads denial letters, writes clinical rebuttals referencing specific payer guidelines, and resubmits — on autopilot.<br><br>We only charge a percentage of what we successfully recover. If we recover nothing, you pay nothing.<br><br>Would a free 48-hour pilot on a batch of your hardest denials be worth 15 minutes of your time?<br><br>Best,<br>Joe<br>NorthStar Medic",
                }]
            }]
        })
    });

    // ── STEP 3: Connect Mailbox to Campaign ──
    console.log('\n🔗 Step 3: Attaching mailbox to campaign...');
    await fetch('https://api.instantly.ai/api/v2/campaigns/'+newCampaignId+'/accounts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accounts: ["joehary@northstarmedic.com"]
        })
    });

    // ── STEP 4: Upload Whales ──
    console.log('\n🐋 Step 4: Loading 100 Whales directly to new campaign...');
    const csvContent = fs.readFileSync('whale_targets.csv', 'utf8');
    const lines = csvContent.split('\n').filter(l => l.trim() !== '').slice(1);
    
    const whales = lines.map(line => {
        const parts = line.match(/(".*?"|[^,]+)(?=,|$)/g);
        if (!parts || parts.length < 6) return null;
        const email = parts[5].replace(/"/g, '').replace(/&apos;/g, "'").trim();
        const person = parts[3].replace(/"/g, '').trim();
        const nameParts = person.split(' ');
        return {
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            company_name: parts[0].replace(/"/g, '').replace(/&apos;/g, "'").trim(),
            title: parts[4].replace(/"/g, '').trim(),
            email
        };
    }).filter(x => x && x.email && x.email.includes('@')).slice(0, 100);

    let pushed = 0;
    for (const whale of whales) {
        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign: newCampaignId,
                    email: whale.email,
                    first_name: whale.first_name,
                    last_name: whale.last_name,
                    company_name: whale.company_name,
                    title: whale.title,
                    personalization: `As ${whale.title} at ${whale.company_name}`,
                    skip_if_in_campaign: true
                })
            });
            if (res.ok) pushed++;
            await new Promise(r => setTimeout(r, 120));
        } catch (e) {}
    }
    console.log(`✅ Loaded ${pushed} whales.`);

    // ── STEP 5: ACTIVATE! ──
    console.log('\n🔥 Step 5: Activating Campaign...');
    const curStatus = await fetch('https://api.instantly.ai/api/v2/campaigns/'+newCampaignId, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 1 })
    });
    const sData = await curStatus.json();
    console.log('Status update result:', sData.status === 1 ? 'SUCCESS (ACTIVE = 1)' : sData);
}

createCampaignAndUploadWhales();
