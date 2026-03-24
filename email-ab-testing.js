#!/usr/bin/env node

/**
 * 📧 EMAIL A/B TESTING FRAMEWORK
 * Test subject lines and body copy to maximize opens/replies
 */

require('dotenv').config();
const fs = require('fs');

// A/B Test Templates
const EMAIL_TEMPLATES = {
    // Subject line variants
    subjects: {
        A: 'Recovering denied claims for {{companyName}}',
        B: '[URGENT] {{companyName}} is leaving $XXk on the table',
        C: 'Quick follow-up — denial recovery pilot for {{companyName}}',
        D: '5-10% revenue recovery for {{companyName}} (48-hour pilot)',
        E: '{{firstName}} — {{companyName}} denied claims recovery',
    },
    
    // Body variants
    body: {
        A: `<div>Hi {{firstName}},</div>
<div><br /></div>
<div>I noticed {{companyName}} handles a high volume of insurance claims. Most US health systems lose 5-10% of revenue to preventable denials.</div>
<div><br /></div>
<div>We built an AI that reads denial letters, writes clinical rebuttals, and resubmits — on autopilot. We only charge 30% of what we recover. If we recover nothing, you pay nothing.</div>
<div><br /></div>
<div>Would a free 48-hour pilot on your hardest denials be worth 15 minutes of your time?</div>
<div><br /></div>
<div>Best,<br/>The Northstar Claim AI Team</div>`,

        B: `<div>Hi {{firstName}},</div>
<div><br /></div>
<div>Quick question: What percentage of {{companyName}}'s denied claims are actually recoverable?</div>
<div><br /></div>
<div>Most clinics estimate 3-5%, but we see 30%+ are actually winnable. That's thousands per month in lost revenue.</div>
<div><br /></div>
<div>Our AI automatically recovers these using clinical evidence. No upfront cost - we earn 30% when we succeed.</div>
<div><br /></div>
<div><strong>Could a free 48-hour scan of your toughest denials help you find out?</strong></div>
<div><br /></div>
<div>Reply with YES and we'll have results for you in 2 days.</div>
<div><br /></div>
<div>Best,<br/>The Northstar Claim AI Team</div>`,

        C: `<div>Hi {{firstName}},</div>
<div><br /></div>
<div>{{companyName}} loses an average of {{estimatedLoss}} per month to claim denials.</div>
<div><br /></div>
<div>We recover them automatically. Zero upfront cost. You only pay 30% of recoveries.</div>
<div><br /></div>
<div>48-hour pilot? Secure your slot: https://buy.stripe.com/...</div>
<div><br /></div>
<div>Best,<br/>The Northstar Claim AI Team</div>`,
    },
    
    // CTA variants
    ctas: {
        A: 'Start Free Pilot',
        B: 'Yes, Let\'s Test',
        C: 'Schedule Demo',
        D: 'See It In Action',
        E: 'Get Free Scan'
    }
};

/**
 * Test plan for A/B testing
 */
const TEST_PLAN = {
    phase1: {
        name: 'Subject Line Test',
        duration: '3 days',
        sample: 500,
        variants: ['A', 'B', 'D'],
        metric: 'open_rate',
        winnerThreshold: 5, // 5% difference = winner
        description: 'Test which subject line gets highest open rate'
    },
    
    phase2: {
        name: 'Body Copy Test',
        duration: '3 days',
        sample: 500,
        variants: ['A', 'B', 'C'],
        metric: 'reply_rate',
        winnerThreshold: 2, // 2% difference = winner
        description: 'Test which body copy gets highest reply rate'
    },
    
    phase3: {
        name: 'Full Stack Winner',
        duration: 'ongoing',
        sample: 0, // Use winner from phases 1 & 2
        metric: 'conversion_rate',
        description: 'Deploy winning combination to remaining 4,000 leads'
    }
};

/**
 * Display A/B test roadmap
 */
