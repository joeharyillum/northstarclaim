/**
 * REAL PIPELINE: Zero-Human Lead Acquisition Engine
 * 
 * GET  → Check pipeline status
 * POST → Run the full pipeline:
 *   1. Fetch REAL leads from Apollo.io
 *   2. Generate personalized pitch for each lead
 *   3. Push leads into Instantly.ai campaign for REAL email outreach
 *   4. Log everything — no fake data, no simulations
 */

import { NextResponse } from 'next/server';
import { searchHealthcareLeads, type ApolloLead } from '@/lib/apollo-client';
import { addLeadsToCampaign, type InstantlyLead } from '@/lib/instantly-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for pipeline execution

interface PipelineRequest {
    /** Target states, e.g. ["Florida", "Texas"] */
    states?: string[];
    /** Number of leads to fetch (max 100 per run) */
    count?: number;
    /** Page number for pagination through Apollo results */
    page?: number;
    /** If true, only fetch leads but don't send to Instantly */
    dryRun?: boolean;
}

/**
 * Generate a personalized cold email pitch variable for a lead
 */
function generatePersonalization(lead: ApolloLead): string {
    const painPoints: Record<string, string> = {
        'CEO': `As ${lead.company}'s CEO, you're likely aware that denied claims represent your largest controllable revenue leak`,
        'CFO': `As CFO at ${lead.company}, you know better than anyone — every denied claim sitting unrecovered is cash left on the table`,
        'Medical Director': `Dr. ${lead.lastName}, your clinical expertise already justifies these procedures — our AI ensures the payer acknowledges that`,
        'Practice Manager': `Managing ${lead.company}'s revenue cycle means fighting denials daily. What if that fight was fully automated?`,
        'Revenue Cycle Manager': `Your revenue cycle at ${lead.company} likely has 6-12% of billings trapped in wrongful denials`,
        'Billing Manager': `The billing team at ${lead.company} shouldn't have to spend hours on appeals that AI can draft in seconds`,
        'Administrator': `${lead.company}'s bottom line depends on claim recovery — and right now, most practices leave 8-15% on the table`,
    };

    // Try to match the lead's title to a pain point
    for (const [role, pitch] of Object.entries(painPoints)) {
        if (lead.title.toLowerCase().includes(role.toLowerCase())) {
            return pitch;
        }
    }

    // Default personalization
    return `At ${lead.company}, denied claims likely represent a significant revenue leak. Our AI recovery engine finds and appeals them automatically — zero upfront cost, we only earn when you recover money.`;
}

export async function POST(request: Request) {
    const startTime = Date.now();
    const log: string[] = [];

    try {
        const body: PipelineRequest = await request.json();
        const states = body.states || ['Florida', 'Texas'];
        const count = Math.min(body.count || 25, 100); // Cap at 100 per run
        const page = body.page || 1;
        const dryRun = body.dryRun || false;

        log.push(`[PIPELINE] Starting REAL pipeline run at ${new Date().toISOString()}`);
        log.push(`[PIPELINE] Target: ${states.join(', ')} | Count: ${count} | Page: ${page} | Dry Run: ${dryRun}`);

        // ——————————————————————————————————————————————
        // STEP 1: Fetch REAL leads from Apollo.io
        // ——————————————————————————————————————————————
        log.push(`[STEP 1] Fetching real leads from Apollo.io...`);

        const apolloResult = await searchHealthcareLeads(states, count, page);

        log.push(`[STEP 1] Apollo returned ${apolloResult.leads.length} leads with verified emails (total available: ${apolloResult.totalResults})`);

        if (apolloResult.leads.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No leads found matching criteria. Try different states or broader search.',
                log,
                duration: `${Date.now() - startTime}ms`,
            });
        }

        // Log each lead found
        apolloResult.leads.forEach((lead, i) => {
            log.push(`  [LEAD ${i + 1}] ${lead.firstName} ${lead.lastName} | ${lead.title} @ ${lead.company} | ${lead.email} | ${lead.city}, ${lead.state}`);
        });

        // ——————————————————————————————————————————————
        // STEP 2: Generate personalized pitches
        // ——————————————————————————————————————————————
        log.push(`[STEP 2] Generating personalized outreach for ${apolloResult.leads.length} leads...`);

        const instantlyLeads: InstantlyLead[] = apolloResult.leads.map(lead => ({
            email: lead.email,
            first_name: lead.firstName,
            last_name: lead.lastName,
            company_name: lead.company,
            phone: lead.phone || '',
            website: lead.companyDomain ? `https://${lead.companyDomain}` : '',
            custom_variables: {
                title: lead.title,
                city: lead.city,
                state: lead.state,
                industry: lead.industry || 'Healthcare',
                personalization: generatePersonalization(lead),
                employee_count: String(lead.employeeCount || ''),
            },
        }));

        log.push(`[STEP 2] Personalization complete for all ${instantlyLeads.length} leads`);

        // ——————————————————————————————————————————————
        // STEP 3: Push to Instantly.ai for REAL email outreach
        // ——————————————————————————————————————————————
        if (dryRun) {
            log.push(`[STEP 3] DRY RUN — Skipping Instantly.ai upload. No emails will be sent.`);
            return NextResponse.json({
                success: true,
                dryRun: true,
                leadsFound: apolloResult.leads.length,
                totalAvailable: apolloResult.totalResults,
                leads: apolloResult.leads,
                log,
                duration: `${Date.now() - startTime}ms`,
            });
        }

        log.push(`[STEP 3] Uploading ${instantlyLeads.length} leads to Instantly.ai campaign...`);

        const instantlyResult = await addLeadsToCampaign(instantlyLeads);

        log.push(`[STEP 3] Instantly.ai result: ${instantlyResult.leadsAdded} added, ${instantlyResult.leadsSkipped} skipped`);

        // ——————————————————————————————————————————————
        // DONE
        // ——————————————————————————————————————————————
        const duration = Date.now() - startTime;
        log.push(`[PIPELINE] Pipeline complete in ${duration}ms`);
        log.push(`[PIPELINE] ${instantlyResult.leadsAdded} REAL leads are now being emailed by Instantly.ai`);

        return NextResponse.json({
            success: true,
            dryRun: false,
            apolloLeadsFound: apolloResult.leads.length,
            apolloTotalAvailable: apolloResult.totalResults,
            instantlyLeadsAdded: instantlyResult.leadsAdded,
            instantlyLeadsSkipped: instantlyResult.leadsSkipped,
            currentPage: page,
            log,
            duration: `${duration}ms`,
        });

    } catch (error: any) {
        log.push(`[ERROR] Pipeline failed: ${error.message}`);
        console.error('[PIPELINE ERROR]', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            log,
            duration: `${Date.now() - startTime}ms`,
        }, { status: 500 });
    }
}

/**
 * GET: Quick health check for the pipeline
 */
export async function GET() {
    return NextResponse.json({
        status: 'PIPELINE_READY',
        apolloConfigured: !!process.env.APOLLO_API_KEY,
        instantlyConfigured: !!process.env.INSTANTLY_API_KEY,
        instantlyCampaign: process.env.INSTANTLY_CAMPAIGN_ID || 'NOT_SET',
        instructions: {
            dryRun: 'POST with { "dryRun": true } to test Apollo fetch without sending emails',
            fullRun: 'POST with { "states": ["Florida", "Texas"], "count": 25 } to run the full pipeline',
            paginate: 'Add "page": 2, 3, 4... to paginate through Apollo results',
        },
    });
}
