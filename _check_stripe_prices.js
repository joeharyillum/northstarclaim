const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim());

async function findLinks() {
  const paymentLinks = await stripe.paymentLinks.list({ limit: 20 });
  console.log('=== STRIPE LINKS BY PRICE ===');
  for (const pl of paymentLinks.data) {
    if (!pl.active) continue;
    
    // Retrieve line items to see price
    const items = await stripe.paymentLinks.listLineItems(pl.id, { limit: 1 });
    const price = items.data[0]?.price;
    if (price) {
      const amount = price.unit_amount / 100;
      console.log(`$${amount} | URL: ${pl.url}`);
    }
  }
}
findLinks();
