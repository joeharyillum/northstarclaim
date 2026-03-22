async function checkLiveAPI() {
    try {
        console.log('Hitting https://northstarmedic.com/api/stripe/checkout ...');
        const res = await fetch('https://northstarmedic.com/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tier: 'growth-lattice' })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
checkLiveAPI();