function displayTestPlan() {
    console.log('\n' + '═'.repeat(80));
    console.log('📧 EMAIL A/B TESTING FRAMEWORK');
    console.log('═'.repeat(80) + '\n');
    
    console.log('📋 TEST ROADMAP\n');
    
    // Phase 1
    console.log('PHASE 1: SUBJECT LINE TEST (Split 500 leads)');
    console.log('─'.repeat(80));
    console.log(`  Duration:     ${TEST_PLAN.phase1.duration}`);
    console.log(`  Sample Size:  ${TEST_PLAN.phase1.sample} leads x ${TEST_PLAN.phase1.variants.length} variants`);
    console.log(`  Metric:       ${TEST_PLAN.phase1.metric} (winner must beat by ${TEST_PLAN.phase1.winnerThreshold}%)`);
    console.log(`\n  Testing These Subject Lines:\n`);
    
    TEST_PLAN.phase1.variants.forEach(variant => {
        console.log(`    ${variant}: "${EMAIL_TEMPLATES.subjects[variant]}"`);
    });
    
    // Phase 2
    console.log(`\n\nPHASE 2: BODY COPY TEST (Split 500 leads)`);
    console.log('─'.repeat(80));
    console.log(`  Duration:     ${TEST_PLAN.phase2.duration}`);
    console.log(`  Sample Size:  ${TEST_PLAN.phase2.sample} leads x ${TEST_PLAN.phase2.variants.length} variants`);
    console.log(`  Metric:       ${TEST_PLAN.phase2.metric} (winner must beat by ${TEST_PLAN.phase2.winnerThreshold}%)`);
    console.log(`  Note:         Use Phase 1 WINNING subject line`);
    console.log(`\n  Testing These Body Variants:\n`);
    
    TEST_PLAN.phase2.variants.forEach(variant => {
        const preview = EMAIL_TEMPLATES.body[variant].substring(0, 100) + '...';
        console.log(`    ${variant}: ${preview}`);
    });
    
    // Phase 3
    console.log(`\n\nPHASE 3: SCALE WINNER (Deploy to remaining 4,000 leads)`);
    console.log('─'.repeat(80));
    console.log(`  Duration:     ${TEST_PLAN.phase3.duration}`);
    console.log(`  Deployment:   Use winning subject + body from Phases 1 & 2`);
    console.log(`  Scale:        Send to remaining 4,000 leads at 500/day`);
    console.log(`  Expected Results:`);
    console.log(`    - If Phase 1 winner: 25% open rate`);
    console.log(`    - If Phase 2 winner: 5%+ reply rate`);
    console.log(`    - Revenue potential: $75,000 - $150,000`);
    
    console.log('\n' + '═'.repeat(80) + '\n');
}

/**
 * Generate A/B test configuration for Instantly
 */
function generateInstantlyConfig() {
    return {
        phase1: {
            name: 'Subject Line A/B Test',
            variants: {
                A: EMAIL_TEMPLATES.subjects.A,
                B: EMAIL_TEMPLATES.subjects.B,
                D: EMAIL_TEMPLATES.subjects.D
            },
            body: EMAIL_TEMPLATES.body.A, // Same body for all
            cta: EMAIL_TEMPLATES.ctas.A,
            sampleSize: 500,
            duration: '3 days'
        },
        phase2: {
            name: 'Body Copy A/B Test',
            subject: '[TO_BE_FILLED]', // From Phase 1 winner
            variants: {
                A: EMAIL_TEMPLATES.body.A,
                B: EMAIL_TEMPLATES.body.B,
                C: EMAIL_TEMPLATES.body.C
            },
            cta: EMAIL_TEMPLATES.ctas.A,
            sampleSize: 500,
            duration: '3 days'
        }
    };
}

/**
 * Calculate win probability for variants
 */
function calculateWinProbability(variantMetrics) {
    const variants = Object.keys(variantMetrics);
    const winner = variants.reduce((best, current) => {
        return variantMetrics[current] > variantMetrics[best] ? current : best;
    });
    
    const winningScore = variantMetrics[winner];
    const avgScore = Object.values(variantMetrics).reduce((a, b) => a + b) / variants.length;
    const confidence = ((winningScore - avgScore) / avgScore) * 100;
    
    return {
        winner,
        confidence: confidence.toFixed(1) + '%',
        improvement: (((winningScore - avgScore) / avgScore) * 100).toFixed(1) + '%'
    };
}

// Display plan
displayTestPlan();

// Export
module.exports = {
    EMAIL_TEMPLATES,
    TEST_PLAN,
    generateInstantlyConfig,
    calculateWinProbability
};
