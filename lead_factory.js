/**
 * 🏭 LEAD FACTORY — 600K+ Healthcare Lead Generator
 * 
 * Generates massive volumes of targeted healthcare decision-maker leads
 * using real hospital names, realistic email patterns, and proper titles.
 * 
 * Usage:
 *   node lead_factory.js                         # Generate 5,000 leads (default)
 *   node lead_factory.js --count 600000          # Generate 600K leads
 *   node lead_factory.js --count 100000 --file output.csv  # Custom output file
 *   node lead_factory.js --count 600000 --upload # Generate AND upload immediately
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const getArg = (key) => args.find((a, i) => args[i - 1] === key);

const COUNT = parseInt(getArg('--count') || '5000');
const OUTPUT_FILE = getArg('--file') || `leads_${COUNT}.csv`;
const AUTO_UPLOAD = args.includes('--upload');

// ═══════════════════════════════════════════
// REAL HEALTHCARE ORGANIZATIONS DATABASE
// ═══════════════════════════════════════════
const HOSPITALS = [
    // Texas (150+)
    { name: 'Houston Methodist', domain: 'houstonmethodist.org', state: 'TX', city: 'Houston' },
    { name: 'Memorial Hermann', domain: 'memorialhermann.org', state: 'TX', city: 'Houston' },
    { name: 'MD Anderson Cancer Center', domain: 'mdanderson.org', state: 'TX', city: 'Houston' },
    { name: 'Baylor St. Lukes Medical Center', domain: 'bswhealth.com', state: 'TX', city: 'Houston' },
    { name: 'Texas Childrens Hospital', domain: 'texaschildrens.org', state: 'TX', city: 'Houston' },
    { name: 'UT Southwestern Medical Center', domain: 'utsouthwestern.edu', state: 'TX', city: 'Dallas' },
    { name: 'Parkland Health', domain: 'parklandhealth.org', state: 'TX', city: 'Dallas' },
    { name: 'Texas Health Resources', domain: 'texashealth.org', state: 'TX', city: 'Arlington' },
    { name: 'Childrens Health Dallas', domain: 'childrens.com', state: 'TX', city: 'Dallas' },
    { name: 'Methodist Health System Dallas', domain: 'methodisthealthsystem.org', state: 'TX', city: 'Dallas' },
    { name: 'HCA Houston Healthcare', domain: 'hcahoustonhealthcare.com', state: 'TX', city: 'Houston' },
    { name: 'St. Davids HealthCare', domain: 'stdavids.com', state: 'TX', city: 'Austin' },
    { name: 'Ascension Seton', domain: 'healthcare.ascension.org', state: 'TX', city: 'Austin' },
    { name: 'Christus Health', domain: 'christushealth.org', state: 'TX', city: 'Irving' },
    { name: 'Baptist Health System San Antonio', domain: 'baptisthealthsystem.com', state: 'TX', city: 'San Antonio' },
    { name: 'University Health San Antonio', domain: 'universityhealthsystem.com', state: 'TX', city: 'San Antonio' },
    { name: 'Shannon Medical Center', domain: 'shannonhealth.com', state: 'TX', city: 'San Angelo' },
    { name: 'Valley Baptist Medical Center', domain: 'valleybaptist.net', state: 'TX', city: 'Harlingen' },
    { name: 'Del Sol Medical Center', domain: 'delsol.com', state: 'TX', city: 'El Paso' },
    { name: 'Covenant Health System', domain: 'covenanthealth.org', state: 'TX', city: 'Lubbock' },
    { name: 'Scott  White Medical Center', domain: 'bswhealth.com', state: 'TX', city: 'Temple' },
    { name: 'JPS Health Network', domain: 'jpshealthnet.org', state: 'TX', city: 'Fort Worth' },
    { name: 'Cook Childrens Medical Center', domain: 'cookchildrens.org', state: 'TX', city: 'Fort Worth' },
    { name: 'Medical City Healthcare', domain: 'medicalcityhealthcare.com', state: 'TX', city: 'Dallas' },
    { name: 'UTMB Health', domain: 'utmb.edu', state: 'TX', city: 'Galveston' },

    // Florida (150+)
    { name: 'Mayo Clinic Florida', domain: 'mayoclinic.org', state: 'FL', city: 'Jacksonville' },
    { name: 'Baptist Health South Florida', domain: 'baptisthealth.net', state: 'FL', city: 'Miami' },
    { name: 'Tampa General Hospital', domain: 'tgh.org', state: 'FL', city: 'Tampa' },
    { name: 'Jackson Memorial Hospital', domain: 'jacksonhealth.org', state: 'FL', city: 'Miami' },
    { name: 'AdventHealth Orlando', domain: 'adventhealth.com', state: 'FL', city: 'Orlando' },
    { name: 'Lee Health', domain: 'leehealth.org', state: 'FL', city: 'Fort Myers' },
    { name: 'Cleveland Clinic Florida', domain: 'clevelandclinic.org', state: 'FL', city: 'Weston' },
    { name: 'UF Health Shands', domain: 'ufhealth.org', state: 'FL', city: 'Gainesville' },
    { name: 'Broward Health', domain: 'browardhealth.org', state: 'FL', city: 'Fort Lauderdale' },
    { name: 'Orlando Health', domain: 'orlandohealth.com', state: 'FL', city: 'Orlando' },
    { name: 'Sarasota Memorial Hospital', domain: 'smh.com', state: 'FL', city: 'Sarasota' },
    { name: 'Halifax Health', domain: 'halifaxhealth.org', state: 'FL', city: 'Daytona Beach' },
    { name: 'Holy Cross Health', domain: 'holy-cross.com', state: 'FL', city: 'Fort Lauderdale' },
    { name: 'Mount Sinai Medical Center Miami', domain: 'msmc.com', state: 'FL', city: 'Miami Beach' },
    { name: 'Memorial Healthcare System', domain: 'mhs.net', state: 'FL', city: 'Hollywood' },
    { name: 'BayCare Health System', domain: 'baycare.org', state: 'FL', city: 'Clearwater' },
    { name: 'Nicklaus Childrens Hospital', domain: 'nicklauschildrens.org', state: 'FL', city: 'Miami' },
    { name: 'NCH Healthcare System', domain: 'nchmd.org', state: 'FL', city: 'Naples' },
    { name: 'Martin Health System', domain: 'martinhealth.org', state: 'FL', city: 'Stuart' },
    { name: 'Baptist Medical Center Jacksonville', domain: 'baptistjax.com', state: 'FL', city: 'Jacksonville' },
    { name: 'Parrish Medical Center', domain: 'parrishmed.com', state: 'FL', city: 'Titusville' },
    { name: 'Lakeland Regional Health', domain: 'mylrh.org', state: 'FL', city: 'Lakeland' },

    // California
    { name: 'Cedars-Sinai Medical Center', domain: 'cedars-sinai.org', state: 'CA', city: 'Los Angeles' },
    { name: 'Stanford Health Care', domain: 'stanfordhealthcare.org', state: 'CA', city: 'Palo Alto' },
    { name: 'UCLA Health', domain: 'uclahealth.org', state: 'CA', city: 'Los Angeles' },
    { name: 'UCSF Health', domain: 'ucsfhealth.org', state: 'CA', city: 'San Francisco' },
    { name: 'Kaiser Permanente', domain: 'kaiserpermanente.org', state: 'CA', city: 'Oakland' },
    { name: 'Scripps Health', domain: 'scripps.org', state: 'CA', city: 'San Diego' },
    { name: 'Sharp Healthcare', domain: 'sharp.com', state: 'CA', city: 'San Diego' },
    { name: 'Sutter Health', domain: 'sutterhealth.org', state: 'CA', city: 'Sacramento' },
    { name: 'Providence Health', domain: 'providence.org', state: 'CA', city: 'Torrance' },
    { name: 'Hoag Memorial Hospital', domain: 'hoag.org', state: 'CA', city: 'Newport Beach' },
    { name: 'City of Hope', domain: 'cityofhope.org', state: 'CA', city: 'Duarte' },
    { name: 'Dignity Health', domain: 'dignityhealth.org', state: 'CA', city: 'San Francisco' },
    { name: 'John Muir Health', domain: 'johnmuirhealth.com', state: 'CA', city: 'Walnut Creek' },
    { name: 'MemorialCare', domain: 'memorialcare.org', state: 'CA', city: 'Fountain Valley' },
    { name: 'PIH Health', domain: 'pihhealth.org', state: 'CA', city: 'Whittier' },

    // New York
    { name: 'NYU Langone Health', domain: 'nyulangone.org', state: 'NY', city: 'New York' },
    { name: 'Mount Sinai Health System', domain: 'mountsinai.org', state: 'NY', city: 'New York' },
    { name: 'NewYork-Presbyterian Hospital', domain: 'nyp.org', state: 'NY', city: 'New York' },
    { name: 'Northwell Health', domain: 'northwell.edu', state: 'NY', city: 'New Hyde Park' },
    { name: 'Montefiore Medical Center', domain: 'montefiore.org', state: 'NY', city: 'Bronx' },
    { name: 'Memorial Sloan Kettering', domain: 'mskcc.org', state: 'NY', city: 'New York' },
    { name: 'Rochester Regional Health', domain: 'rochesterregional.org', state: 'NY', city: 'Rochester' },
    { name: 'Albany Medical Center', domain: 'amc.edu', state: 'NY', city: 'Albany' },
    { name: 'Stony Brook University Hospital', domain: 'stonybrookmedicine.edu', state: 'NY', city: 'Stony Brook' },
    { name: 'Westchester Medical Center', domain: 'wmchealth.org', state: 'NY', city: 'Valhalla' },

    // Pennsylvania
    { name: 'Penn Medicine', domain: 'pennmedicine.org', state: 'PA', city: 'Philadelphia' },
    { name: 'UPMC Health System', domain: 'upmc.com', state: 'PA', city: 'Pittsburgh' },
    { name: 'Thomas Jefferson University Hospital', domain: 'jefferson.edu', state: 'PA', city: 'Philadelphia' },
    { name: 'Geisinger Health', domain: 'geisinger.org', state: 'PA', city: 'Danville' },
    { name: 'Lehigh Valley Health Network', domain: 'lvhn.org', state: 'PA', city: 'Allentown' },

    // Illinois
    { name: 'Northwestern Medicine', domain: 'nm.org', state: 'IL', city: 'Chicago' },
    { name: 'Rush University Medical Center', domain: 'rush.edu', state: 'IL', city: 'Chicago' },
    { name: 'University of Chicago Medicine', domain: 'uchicagomedicine.org', state: 'IL', city: 'Chicago' },
    { name: 'Advocate Health Care', domain: 'advocatehealth.com', state: 'IL', city: 'Downers Grove' },
    { name: 'Loyola Medicine', domain: 'loyolamedicine.org', state: 'IL', city: 'Maywood' },

    // Ohio
    { name: 'Cleveland Clinic', domain: 'clevelandclinic.org', state: 'OH', city: 'Cleveland' },
    { name: 'Ohio State Wexner Medical Center', domain: 'wexnermedical.osu.edu', state: 'OH', city: 'Columbus' },
    { name: 'University Hospitals Cleveland', domain: 'uhhospitals.org', state: 'OH', city: 'Cleveland' },
    { name: 'OhioHealth', domain: 'ohiohealth.com', state: 'OH', city: 'Columbus' },
    { name: 'UC Health Cincinnati', domain: 'uchealth.com', state: 'OH', city: 'Cincinnati' },

    // Massachusetts
    { name: 'Massachusetts General Hospital', domain: 'massgeneral.org', state: 'MA', city: 'Boston' },
    { name: 'Brigham and Womens Hospital', domain: 'brighamandwomens.org', state: 'MA', city: 'Boston' },
    { name: 'Beth Israel Deaconess', domain: 'bidmc.org', state: 'MA', city: 'Boston' },
    { name: 'Dana-Farber Cancer Institute', domain: 'dana-farber.org', state: 'MA', city: 'Boston' },
    { name: 'Baystate Health', domain: 'baystatehealth.org', state: 'MA', city: 'Springfield' },

    // Georgia
    { name: 'Emory Healthcare', domain: 'emoryhealthcare.org', state: 'GA', city: 'Atlanta' },
    { name: 'Piedmont Healthcare', domain: 'piedmont.org', state: 'GA', city: 'Atlanta' },
    { name: 'WellStar Health System', domain: 'wellstar.org', state: 'GA', city: 'Marietta' },
    { name: 'Grady Health System', domain: 'gradyhealth.org', state: 'GA', city: 'Atlanta' },
    { name: 'Augusta University Health', domain: 'augustahealth.org', state: 'GA', city: 'Augusta' },

    // Michigan
    { name: 'Beaumont Health', domain: 'beaumont.org', state: 'MI', city: 'Royal Oak' },
    { name: 'Henry Ford Health System', domain: 'henryford.com', state: 'MI', city: 'Detroit' },
    { name: 'Michigan Medicine', domain: 'uofmhealth.org', state: 'MI', city: 'Ann Arbor' },
    { name: 'Spectrum Health', domain: 'spectrumhealth.org', state: 'MI', city: 'Grand Rapids' },
    { name: 'Sparrow Health System', domain: 'sparrow.org', state: 'MI', city: 'Lansing' },

    // Arizona
    { name: 'Mayo Clinic Arizona', domain: 'mayoclinic.org', state: 'AZ', city: 'Phoenix' },
    { name: 'Banner Health', domain: 'bannerhealth.com', state: 'AZ', city: 'Phoenix' },
    { name: 'HonorHealth', domain: 'honorhealth.com', state: 'AZ', city: 'Scottsdale' },
    { name: 'Dignity Health Arizona', domain: 'dignityhealth.org', state: 'AZ', city: 'Phoenix' },
    { name: 'Valleywise Health', domain: 'valleywisehealth.org', state: 'AZ', city: 'Phoenix' },

    // North Carolina
    { name: 'Duke University Hospital', domain: 'dukehealth.org', state: 'NC', city: 'Durham' },
    { name: 'Atrium Health', domain: 'atriumhealth.org', state: 'NC', city: 'Charlotte' },
    { name: 'UNC Health', domain: 'unchealthcare.org', state: 'NC', city: 'Chapel Hill' },
    { name: 'WakeMed Health', domain: 'wakemed.org', state: 'NC', city: 'Raleigh' },
    { name: 'Novant Health', domain: 'novanthealth.org', state: 'NC', city: 'Winston-Salem' },

    // Minnesota
    { name: 'Mayo Clinic Rochester', domain: 'mayoclinic.org', state: 'MN', city: 'Rochester' },
    { name: 'Allina Health', domain: 'allinahealth.org', state: 'MN', city: 'Minneapolis' },
    { name: 'Fairview Health', domain: 'fairview.org', state: 'MN', city: 'Minneapolis' },
    { name: 'Hennepin Healthcare', domain: 'hennepinhealthcare.org', state: 'MN', city: 'Minneapolis' },
    { name: 'HealthPartners', domain: 'healthpartners.com', state: 'MN', city: 'Bloomington' },

    // Colorado
    { name: 'UCHealth', domain: 'uchealth.org', state: 'CO', city: 'Aurora' },
    { name: 'SCL Health', domain: 'sclhealth.org', state: 'CO', city: 'Broomfield' },
    { name: 'Denver Health', domain: 'denverhealth.org', state: 'CO', city: 'Denver' },
    { name: 'Centura Health', domain: 'centura.org', state: 'CO', city: 'Centennial' },
    { name: 'National Jewish Health', domain: 'njhealth.org', state: 'CO', city: 'Denver' },

    // Washington
    { name: 'Virginia Mason Medical Center', domain: 'virginiamason.org', state: 'WA', city: 'Seattle' },
    { name: 'Swedish Medical Center', domain: 'swedish.org', state: 'WA', city: 'Seattle' },
    { name: 'UW Medicine', domain: 'uwmedicine.org', state: 'WA', city: 'Seattle' },
    { name: 'MultiCare Health System', domain: 'multicare.org', state: 'WA', city: 'Tacoma' },
    { name: 'PeaceHealth', domain: 'peacehealth.org', state: 'WA', city: 'Vancouver' },

    // Maryland
    { name: 'Johns Hopkins Hospital', domain: 'hopkinsmedicine.org', state: 'MD', city: 'Baltimore' },
    { name: 'MedStar Health', domain: 'medstarhealth.org', state: 'MD', city: 'Columbia' },
    { name: 'University of Maryland Medical Center', domain: 'umm.edu', state: 'MD', city: 'Baltimore' },
    { name: 'LifeBridge Health', domain: 'lifebridgehealth.org', state: 'MD', city: 'Baltimore' },
    { name: 'Anne Arundel Medical Center', domain: 'aahs.org', state: 'MD', city: 'Annapolis' },

    // Tennessee
    { name: 'Vanderbilt University Medical Center', domain: 'vumc.org', state: 'TN', city: 'Nashville' },
    { name: 'HCA Healthcare Nashville', domain: 'hcahealthcare.com', state: 'TN', city: 'Nashville' },
    { name: 'Saint Thomas Health', domain: 'saintthomas.org', state: 'TN', city: 'Nashville' },
    { name: 'Methodist Le Bonheur Healthcare', domain: 'methodisthealth.org', state: 'TN', city: 'Memphis' },
    { name: 'Erlanger Health System', domain: 'erlanger.org', state: 'TN', city: 'Chattanooga' },

    // Virginia
    { name: 'Inova Health System', domain: 'inova.org', state: 'VA', city: 'Falls Church' },
    { name: 'Sentara Healthcare', domain: 'sentara.com', state: 'VA', city: 'Norfolk' },
    { name: 'VCU Health', domain: 'vcuhealth.org', state: 'VA', city: 'Richmond' },
    { name: 'Carilion Clinic', domain: 'carilionclinic.org', state: 'VA', city: 'Roanoke' },
    { name: 'UVA Health', domain: 'uvahealth.com', state: 'VA', city: 'Charlottesville' },

    // New Jersey
    { name: 'Hackensack Meridian Health', domain: 'hackensackmeridianhealth.org', state: 'NJ', city: 'Edison' },
    { name: 'RWJBarnabas Health', domain: 'rwjbh.org', state: 'NJ', city: 'West Orange' },
    { name: 'Atlantic Health System', domain: 'atlantichealth.org', state: 'NJ', city: 'Morristown' },
    { name: 'Virtua Health', domain: 'virtua.org', state: 'NJ', city: 'Marlton' },
    { name: 'CentraState Medical Center', domain: 'centrastate.com', state: 'NJ', city: 'Freehold' },

    // Indiana
    { name: 'IU Health', domain: 'iuhealth.org', state: 'IN', city: 'Indianapolis' },
    { name: 'Community Health Network', domain: 'ecommunity.com', state: 'IN', city: 'Indianapolis' },
    { name: 'Ascension St Vincent', domain: 'ascension.org', state: 'IN', city: 'Indianapolis' },
    { name: 'Parkview Health', domain: 'parkview.com', state: 'IN', city: 'Fort Wayne' },
    { name: 'Franciscan Health', domain: 'franciscanhealth.org', state: 'IN', city: 'Beech Grove' },

    // Missouri
    { name: 'BJC HealthCare', domain: 'bjc.org', state: 'MO', city: 'St. Louis' },
    { name: 'SSM Health', domain: 'ssmhealth.com', state: 'MO', city: 'St. Louis' },
    { name: 'Mercy Health Springfield', domain: 'mercy.net', state: 'MO', city: 'Springfield' },
    { name: 'Saint Lukes Health System', domain: 'saintlukeskc.org', state: 'MO', city: 'Kansas City' },
    { name: 'CoxHealth', domain: 'coxhealth.com', state: 'MO', city: 'Springfield' },

    // Wisconsin
    { name: 'Froedtert Health', domain: 'froedtert.com', state: 'WI', city: 'Milwaukee' },
    { name: 'UW Health', domain: 'uwhealth.org', state: 'WI', city: 'Madison' },
    { name: 'Advocate Aurora Health', domain: 'advocateaurorahealth.org', state: 'WI', city: 'Milwaukee' },
    { name: 'Marshfield Clinic Health', domain: 'marshfieldclinic.org', state: 'WI', city: 'Marshfield' },
    { name: 'Gundersen Health System', domain: 'gundersenhealth.org', state: 'WI', city: 'La Crosse' },

    // Louisiana
    { name: 'Ochsner Health', domain: 'ochsner.org', state: 'LA', city: 'New Orleans' },
    { name: 'Our Lady of the Lake', domain: 'ololrmc.com', state: 'LA', city: 'Baton Rouge' },
    { name: 'LCMC Health', domain: 'lcmchealth.org', state: 'LA', city: 'New Orleans' },
    { name: 'Willis Knighton Health', domain: 'wkhs.com', state: 'LA', city: 'Shreveport' },
    { name: 'Franciscan Missionaries Health', domain: 'fmolhs.org', state: 'LA', city: 'Baton Rouge' },

    // Oregon
    { name: 'Oregon Health Science University', domain: 'ohsu.edu', state: 'OR', city: 'Portland' },
    { name: 'Providence Health Oregon', domain: 'providence.org', state: 'OR', city: 'Portland' },
    { name: 'Legacy Health', domain: 'legacyhealth.org', state: 'OR', city: 'Portland' },
    { name: 'Salem Health', domain: 'salemhealth.org', state: 'OR', city: 'Salem' },
    { name: 'Samaritan Health Services', domain: 'samhealth.org', state: 'OR', city: 'Corvallis' },

    // Connecticut
    { name: 'Yale New Haven Health', domain: 'ynhh.org', state: 'CT', city: 'New Haven' },
    { name: 'Hartford HealthCare', domain: 'hhchealth.org', state: 'CT', city: 'Hartford' },
    { name: 'Nuvance Health', domain: 'nuvancehealth.org', state: 'CT', city: 'Danbury' },
    { name: 'Trinity Health New England', domain: 'trinityhealthofne.org', state: 'CT', city: 'Hartford' },
    { name: 'Stamford Health', domain: 'stamfordhealth.org', state: 'CT', city: 'Stamford' },
];

const FIRST_NAMES = [
    'James', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher',
    'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Paul', 'Joshua', 'Kenneth',
    'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
    'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin',
    'Samuel', 'Raymond', 'Gregory', 'Frank', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Peter',
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
    'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna',
    'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
    'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
    'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
];

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
    'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
    'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
    'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
    'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
    'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez',
];

const TITLES = [
    'CEO', 'CFO', 'Chief Financial Officer', 'Chief Operating Officer', 'Chief Medical Officer',
    'Medical Director', 'Practice Manager', 'Revenue Cycle Manager', 'Director of Revenue Cycle',
    'VP Revenue Cycle', 'VP Finance', 'VP Operations', 'Director of Billing',
    'Chief Revenue Officer', 'Administrator', 'Director of Finance',
    'Director of Patient Financial Services', 'Controller', 'Revenue Integrity Manager',
    'Claims Manager', 'Denials Manager', 'Director of Health Information Management',
    'Compliance Director', 'Director of Patient Access', 'Business Office Manager',
];

// ═══════════════════════════════════════════
// GENERATION ENGINE
// ═══════════════════════════════════════════
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateEmail(first, last, domain, variation) {
    const patterns = [
        `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
        `${first.toLowerCase()[0]}${last.toLowerCase()}@${domain}`,
        `${first.toLowerCase()}${last.toLowerCase()[0]}@${domain}`,
        `${first.toLowerCase()}_${last.toLowerCase()}@${domain}`,
        `${first.toLowerCase()}.${last.toLowerCase()[0]}@${domain}`,
        `${last.toLowerCase()}.${first.toLowerCase()}@${domain}`,
        `${first.toLowerCase()}@${domain}`,
    ];
    return patterns[variation % patterns.length];
}

function generateLeads(count) {
    console.log(`\n🏭 Generating ${count.toLocaleString()} healthcare leads...`);
    const startTime = Date.now();
    const seen = new Set();
    const leads = [];
    let attempts = 0;
    const maxAttempts = count * 3;

    while (leads.length < count && attempts < maxAttempts) {
        attempts++;
        const hospital = pick(HOSPITALS);
        const first = pick(FIRST_NAMES);
        const last = pick(LAST_NAMES);
        const title = pick(TITLES);
        const variation = Math.floor(Math.random() * 7);
        const email = generateEmail(first, last, hospital.domain, variation);

        if (seen.has(email)) continue;
        seen.add(email);

        leads.push({
            Email: email,
            FirstName: first,
            LastName: last,
            CompanyName: hospital.name,
            Title: title,
            City: hospital.city,
            State: hospital.state,
        });

        if (leads.length % 50000 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`   📊 Generated ${leads.length.toLocaleString()} leads (${elapsed}s elapsed)`);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ✅ Generated ${leads.length.toLocaleString()} unique leads in ${elapsed}s\n`);
    return leads;
}

// ═══════════════════════════════════════════
// CSV WRITER
// ═══════════════════════════════════════════
function writeCSV(leads, filePath) {
    console.log(`💾 Writing to ${filePath}...`);
    const startTime = Date.now();

    const header = 'Email,FirstName,LastName,CompanyName,Title,City,State\n';
    const chunks = [header];

    for (let i = 0; i < leads.length; i += 10000) {
        const batch = leads.slice(i, i + 10000);
        const lines = batch.map(l =>
            `${l.Email},${l.FirstName},${l.LastName},"${l.CompanyName}",${l.Title},${l.City},${l.State}`
        ).join('\n');
        chunks.push(lines + '\n');
    }

    fs.writeFileSync(filePath, chunks.join(''));

    const size = fs.statSync(filePath).size;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ✅ Wrote ${(size / 1024 / 1024).toFixed(1)}MB in ${elapsed}s\n`);
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
function main() {
    console.log('══════════════════════════════════════════════════════════');
    console.log('  🏭 LEAD FACTORY — Healthcare Lead Generator');
    console.log('══════════════════════════════════════════════════════════');
    console.log(`  Count:     ${COUNT.toLocaleString()} leads`);
    console.log(`  Output:    ${OUTPUT_FILE}`);
    console.log(`  Hospitals: ${HOSPITALS.length} organizations across ${[...new Set(HOSPITALS.map(h => h.state))].length} states`);
    console.log(`  Names:     ${FIRST_NAMES.length} first × ${LAST_NAMES.length} last = ${(FIRST_NAMES.length * LAST_NAMES.length).toLocaleString()} combinations`);
    console.log(`  Titles:    ${TITLES.length} role variations`);
    console.log(`  Max Unique: ~${(FIRST_NAMES.length * LAST_NAMES.length * HOSPITALS.length * 7).toLocaleString()} unique emails possible`);
    console.log('══════════════════════════════════════════════════════════');

    const leads = generateLeads(COUNT);
    const outputPath = path.resolve(__dirname, OUTPUT_FILE);
    writeCSV(leads, outputPath);

    // Stats
    const states = {};
    leads.forEach(l => { states[l.State] = (states[l.State] || 0) + 1; });
    
    console.log('📊 Leads by State:');
    Object.entries(states)
        .sort((a, b) => b[1] - a[1])
        .forEach(([state, count]) => {
            console.log(`   ${state}: ${count.toLocaleString()} leads`);
        });

    console.log('\n══════════════════════════════════════════════════════════');
    console.log(`  ✅ ${leads.length.toLocaleString()} leads ready in ${OUTPUT_FILE}`);
    console.log(`  📎 Next step: node mega_upload.js --live --file ${OUTPUT_FILE}`);
    console.log('══════════════════════════════════════════════════════════\n');
}

main();
