// Check if Stripe payment links are valid
const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim());

async function main() {
  try {
    // List all payment links
    const paymentLinks = await stripe.paymentLinks.list({ limit: 10 });
    console.log('=== STRIPE PAYMENT LINKS ===');
    if (paymentLinks.data.length === 0) {
      console.log('NO payment links found! The buy.stripe.com links on pricing page are INVALID.');
      console.log('');
      console.log('Creating payment links now...');
      
      // Create products first
      const guardianProduct = await stripe.products.create({
        name: 'Guardian Pilot - NorthStar Medic',
        description: '500-Claim Free Pilot Scan + Full AI Denial Analysis + 30% Commission on Recoveries',
      });
      
      const growthProduct = await stripe.products.create({
        name: 'Growth Lattice - NorthStar Medic',
        description: 'Unlimited Claim Processing + 20% Commission + Priority 24-Hour Processing + Dedicated Dashboard',
      });
      
      // Create prices
      const guardianPrice = await stripe.prices.create({
        product: guardianProduct.id,
        unit_amount: 250000, // $2,500
        currency: 'usd',
      });
      
      const growthPrice = await stripe.prices.create({
        product: growthProduct.id,
        unit_amount: 750000, // $7,500
        currency: 'usd',
      });
      
      // Create payment links
      const guardianLink = await stripe.paymentLinks.create({
        line_items: [{ price: guardianPrice.id, quantity: 1 }],
        after_completion: {
          type: 'redirect',
          redirect: { url: 'https://www.northstarmedic.com/signup?payment=success' },
        },
      });
      
      const growthLink = await stripe.paymentLinks.create({
        line_items: [{ price: growthPrice.id, quantity: 1 }],
        after_completion: {
          type: 'redirect',
          redirect: { url: 'https://www.northstarmedic.com/signup?payment=success' },
        },
      });
      
      console.log('');
      console.log('=== NEW PAYMENT LINKS CREATED ===');
      console.log('Guardian Pilot ($2,500):', guardianLink.url);
      console.log('Growth Lattice ($7,500):', growthLink.url);
      console.log('=================================');
    } else {
      paymentLinks.data.forEach(pl => {
        console.log(`${pl.active ? 'ACTIVE' : 'INACTIVE'} | ${pl.url}`);
        // Show line items
      });
    }
    
    // Also list products to verify
    const products = await stripe.products.list({ limit: 10, active: true });
    console.log('');
    console.log('=== STRIPE PRODUCTS ===');
    products.data.forEach(p => {
      console.log(`${p.name} (${p.id})`);
    });
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}
main();
