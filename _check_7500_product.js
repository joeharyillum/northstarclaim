require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkProduct() {
    const prodId = 'prod_UAjZ4FKFFEfg3M';
    try {
        const product = await stripe.products.retrieve(prodId);
        console.log('Product:', product.name, product.active ? 'ACTIVE' : 'INACTIVE');
        
        const prices = await stripe.prices.list({ product: prodId });
        prices.data.forEach(p => {
            console.log(`- Price (${p.id}): ${p.unit_amount/100} ${p.currency.toUpperCase()} ${p.active ? 'ACTIVE' : 'INACTIVE'}`);
        });
    } catch (e) {
        console.error('Error:', e.message);
    }
}
checkProduct();
