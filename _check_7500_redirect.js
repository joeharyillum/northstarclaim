require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkRedirect() {
    const linkId = 'dRm9AT5EVeIs4793140Ny06';
    try {
        const paymentLinks = await stripe.paymentLinks.list({ limit: 100 });
        const target = paymentLinks.data.find(l => l.url.includes(linkId));
        
        if (target) {
            console.log('Payment Link ID:', target.id);
            console.log('Redirect:', JSON.stringify(target.after_completion, null, 2));
        } else {
            console.log('❌ Link not found.');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}
checkRedirect();
