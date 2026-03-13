/**
 * Lead Generator Engine
 * 
 * Generates realistic business leads algorithmically using configurable
 * industry databases, role templates, and location data.
 * Zero API cost — all generation happens locally.
 */

export interface GeneratorConfig {
  industry: string;
  location: string;
  count: number;
  roles?: string[];
}

// ---------------------------------------------------------------------------
// DATA POOLS — expand these arrays to increase variety
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth',
  'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
  'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Andrew', 'Emily', 'Paul', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa', 'Timothy', 'Deborah',
  'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia',
  'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna',
  'Stephen', 'Brenda', 'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra', 'Frank', 'Rachel',
  'Alexander', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Catherine', 'Dennis', 'Maria', 'Jerry', 'Heather',
  'Tyler', 'Diane', 'Aaron', 'Ruth', 'Jose', 'Julie', 'Adam', 'Olivia', 'Nathan', 'Joyce',
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

const DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
];

const COMPANY_PREFIXES = [
  'Apex', 'Summit', 'Pinnacle', 'Vanguard', 'Nexus', 'Prime', 'Vertex', 'Zenith',
  'Horizon', 'Atlas', 'Quantum', 'Stellar', 'Nova', 'Catalyst', 'Eclipse', 'Fusion',
  'Titan', 'Omega', 'Pulse', 'Core', 'Beacon', 'Forge', 'Crest', 'Arc',
  'Pioneer', 'Velocity', 'Ascend', 'Bright', 'Crystal', 'Delta', 'Elite', 'Falcon',
  'Genesis', 'Harbor', 'Impact', 'Jade', 'Keystone', 'Lunar', 'Meridian', 'Noble',
  'Onyx', 'Pacific', 'Quest', 'Ridge', 'Sierra', 'Trident', 'Ultra', 'Vista',
];

const COMPANY_SUFFIXES: Record<string, string[]> = {
  'Healthcare': ['Health', 'Medical', 'Care', 'Wellness', 'Therapeutics', 'BioMed', 'Pharma', 'MedTech', 'LifeSciences', 'Diagnostics',
    'HCA Florida', 'Orlando Health', 'Florida Medical Clinic', 'Cleveland Clinic Florida', 'Mount Sinai Medical Center',
    'Houston Methodist', 'Memorial Hermann', 'MD Anderson Cancer Center', 'Baylor St. Luke\'s', 'Texas Children\'s Hospital',
    'UT Southwestern Medical Center', 'St. David\'s Healthcare', 'Christus Health', 'Cook Children\'s Health', 'Harris Health System'],
  'Technology': ['Tech', 'Software', 'Digital', 'Systems', 'Solutions', 'Labs', 'Cloud', 'Data', 'AI', 'Innovations'],
  'Finance': ['Capital', 'Financial', 'Advisors', 'Wealth', 'Partners', 'Investments', 'Holdings', 'Group', 'Assets', 'Ventures'],
  'Real Estate': ['Properties', 'Realty', 'Homes', 'Estates', 'Land', 'Development', 'Builders', 'Housing', 'Residences', 'Living'],
  'Legal': ['Law', 'Legal', 'Associates', 'Counsel', 'Attorneys', 'Justice', 'Advocates', 'Partners', 'LLP', 'Practice'],
  'Marketing': ['Marketing', 'Media', 'Creative', 'Agency', 'Brand', 'Growth', 'Digital', 'Advertising', 'Communications', 'Studios'],
  'Construction': ['Construction', 'Builders', 'Contracting', 'Engineering', 'Infrastructure', 'Development', 'Design', 'Build', 'Projects', 'Works'],
  'Education': ['Academy', 'Learning', 'Institute', 'Education', 'School', 'Training', 'Tutoring', 'Knowledge', 'Skills', 'Prep'],
  'Retail': ['Retail', 'Store', 'Shop', 'Commerce', 'Goods', 'Supply', 'Outlet', 'Market', 'Trading', 'Wholesale'],
  'Manufacturing': ['Manufacturing', 'Industries', 'Production', 'Fabrication', 'Assembly', 'Processing', 'Materials', 'Components', 'Factory', 'Works'],
  'Insurance': ['Insurance', 'Underwriters', 'Coverage', 'Risk', 'Protection', 'Benefits', 'Assurance', 'Claims', 'Shield', 'Guard'],
  'Dental': ['Dental', 'Dentistry', 'Smiles', 'Orthodontics', 'Oral Care', 'Dental Group', 'DDS', 'Dental Associates', 'Dental Studio', 'Dental Clinic', 'Sage Dental', 'Coast Dental', 'Towncare Dental'],
  'default': ['Group', 'Solutions', 'Services', 'Corp', 'Inc', 'Enterprises', 'Co', 'International', 'Global', 'Partners'],
};

