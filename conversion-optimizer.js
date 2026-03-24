#!/usr/bin/env node

/**
 * 🎯 CONVERSION OPTIMIZATION ENGINE
 * Maximize ROI from 5,000 medical_whales leads
 * Focus: Quality over Quantity
 */

require('dotenv').config();
const fs = require('fs');

const CONFIG = {
    TARGET_OPEN_RATE: 0.25,      // 25% (industry avg: 20%)
    TARGET_CLICK_RATE: 0.15,     // 15% of opens (industry avg: 5%)
    TARGET_REPLY_RATE: 0.05,     // 5% of sends (excellent for cold email)
    TARGET_SIGNUP_RATE: 0.10,    // 10% of replies (1 in 10 replies becomes signup)
};

// Conversion funnel with your current numbers
const CURRENT_FUNNEL = {
    sends: 0,
    opens: 0,
    clicks: 0,
    replies: 0,
    signups: 0
};

/**
 * Calculate conversion metrics
 */
function calculateMetrics() {
    const metrics = {
        openRate: CURRENT_FUNNEL.sends > 0 ? (CURRENT_FUNNEL.opens / CURRENT_FUNNEL.sends) * 100 : 0,
        clickRate: CURRENT_FUNNEL.opens > 0 ? (CURRENT_FUNNEL.clicks / CURRENT_FUNNEL.opens) * 100 : 0,
        replyRate: CURRENT_FUNNEL.sends > 0 ? (CURRENT_FUNNEL.replies / CURRENT_FUNNEL.sends) * 100 : 0,
        signupRate: CURRENT_FUNNEL.replies > 0 ? (CURRENT_FUNNEL.signups / CURRENT_FUNNEL.replies) * 100 : 0,
    };
    
    return metrics;
}

/**
 * Project revenue based on conversion rates
 */
function projectRevenue(leads = 5000) {
    const metrics = calculateMetrics();
    
    // Estimated value per signup
    const VALUE_PER_SIGNUP = 50000;  // Average claim recovery value
    const COMMISSION_RATE = 0.30;    // 30% contingency fee
    
    const projectedReplies = leads * (CONFIG.TARGET_REPLY_RATE);
    const projectedSignups = projectedReplies * CONFIG.TARGET_SIGNUP_RATE;
    const projectedRevenue = projectedSignups * VALUE_PER_SIGNUP * COMMISSION_RATE;
    
    return {
        replies: Math.ceil(projectedReplies),
        signups: Math.ceil(projectedSignups),
        revenue: Math.ceil(projectedRevenue),
        revenuePerLead: Math.ceil(projectedRevenue / leads)
    };
}

/**
 * Email optimization recommendations
 */
function getOptimizationTips() {
    const metrics = calculateMetrics();
    
    const tips = [];
    
    if (metrics.openRate < 25) {
        tips.push({
            metric: 'Open Rate',
            current: metrics.openRate.toFixed(1) + '%',
            target: '25%',
            improvement: 'Subject line A/B test: Use urgency + personalization',
            example: '"[URGENT] {{companyName}} leaving $XXk on table"'
        });
    }
    
    if (metrics.clickRate < 15) {
        tips.push({
            metric: 'Click Rate',
            current: metrics.clickRate.toFixed(1) + '%',
            target: '15%',
            improvement: 'CTA optimization: Make button clear, add social proof',
            example: 'Button: "See Free Pilot" instead of "Learn More"'
        });
    }
    
    if (metrics.replyRate < 5) {
        tips.push({
            metric: 'Reply Rate',
            current: metrics.replyRate.toFixed(1) + '%',
            target: '5%',
            improvement: 'Use direct question in email body, ask for response',
            example: '"Would a 48-hour pilot be worth 15 minutes?" → Ask for YES/NO'
        });
    }
    
    if (metrics.signupRate < 10) {
        tips.push({
            metric: 'Signup Rate',
            current: metrics.signupRate.toFixed(1) + '%',
            target: '10%',
            improvement: 'Improve landing page + follow-up sequence',
            example: 'Add video demo, pricing clarity, trust signals'
        });
    }
    
    return tips;
}

/**
 * Display conversion dashboard
 */
function displayDashboard() {
    console.log('\n' + '═'.repeat(80));
    console.log('🎯 CONVERSION OPTIMIZATION DASHBOARD');
    console.log('═'.repeat(80) + '\n');
    
    const metrics = calculateMetrics();
    const projection = projectRevenue();
    
    // Current Funnel
    console.log('📊 CURRENT CONVERSION FUNNEL');
    console.log('─'.repeat(80));
    console.log(`  Sends:     ${CURRENT_FUNNEL.sends.toLocaleString()} emails`);
    console.log(`  Opens:     ${CURRENT_FUNNEL.opens.toLocaleString()} (${metrics.openRate.toFixed(1)}%)`);
    console.log(`  Clicks:    ${CURRENT_FUNNEL.clicks.toLocaleString()} (${metrics.clickRate.toFixed(1)}%)`);
    console.log(`  Replies:   ${CURRENT_FUNNEL.replies.toLocaleString()} (${metrics.replyRate.toFixed(1)}%)`);
    console.log(`  Signups:   ${CURRENT_FUNNEL.signups.toLocaleString()}\n`);
    
    // Targets
    console.log('🎯 CONVERSION TARGETS (Industry Best)');
    console.log('─'.repeat(80));
    console.log(`  Open Rate:         ${(CONFIG.TARGET_OPEN_RATE * 100).toFixed(0)}% (current: ${metrics.openRate.toFixed(1)}%)`);
    console.log(`  Click-Through:     ${(CONFIG.TARGET_CLICK_RATE * 100).toFixed(0)}% of opens (current: ${metrics.clickRate.toFixed(1)}%)`);
    console.log(`  Reply Rate:        ${(CONFIG.TARGET_REPLY_RATE * 100).toFixed(1)}% of sends (current: ${metrics.replyRate.toFixed(1)}%)`);
    console.log(`  Signup Rate:       ${(CONFIG.TARGET_SIGNUP_RATE * 100).toFixed(0)}% of replies (current: ${metrics.signupRate.toFixed(1)}%)\n`);
    
    // Revenue Projections
    console.log('💰 REVENUE PROJECTIONS (5,000 leads)');
    console.log('─'.repeat(80));
    console.log(`  Projected Replies:    ${projection.replies.toLocaleString()} (at 5% rate)`);
    console.log(`  Projected Signups:    ${projection.signups.toLocaleString()} (10% of replies)`);
    console.log(`  Projected Revenue:    $${projection.revenue.toLocaleString()}`);
    console.log(`  Revenue per Lead:     $${projection.revenuePerLead.toLocaleString()}\n`);
    
    // Optimization tips
    const tips = getOptimizationTips();
    if (tips.length > 0) {
        console.log('⚡ OPTIMIZATION OPPORTUNITIES');
        console.log('─'.repeat(80));
        tips.forEach((tip, i) => {
            console.log(`\n  ${i + 1}. ${tip.metric.toUpperCase()}`);
            console.log(`     Current:      ${tip.current}`);
            console.log(`     Target:       ${tip.target}`);
            console.log(`     Action:       ${tip.improvement}`);
            console.log(`     Example:      ${tip.example}`);
        });
    }
    
    console.log('\n' + '═'.repeat(80) + '\n');
}

// Run dashboard
displayDashboard();

// Export for use in other scripts
module.exports = {
    CONFIG,
    calculateMetrics,
    projectRevenue,
    getOptimizationTips,
    CURRENT_FUNNEL
};
