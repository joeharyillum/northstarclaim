#!/usr/bin/env node

/**
 * 🎯 NORTHSTAR INSTANTLY CAMPAIGN MONITOR
 * Real-time tracking of lead engagement, opens, clicks, replies
 */

require('dotenv').config();

const CONFIG = {
    REFRESH_INTERVAL: 30000, // Update every 30 seconds
    API_BASE: 'https://api.instantly.ai/api/v2'
};

let sessionStart = new Date();

/**
 * Get campaign stats from Instantly
 */
async function getCampaignStats() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    if (!apiKey || !campaignId) {
        console.error('❌ Missing INSTANTLY_API_KEY or INSTANTLY_CAMPAIGN_ID');
        return null;
    }

    try {
        // Fetch campaign stats
        const res = await fetch(`${CONFIG.API_BASE}/campaigns/${campaignId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!res.ok) {
            console.error(`❌ API Error: ${res.status}`);
            return null;
        }

        const data = await res.json();
        return data;
    } catch (e) {
        console.error(`❌ Connection Error: ${e.message}`);
        return null;
    }
}

/**
 * Get campaign leads/stats
 */
async function getLeadStats() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    try {
        const res = await fetch(`${CONFIG.API_BASE}/campaigns/${campaignId}/statistics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data;
    } catch (e) {
        return null;
    }
}

/**
 * Calculate engagement metrics
 */
function calculateMetrics(stats) {
    if (!stats) return null;

    const totalLeads = stats.total_number_of_leads || 0;
    const sent = stats.number_of_sent || 0;
    const opened = stats.number_of_opened || 0;
    const clicked = stats.number_of_clicked || 0;
    const replied = stats.number_of_replied || 0;
    const bounced = stats.number_of_bounced || 0;

    return {
        totalLeads,
        sent,
        opened,
        clicked,
        replied,
        bounced,
        openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : 0,
        clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : 0,
        replyRate: sent > 0 ? ((replied / sent) * 100).toFixed(1) : 0,
        bounceRate: sent > 0 ? ((bounced / sent) * 100).toFixed(1) : 0
    };
}

/**
 * Display beautiful dashboard
 */
function displayDashboard(metrics) {
    console.clear();
    
    console.log('\n' + '═'.repeat(80));
    console.log('🎯 NORTHSTAR INSTANTLY CAMPAIGN MONITOR');
    console.log('═'.repeat(80));
    
    const elapsed = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    
    console.log(`\n⏱️  Campaign Active: ${hours}h ${mins}m | Updated: ${new Date().toLocaleTimeString()}\n`);

    if (!metrics) {
        console.log('❌ Unable to fetch campaign data. Checking API...\n');
        return;
    }

    // OVERVIEW
    console.log('📊 CAMPAIGN OVERVIEW');
    console.log('─'.repeat(80));
    console.log(`  Total Leads Imported:    ${metrics.totalLeads.toLocaleString()}`);
    console.log(`  Emails Sent:             ${metrics.sent.toLocaleString()}`);
    console.log(`  Bounced/Failed:          ${metrics.bounced.toLocaleString()} (${metrics.bounceRate}%)`);
    console.log(`  Active In Campaign:      ${(metrics.sent - metrics.bounced).toLocaleString()}`);

    // ENGAGEMENT
    console.log(`\n💌 ENGAGEMENT METRICS`);
    console.log('─'.repeat(80));
    console.log(`  Opened:                  ${metrics.opened.toLocaleString()} (${metrics.openRate}% open rate)`);
    console.log(`  Clicked:                 ${metrics.clicked.toLocaleString()} (${metrics.clickRate}% click rate)`);
    console.log(`  Replied:                 ${metrics.replied.toLocaleString()} (${metrics.replyRate}% reply rate)`);

    // CONVERSIONS
    console.log(`\n💰 CONVERSION FUNNEL`);
    console.log('─'.repeat(80));
    
    const conversionRate = metrics.replied > 0 ? ((metrics.replied / metrics.sent) * 100).toFixed(2) : '0.00';
    const replyValue = 50000; // Assumed value per first conversation
    const potentialRevenue = metrics.replied * replyValue * 0.30; // 30% fee

    console.log(`  Emails Sent    └─→ ${metrics.sent.toLocaleString()}`);
    console.log(`  Replies Back   └─→ ${metrics.replied.toLocaleString()} (${conversionRate}% conversion)`);
    console.log(`  Estimated Value└─→ $${potentialRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}`);

    // PROJECTIONS
    console.log(`\n📈 PROJECTIONS & TARGETS`);
    console.log('─'.repeat(80));
    
    const targetReplyRate = 0.05; // 5% is excellent for cold email
    const projectedReplies = Math.ceil(metrics.sent * targetReplyRate);
    const projectedRevenue = projectedReplies * replyValue * 0.30;

    console.log(`  At 5% reply rate:        ${projectedReplies.toLocaleString()} replies`);
    console.log(`  Projected Revenue (30%): $${projectedRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
    console.log(`  Time to $10M ARR:        ${Math.ceil(10000000 / projectedRevenue / 12)} months`);

    // RECENT ACTIVITY
    console.log(`\n🔥 THIS SESSION`);
    console.log('─'.repeat(80));
    const recentReplies = metrics.replied; // In real impl, track only this session
    const recentOpens = metrics.opened;
    console.log(`  New Opens:               ${recentOpens.toLocaleString()}`);
    console.log(`  New Replies:             ${recentReplies.toLocaleString()}`);

    // STATUS
    console.log(`\n✅ SYSTEM STATUS`);
    console.log('─'.repeat(80));
    let status = '🟢 HEALTHY';
    if (metrics.bounceRate > 15) status = '🟡 WARNING (High bounce rate)';
    if (metrics.sent === 0) status = '🔴 NO ACTIVITY';
    
    console.log(`  Campaign Health:         ${status}`);
    console.log(`  Next Update:             30 seconds`);
    console.log(`\n` + '═'.repeat(80) + '\n');
}

/**
 * Main loop
 */
async function monitor() {
    while (true) {
        const stats = await getLeadStats();
        const metrics = calculateMetrics(stats);
        displayDashboard(metrics);
        
        // Wait before next update
        await new Promise(r => setTimeout(r, CONFIG.REFRESH_INTERVAL));
    }
}

// Parse CLI args
const args = process.argv.slice(2);
if (args[0] === 'once') {
    // Single check
    (async () => {
        const stats = await getLeadStats();
        const metrics = calculateMetrics(stats);
        displayDashboard(metrics);
    })();
} else {
    // Continuous monitoring
    console.log('🚀 Starting live campaign monitor...\n');
    monitor();
}