const ROLES: Record<string, string[]> = {
  'Healthcare': ['CEO', 'CFO', 'Medical Director', 'Head of Operations', 'Practice Manager', 'Chief Nursing Officer', 'VP Clinical', 'Chief of Staff', 'President of Revenue Cycle'],
  'Technology': ['CTO', 'CEO', 'VP Engineering', 'Head of Product', 'Director of IT', 'Chief Data Officer', 'DevOps Lead'],
  'Finance': ['CFO', 'Managing Director', 'VP Finance', 'Portfolio Manager', 'Chief Risk Officer', 'Head of Compliance', 'Treasurer'],
  'Real Estate': ['Broker', 'Managing Partner', 'Director of Sales', 'Property Manager', 'VP Development', 'Chief Investment Officer', 'Leasing Director'],
  'Legal': ['Managing Partner', 'Senior Partner', 'Associate', 'General Counsel', 'Legal Director', 'Head of Litigation', 'Compliance Officer'],
  'Marketing': ['CMO', 'VP Marketing', 'Creative Director', 'Head of Growth', 'Brand Manager', 'Content Director', 'Digital Marketing Lead'],
  'Construction': ['Project Manager', 'Site Superintendent', 'VP Operations', 'Chief Estimator', 'Director of Safety', 'Construction Manager', 'Foreman'],
  'Education': ['Principal', 'Dean', 'Director of Curriculum', 'Head of Admissions', 'Superintendent', 'VP Academic Affairs', 'Program Director'],
  'Retail': ['Store Manager', 'VP Retail Operations', 'Merchandising Director', 'Head of E-Commerce', 'Regional Manager', 'Buyer', 'Category Manager'],
  'Manufacturing': ['Plant Manager', 'VP Manufacturing', 'Quality Director', 'Supply Chain Manager', 'Production Manager', 'Chief Engineer', 'Operations Director'],
  'Insurance': ['Claims Manager', 'Underwriting Director', 'VP Insurance Operations', 'Chief Actuary', 'Broker', 'Agent', 'Risk Manager'],
  'Dental': ['Dentist', 'Oral Surgeon', 'Office Manager', 'Dental Hygienist Lead', 'Practice Owner', 'Associate Dentist', 'Clinical Director'],
  'default': ['CEO', 'COO', 'CFO', 'VP Operations', 'Director', 'Manager', 'Head of Business Development'],
};

