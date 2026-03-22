require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkBothLinks() {
    const links = [
        'dRm9AT5EVeIs4793140Ny06',
        '3cI14n3wN7g04791X00Ny01'
    ];
    for (const linkId of links) {
        console.log(`\n🔍 Checking details for payment link: ${linkId}...`);
        try {
            const paymentLinks = await stripe.paymentLinks.list({ limit: 100 });
            const target = paymentLinks.data.find(l => l.url.includes(linkId));
            
            if (target) {
                console.log('✅ Found payment link:', target.id);
                console.log('Status:', target.active ? 'ACTIVE' : 'INACTIVE');
                const lineItems = await stripe.paymentLinks.listLineItems(target.id);
                for (const item of lineItems.data) {
                    const price = await stripe.prices.retrieve(item.price.id);
                    console.log(`- Price (${price.id}): ${price.unit_amount / 100} ${price.currency.toUpperCase()}`);
                    const product = await stripe.products.retrieve(price.product);
                    console.log(`  Product (${product.id}): ${product.name}`);
                }
            } else {
                console.log('❌ Link not found.');
            }
        } catch (e) {
            console.error('Error:', e.message);
        }
    }
}
checkBothLinks();
