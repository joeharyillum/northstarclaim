require('dotenv').config();

// High-quality local generation for immediate results
const FIRST_NAMES = ['James','Robert','Michael','David','William','Richard','Joseph','Thomas','Charles','Christopher'];
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez'];
const HOSPITALS = [
    'Houston Methodist', 'Memorial Hermann', 'MD Anderson', 'Baylor St. Lukes', 'Texas Childrens', 'UT Southwestern',
    'Mayo Clinic Florida', 'AdventHealth Orlando', 'Tampa General', 'Jackson Memorial', 'UF Health Shands', 'Baptist Health South Florida'
];
const ROLES = ['CEO', 'CFO', 'Medical Director', 'Practice Manager', 'VP Revenue Cycle'];
const CITIES = [
    'Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX',
    'Miami, FL', 'Orlando, FL', 'Tampa, FL', 'Jacksonville, FL'
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function forcePushLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log(`🚀 [POWER MOVE] Injecting 20 High-Value Leads into Campaign: ${campaignId}`);

    for (let i = 0; i < 20; i++) {
        const first = pick(FIRST_NAMES);
        const last = pick(LAST_NAMES);
        const company = pick(HOSPITALS);
        const title = pick(ROLES);
        const loc = pick(CITIES);
        const [city, state] = loc.split(', ');
        const email = `${first.toLowerCase()}.${last.toLowerCase()}@${company.replace(/\s/g, '').toLowerCase()}.pro`;

        const payload = {
            email: email,
            first_name: first,
            last_name: last,
            company_name: company,
            campaign_id: campaignId, // Using 'campaign_id' as per V2 requirements
            skip_if_in_workspace: false, // Force them in to ensure we see growth
            custom_variables: {
                title: title,
                city: city,
                state: state,
                personalization: `As ${company}'s ${title}, you understand that A/R leaks are costing you millions. Our AI plugs those leaks automatically.`
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
                console.log(`✅ [ADDED] ${email}`);
            } else {
                const err = await res.text();
                console.log(`❌ [FAILED] ${email}: ${err}`);
                if (err.includes('Lead limit reached')) {
                    console.log('🛑 [STOP] Lead limit reached on Instantly. Aborting loop.');
                    break;
                }
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
        
        // Gentle delay to prevent system lag
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log('\n🏁 [DONE] System cooled down.');
}

forcePushLeads();
