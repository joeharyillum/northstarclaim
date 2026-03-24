/**
 * Instantly.ai REAL API Client
 * 
 * Sends REAL cold emails through Instantly.ai campaign.
 * Uses the v2 API for compatibility with current account keys.
 * 
 * Zero simulation. Real emails to real inboxes.
 */

const INSTANTLY_V2_BASE = 'https://api.instantly.ai/api/v2';

export interface InstantlyLead {
    email: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    personalization?: string;
    phone?: string;
    website?: string;
    custom_variables?: Record<string, string>;
}

export interface InstantlyAddResult {
    success: boolean;
    leadsAdded: number;
    leadsSkipped: number;
    error?: string;
}

/**
 * Add leads to an Instantly.ai campaign — REAL API call (v2)
 * Note: Performs individual requests as v2 bulk endpoint is restricted/different.
 */
export async function addLeadsToCampaign(
    leads: InstantlyLead[],
    campaignId?: string
): Promise<InstantlyAddResult> {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaign = campaignId || process.env.INSTANTLY_CAMPAIGN_ID;

    if (!apiKey) {
        throw new Error('INSTANTLY_API_KEY is not set in environment variables');
    }
    if (!campaign) {
        throw new Error('INSTANTLY_CAMPAIGN_ID is not set in environment variables');
    }

    let totalAdded = 0;
    let totalSkipped = 0;

    console.log(`[INSTANTLY] Processing ${leads.length} leads for campaign ${campaign} via v2`);

    for (const lead of leads) {
        try {
            // Add campaign to the lead object as per v2 requirements
            const payload: any = {
                ...lead,
                campaign: campaign,
                skip_if_in_workspace: true,
            };

            const response = await fetch(`${INSTANTLY_V2_BASE}/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                // If it's already in the campaign/workspace, Instantly might return 400 or a specific error
                if (errorText.includes('already exists') || response.status === 409) {
                    totalSkipped++;
                    continue;
                }
                console.warn(`[INSTANTLY] Skipping lead ${lead.email} due to error: ${response.status} - ${errorText}`);
                totalSkipped++;
                continue;
            }

            totalAdded++;

            // Minimal throttle to respect rate limits
            await new Promise(r => setTimeout(r, 100));

        } catch (err: any) {
            console.error(`[INSTANTLY] Failed lead ${lead.email}:`, err.message);
            totalSkipped++;
        }
    }

    console.log(`[INSTANTLY] Campaign upload complete: ${totalAdded} added, ${totalSkipped} skipped`);

    return {
        success: true,
        leadsAdded: totalAdded,
        leadsSkipped: totalSkipped,
    };
}

/**
 * Get campaign analytics from Instantly
 */
export async function getCampaignStatus(campaignId?: string): Promise<any> {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaign = campaignId || process.env.INSTANTLY_CAMPAIGN_ID;

    if (!apiKey || !campaign) {
        throw new Error('Instantly API key or campaign ID missing');
    }

    const response = await fetch(
        `${INSTANTLY_V2_BASE}/campaigns/${campaign}/analytics`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Instantly analytics error: ${response.status} - ${errorText}`);
    }

    return response.json();
}

/**
 * List all campaigns to verify connection
 */
export async function listCampaigns(): Promise<any> {
    const apiKey = process.env.INSTANTLY_API_KEY;
    if (!apiKey) throw new Error('INSTANTLY_API_KEY not set');

    const response = await fetch(
        `${INSTANTLY_V2_BASE}/campaigns`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Instantly list error: ${response.status} - ${errorText}`);
    }

    return response.json();
}
