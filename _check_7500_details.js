require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkLinkDetails() {
    const linkId = 'dRm9AT5EVeIs4793140Ny06';
    try {
        const paymentLinks = await stripe.paymentLinks.list({ limit: 100 });
        const target = paymentLinks.data.find(l => l.url.includes(linkId));
        
        if (target) {
            console.log('✅ Found payment link:', target.id);
            console.log('Status:', target.active ? 'ACTIVE' : 'INACTIVE');
            console.log('URL:', target.url);
            
            // Get line items
            const lineItems = await stripe.paymentLinks.listLineItems(target.id);
            for (const item of lineItems.data) {
                const price = await stripe.prices.retrieve(item.price.id);
                console.log(`- Price (${price.id}): ${price.unit_amount / 100} ${price.currency.toUpperCase()}`);
                const product = await stripe.products.retrieve(price.product);
                console.log(`  Product (${product.id}): ${product.name}`);
            }
        } else {
            console.log('❌ Payment link not found.');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}
checkLinkDetails();
