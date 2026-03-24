/**
 * REAL Outreach Module
 * 
 * Connects to actual APIs — no more setTimeout simulations.
 * This client-side module triggers the server-side pipeline.
 */
"use client";

export interface PipelineConfig {
    states?: string[];
    count?: number;
    page?: number;
    dryRun?: boolean;
}

export interface PipelineResult {
    success: boolean;
    dryRun: boolean;
    apolloLeadsFound?: number;
    apolloTotalAvailable?: number;
    instantlyLeadsAdded?: number;
    instantlyLeadsSkipped?: number;
    leads?: any[];
    log: string[];
    duration: string;
    error?: string;
}

/**
 * Run the REAL pipeline: Apollo → Personalize → Instantly.ai
 */
export async function runRealPipeline(config: PipelineConfig = {}): Promise<PipelineResult> {
    console.log(`[REAL PIPELINE] Initiating real outreach pipeline...`);
    console.log(`[REAL PIPELINE] Config: ${JSON.stringify(config)}`);

    const response = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            states: config.states || ['Florida', 'Texas'],
            count: config.count || 25,
            page: config.page || 1,
            dryRun: config.dryRun ?? false,
        }),
    });

    const result = await response.json();

    if (result.log) {
        result.log.forEach((line: string) => console.log(line));
    }

    return result;
}

/**
 * Check pipeline health
 */
export async function checkPipelineStatus(): Promise<any> {
    const response = await fetch('/api/pipeline/run');
    return response.json();
}

/**
 * Run a mass campaign across multiple pages
 * This auto-paginates through Apollo results and sends all to Instantly
 */
export async function runMassCampaign(
    states: string[] = ['Florida', 'Texas'],
    totalLeads: number = 100,
    dryRun: boolean = false
): Promise<{
    totalProcessed: number;
    totalAdded: number;
    totalSkipped: number;
    pages: number;
    results: PipelineResult[];
}> {
    const perPage = Math.min(totalLeads, 100);
    const totalPages = Math.ceil(totalLeads / perPage);
    const results: PipelineResult[] = [];
    let totalProcessed = 0;
    let totalAdded = 0;
    let totalSkipped = 0;

    console.log(`[MASS CAMPAIGN] Starting: ${totalLeads} total leads across ${totalPages} pages`);

    for (let page = 1; page <= totalPages; page++) {
        console.log(`[MASS CAMPAIGN] Processing page ${page}/${totalPages}...`);

        const result = await runRealPipeline({
            states,
            count: perPage,
            page,
            dryRun,
        });

        results.push(result);
        totalProcessed += result.apolloLeadsFound || 0;
        totalAdded += result.instantlyLeadsAdded || 0;
        totalSkipped += result.instantlyLeadsSkipped || 0;

        // Delay between pages to respect rate limits
        if (page < totalPages) {
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    console.log(`[MASS CAMPAIGN] Complete: ${totalProcessed} processed, ${totalAdded} added, ${totalSkipped} skipped`);

    return {
        totalProcessed,
        totalAdded,
        totalSkipped,
        pages: totalPages,
        results,
    };
}
