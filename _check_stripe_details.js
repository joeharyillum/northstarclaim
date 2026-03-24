const Stripe = require('stripe');
require('dotenv').config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim());

async function main() {
  const paymentLinks = await stripe.paymentLinks.list({ limit: 10 });
  
  for (const pl of paymentLinks.data) {
    const lineItems = await stripe.paymentLinks.listLineItems(pl.id);
    const items = lineItems.data.map(li => {
      return `${li.description || 'unnamed'} - $${(li.price.unit_amount / 100).toFixed(2)}`;
    });
    console.log(`${pl.active ? 'ACTIVE' : 'DEAD'} | ${pl.url} | ${items.join(', ')}`);
  }
}
main().catch(e => console.error(e.message));
