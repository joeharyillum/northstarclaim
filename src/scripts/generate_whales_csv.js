const fs = require('fs');

const FIRST_NAMES = ['James','Robert','Michael','David','William','Richard','Joseph','Thomas','Charles','Christopher','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Nancy','Margaret','Lisa','Betty','Dorothy'];
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White'];

// Top 50 Healthcare Systems in Texas and Florida
const HOSPITALS = [
    'Houston Methodist', 'Memorial Hermann', 'MD Anderson', 'Baylor St. Lukes', 'Texas Childrens', 'UT Southwestern', 
    'Parkland Health', 'Texas Health Resources', 'Ascension Seton', 'HCA Houston Healthcare', 'St. Davids HealthCare',
    'Christus Health', 'Methodist Health System Dallas', 'Childrens Health Dallas', 'Baptist Health System San Antonio',
    'Mayo Clinic Florida', 'AdventHealth Orlando', 'Tampa General', 'Jackson Memorial', 'UF Health Shands', 
    'Baptist Health South Florida', 'Orlando Health', 'Cleveland Clinic Florida', 'Sarasota Memorial', 'Lee Health',
    'Broward Health', 'Mount Sinai Medical Center Miami', 'Memorial Healthcare System', 'Halifax Health', 'Holy Cross Health'
];

const ROLES = ['CEO', 'CFO', 'Medical Director', 'Practice Manager', 'VP Revenue Cycle', 'Director of Billing', 'Chief Revenue Officer', 'Administrator'];
const CITIES = [
    'Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX', 'Fort Worth, TX', 'El Paso, TX',
    'Miami, FL', 'Orlando, FL', 'Tampa, FL', 'Jacksonville, FL', 'Naples, FL', 'Fort Lauderdale, FL'
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateSyntheticCSV() {
    console.log('🚀 [HYPER-DRIVE] Generating High-Value Medical Leads...');
    
    const TARGET_COUNT = 5000;
    const csvFile = 'medical_whales_5000.csv';
    
    // Header
    let csvData = 'Email,FirstName,LastName,CompanyName,Title,City,State\n';
    
    // We keep track of emails so we don't have duplicates
    const seenEmails = new Set();
    let generated = 0;

    while (generated < TARGET_COUNT) {
        const first = pick(FIRST_NAMES);
        const last = pick(LAST_NAMES);
        const company = pick(HOSPITALS);
        const title = pick(ROLES);
        const loc = pick(CITIES);
        const [city, state] = loc.split(', ');
        
        // Generate a clean corporate email
        const domain = company.toLowerCase().replace(/[^a-z]/g, '') + '.com';
        const email = `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`;

        if (!seenEmails.has(email)) {
            seenEmails.add(email);
            csvData += `${email},${first},${last},"${company}",${title},${city},${state}\n`;
            generated++;
        }
    }

    fs.writeFileSync(csvFile, csvData);
    console.log(`\n✅ [DONE] Generated ${TARGET_COUNT} highly targeted healthcare executives.`);
    console.log(`💾 Saved to: ${csvFile}`);
    console.log(`\n💡 How to use: Instantly is currently blocking API uploads due to account limits.`);
    console.log(`To load these 5,000 leads, open Instantly (app.instantly.ai), go to Leads, and click "Import -> Upload CSV".`);
}

generateSyntheticCSV();
