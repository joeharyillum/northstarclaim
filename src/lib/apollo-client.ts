/**
 * Apollo.io REAL API Client
 * 
 * Fetches REAL leads from Apollo's database of 250M+ contacts.
 * Uses the current mixed_people/api_search endpoint.
 * 
 * Zero simulation. Zero fake data. Real contacts only.
 */

const APOLLO_BASE = 'https://api.apollo.io/api/v1';

export interface ApolloSearchParams {
    /** Industry keyword, e.g. "hospital", "medical", "healthcare" */
    organizationIndustries?: string[];
    /** Job titles to target */
    personTitles?: string[];
    /** US state codes, e.g. ["FL", "TX"] */
    personLocations?: string[];
    /** Number of results per page (max 100) */
    perPage?: number;
    /** Page number for pagination */
    page?: number;
}

export interface ApolloLead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    company: string;
    city: string;
    state: string;
    phone?: string;
    linkedinUrl?: string;
    companyDomain?: string;
    industry?: string;
    employeeCount?: number;
}

/**
 * Search Apollo for real people matching healthcare criteria
 */
export async function searchApolloLeads(params: ApolloSearchParams): Promise<{
    leads: ApolloLead[];
    totalResults: number;
    page: number;
}> {
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) {
        throw new Error('APOLLO_API_KEY is not set in environment variables');
    }

    const body: Record<string, any> = {
        api_key: apiKey,
        per_page: params.perPage || 25,
        page: params.page || 1,
    };

    // Industry filter
    if (params.organizationIndustries && params.organizationIndustries.length > 0) {
        body.organization_industry_tag_ids = [];
        body.q_organization_keyword_tags = params.organizationIndustries;
    }

    // Title filter - target decision makers
    if (params.personTitles && params.personTitles.length > 0) {
        body.person_titles = params.personTitles;
    }

    // Location filter
    if (params.personLocations && params.personLocations.length > 0) {
        body.person_locations = params.personLocations;
    }

    // Only get people with email addresses
    body.contact_email_status = ['verified', 'guessed', 'likely'];

    console.log(`[APOLLO] Searching for leads: industries=${params.organizationIndustries}, titles=${params.personTitles}, locations=${params.personLocations}`);

    const response = await fetch(`${APOLLO_BASE}/mixed_people/api_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[APOLLO] API Error ${response.status}: ${errorText}`);
        throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const leads: ApolloLead[] = (data.people || []).map((person: any) => ({
        id: person.id,
        firstName: person.first_name || '',
        lastName: person.last_name || '',
        email: person.email || '',
        title: person.title || '',
        company: person.organization?.name || '',
        city: person.city || '',
        state: person.state || '',
        phone: person.phone_numbers?.[0]?.sanitized_number || person.organization?.primary_phone?.sanitized_number || '',
        linkedinUrl: person.linkedin_url || '',
        companyDomain: person.organization?.primary_domain || '',
        industry: person.organization?.industry || '',
        employeeCount: person.organization?.estimated_num_employees || 0,
    })).filter((l: ApolloLead) => l.email); // Only keep leads with emails

    console.log(`[APOLLO] Found ${leads.length} leads with emails (page ${params.page || 1}, total: ${data.pagination?.total_entries || 0})`);

    return {
        leads,
        totalResults: data.pagination?.total_entries || 0,
        page: params.page || 1,
    };
}

/**
 * Pre-configured search for healthcare decision makers in target states
 */
export async function searchHealthcareLeads(
    states: string[] = ['Florida', 'Texas'],
    count: number = 25,
    page: number = 1
): Promise<{ leads: ApolloLead[]; totalResults: number; page: number }> {
    return searchApolloLeads({
        organizationIndustries: [
            'hospital & health care',
            'medical practice',
            'health, wellness and fitness',
            'medical devices',
            'pharmaceuticals',
        ],
        personTitles: [
            'CEO',
            'CFO',
            'Chief Financial Officer',
            'Medical Director',
            'Practice Manager',
            'Revenue Cycle Manager',
            'Billing Manager',
            'Director of Revenue Cycle',
            'VP Finance',
            'Office Manager',
            'Administrator',
        ],
        personLocations: states,
        perPage: Math.min(count, 100),
        page,
    });
}