const US_CITIES: Record<string, string[]> = {
  'New York': ['New York, NY', 'Brooklyn, NY', 'Queens, NY', 'Buffalo, NY', 'Rochester, NY', 'Yonkers, NY', 'Syracuse, NY', 'Albany, NY'],
  'California': ['Los Angeles, CA', 'San Francisco, CA', 'San Diego, CA', 'San Jose, CA', 'Sacramento, CA', 'Oakland, CA', 'Fresno, CA', 'Long Beach, CA'],
  'Texas': ['Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX', 'Fort Worth, TX', 'El Paso, TX', 'Arlington, TX', 'Plano, TX', 'Lubbock, TX', 'Corpus Christi, TX', 'Laredo, TX', 'Garland, TX'],
  'Florida': ['Miami, FL', 'Orlando, FL', 'Tampa, FL', 'Jacksonville, FL', 'Fort Lauderdale, FL', 'St. Petersburg, FL', 'Hialeah, FL', 'Tallahassee, FL'],
  'Illinois': ['Chicago, IL', 'Aurora, IL', 'Naperville, IL', 'Joliet, IL', 'Rockford, IL', 'Springfield, IL', 'Elgin, IL', 'Peoria, IL'],
  'Pennsylvania': ['Philadelphia, PA', 'Pittsburgh, PA', 'Allentown, PA', 'Erie, PA', 'Reading, PA', 'Scranton, PA', 'Bethlehem, PA', 'Lancaster, PA'],
  'Ohio': ['Columbus, OH', 'Cleveland, OH', 'Cincinnati, OH', 'Toledo, OH', 'Akron, OH', 'Dayton, OH', 'Parma, OH', 'Canton, OH'],
  'Georgia': ['Atlanta, GA', 'Augusta, GA', 'Columbus, GA', 'Savannah, GA', 'Athens, GA', 'Macon, GA', 'Roswell, GA', 'Albany, GA'],
  'Michigan': ['Detroit, MI', 'Grand Rapids, MI', 'Warren, MI', 'Sterling Heights, MI', 'Lansing, MI', 'Ann Arbor, MI', 'Flint, MI', 'Dearborn, MI'],
  'Nationwide': ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'Austin, TX', 'Miami, FL', 'Atlanta, GA', 'Denver, CO', 'Seattle, WA', 'Boston, MA', 'Nashville, TN', 'Portland, OR', 'Las Vegas, NV', 'Charlotte, NC', 'Indianapolis, IN'],
};

// ---------------------------------------------------------------------------
// GENERATOR
// ---------------------------------------------------------------------------

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmail(first: string, last: string, company: string): string {
  const cleanCompany = company.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 12);
  const patterns = [
    `${first.toLowerCase()}.${last.toLowerCase()}@${cleanCompany}.com`,
    `${first.toLowerCase()[0]}${last.toLowerCase()}@${cleanCompany}.com`,
    `${first.toLowerCase()}@${cleanCompany}.com`,
    `${first.toLowerCase()}.${last.toLowerCase()}@${pick(DOMAINS)}`,
  ];
  return pick(patterns);
}

function generatePhone(): string {
  const area = Math.floor(200 + Math.random() * 800);
  const mid = Math.floor(200 + Math.random() * 800);
  const end = Math.floor(1000 + Math.random() * 9000);
  return `(${area}) ${mid}-${end}`;
}

export function generateLeads(config: GeneratorConfig) {
  const { industry, location, count, roles } = config;
  const suffixes = COMPANY_SUFFIXES[industry] || COMPANY_SUFFIXES['default'];
  const rolePool = roles && roles.length > 0 ? roles : (ROLES[industry] || ROLES['default']);
  const cityPool = US_CITIES[location] || US_CITIES['Nationwide'];

  const leads = [];

  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const companyName = `${pick(COMPANY_PREFIXES)} ${pick(suffixes)}`;
    const email = generateEmail(firstName, lastName, companyName);
    const phone = generatePhone();
    const role = pick(rolePool);
    const city = pick(cityPool);

    leads.push({
      id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
      name: `${firstName} ${lastName}`,
      email,
      company: companyName,
      industry,
      location: city,
      metadata: {
        phone,
        role,
        source: 'generated',
        generatedAt: new Date().toISOString(),
      },
      status: 'new' as const,
      createdAt: Date.now(),
    });
  }

  return leads;
}

export const AVAILABLE_INDUSTRIES = Object.keys(COMPANY_SUFFIXES).filter(k => k !== 'default');
export const AVAILABLE_LOCATIONS = Object.keys(US_CITIES);
