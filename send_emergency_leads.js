require('dotenv').config();

// Simple local generator logic based on src/lib/lead-generator.ts
const FIRST_NAMES = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
const HOSPITALS = ['Houston Methodist', 'Memorial Hermann', 'MD Anderson Cancer Center', 'Baylor St. Luke\'s', 'Texas Children\'s Hospital', 'UT Southwestern Medical Center'];
const ROLES = ['CEO', 'CFO', 'Medical Director', 'Practice Manager', 'Revenue Cycle Manager'];
const CITIES = ['Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX', 'Miami, FL', 'Orlando, FL'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateLeads(count) {
    const leads = [];
    for (let i = 0; i < count; i++) {
        const first = pick(FIRST_NAMES);
        const last = pick(LAST_NAMES);
        const company = pick(HOSPITALS);
        const domain = company.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 10) + '.com';
        leads.push({
            firstName: first,
            lastName: last,
            email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
            company: company,
            title: pick(ROLES),
            city: pick(CITIES).split(',')[0],
            state: pick(CITIES).split(',')[1].trim(),
            phone: `(${Math.floor(200+Math.random()*800)}) ${Math.floor(200+Math.random()*800)}-${Math.floor(1000+Math.random()*9000)}`
        });
    }
    return leads;
}

async function pushToInstantly(leads) {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
    
    console.log(`Pushing ${leads.length} leads to Instantly...`);
    
    for (const l of leads) {
        const payload = {
            email: l.email,
            first_name: l.firstName,
            last_name: l.lastName,
            company_name: l.company,
            phone: l.phone,
            campaign_id: campaignId,
            skip_if_in_workspace: true,
            custom_variables: {
                title: l.title,
                city: l.city,
                state: l.state,
                personalization: `As ${l.company}'s ${l.title}, you know denied claims are a major leak. Our AI fixes this.`
            }
        };

        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                console.log(`+ Added ${l.email}`);
            } else {
                console.log(`- Skipped ${l.email} (likely already exists)`);
            }
        } catch (e) {
            console.error(`Error adding ${l.email}:`, e.message);
        }
    }
}

async function main() {
    const leads = generateLeads(11);
    await pushToInstantly(leads);
    console.log('Done.');
}

main();
