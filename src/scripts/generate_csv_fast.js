require('dotenv').config();
const fs = require('fs');

const APOLLO_BASE = 'https://api.apollo.io/api/v1';

// We fetch 100 at a time per page
const TITLES = [
    'CEO', 'CFO', 'Chief Financial Officer', 'Medical Director',
    'Practice Manager', 'Revenue Cycle Manager', 'Billing Manager',
    'Director of Revenue Cycle', 'VP Finance', 'Office Manager', 'Administrator',
    'President', 'Owner'
];

// Most common healthcare email structures
const EMAIL_PATTERNS = [
    (f, l) => `${f}.${l}`,           // john.smith
    (f, l) => `${f[0]}${l}`,          // jsmith
    (f, l) => `${f}`,                  // john
];

function generateBestEmail(firstName, lastName, domain) {
    if (!firstName || !domain || !lastName || lastName.length <= 2) return null;
    const f = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const l = lastName.toLowerCase().replace(/[^a-z]/g, '');
    if (!f || !l) return null;
    
    // We just return the #1 most common B2B pattern (first.last) to keep the CSV clean
    return `${f}.${l}@${domain}`;
}

async function runSuperFast() {
    console.log('🚀 [HYPER-DRIVE] Starting Fast CSV Lead Generation...');
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) throw new Error('APOLLO_API_KEY not set.');

    const pagesToFetch = 10; // 1,000 leads
    let totalGenerated = 0;
    
    // CSV Header
    const csvHeader = "Email,FirstName,LastName,Company,Title,City,State\n";
    fs.writeFileSync('leads_hyper_fast.csv', csvHeader);

    // We do this loop FAST. No 1-second API delays.
    for (let page = 1; page <= pagesToFetch; page++) {
        process.stdout.write(`Fetching page ${page}/10 (100 contacts)... `);
        
        try {
            const res = await fetch(`${APOLLO_BASE}/mixed_people/api_search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
                body: JSON.stringify({
                    per_page: 100,
                    page,
                    person_titles: TITLES,
                    person_locations: ['Texas, United States', 'Florida, United States'],
                    q_organization_keyword_tags: ['healthcare', 'medical', 'hospital', 'clinic'],
                })
            });

            const data = await res.json();
            const people = data.people || [];
            
            let csvRows = '';
            let validInPage = 0;

            for (const p of people) {
                const firstName = p.first_name || '';
                const lastName = p.last_name || p.last_name_obfuscated || '';
                const domain = p.organization?.primary_domain || '';
                const company = (p.organization?.name || '').replace(/,/g, ''); // strip commas for CSV
                const title = (p.title || '').replace(/,/g, '');
                const city = (p.city || '').replace(/,/g, '');
                const state = (p.state || '').replace(/,/g, '');

                const email = generateBestEmail(firstName, lastName, domain);
                if (email) {
                    csvRows += `${email},${firstName},${lastName},${company},${title},${city},${state}\n`;
                    validInPage++;
                }
            }

            // Append to CSV instantly
            if (csvRows.length > 0) {
                fs.appendFileSync('leads_hyper_fast.csv', csvRows);
            }

            console.log(`✅ Extracted ${validInPage} leads.`);
            totalGenerated += validInPage;

            // Just a tiny 200ms pause so Apollo doesn't rate-limit
            await new Promise(r => setTimeout(r, 200)); 

        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
    }

    console.log(`\n🏁 [DONE] Saved ${totalGenerated} leads to leads_hyper_fast.csv in a matter of seconds.`);
    console.log(`You can now upload this file directly into Instantly when you have space.`);
}

runSuperFast();
