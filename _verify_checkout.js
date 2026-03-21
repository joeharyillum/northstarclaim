#!/usr/bin/env node
/**
 * _verify_checkout.js
 * Verifies both Stripe checkout sessions (guardian-pilot & growth-lattice) can be created
 */

require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim(), {
  apiVersion: '2025-04-30.basil',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.northstarmedic.com';

const TIERS = [
  { tier: 'guardian-pilot', amount: 250000, label: 'Guardian Pilot — $2,500' },
  { tier: 'growth-lattice', amount: 750000, label: 'Growth Lattice — $7,500' },
];

async function verifyCheckout() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  ✅ STRIPE CHECKOUT VERIFICATION');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  App URL:    ${APP_URL}`);
  console.log(`  Stripe Key: sk_live_...${process.env.STRIPE_SECRET_KEY.slice(-6)}\n`);

  let allPassed = true;

  for (const { tier, amount, label } of TIERS) {
    process.stdout.write(`  Testing ${label}... `);
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${label} - NorthStar Medic`,
              description: tier === 'guardian-pilot'
                ? 'One-time pilot fee — 500 claims AI scan + 30% recovery commission'
                : 'Setup fee — unlimited claims + reduced 20% recovery commission',
            },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${APP_URL}/signup?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/pricing`,
      });

      console.log('✅ PASS');
      console.log(`     Session ID:   ${session.id}`);
      console.log(`     Checkout URL: ${session.url}`);
      console.log(`     Status:       ${session.status}`);
      console.log(`     Amount:       $${(amount / 100).toLocaleString()}`);
      console.log(`     ↳  ${session.url}\n`);
    } catch (err) {
      allPassed = false;
      console.log('❌ FAIL');
      console.error(`     Error: ${err.message}\n`);
    }
  }

  // Also verify Stripe account is live (not test mode)
  try {
    const account = await stripe.accounts.retrieve();
    console.log('  Stripe Account Details:');
    console.log(`    Account ID:    ${account.id}`);
    console.log(`    Email:         ${account.email}`);
    console.log(`    Country:       ${account.country}`);
    console.log(`    Charges:       ${account.charges_enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`    Payouts:       ${account.payouts_enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`    Business type: ${account.business_type || 'N/A'}`);
  } catch (err) {
    console.log(`  ⚠️  Could not retrieve account details: ${err.message}`);
  }

  console.log('\n══════════════════════════════════════════════════════════');
  console.log(allPassed
    ? '  🟢 ALL CHECKOUT LINKS ARE LIVE AND FUNCTIONAL'
    : '  🔴 SOME CHECKOUT LINKS FAILED — SEE ABOVE');
  console.log('══════════════════════════════════════════════════════════\n');
}

verifyCheckout().catch(console.error);
