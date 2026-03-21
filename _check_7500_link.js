require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function check7500Link() {
    console.log('🔍 Checking $7,500 Growth Lattice link...');
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: 'test@example.com',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Growth Lattice - NorthStar Medic',
                        },
                        unit_amount: 750000,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/signup',
            cancel_url: 'http://localhost:3000/pricing',
        });
        console.log('✅ Successfully created session:');
        console.log('URL:', session.url);
        console.log('ID:', session.id);
    } catch (e) {
        console.error('❌ FAILED to create session:', e.message);
    }
}

check7500Link();
