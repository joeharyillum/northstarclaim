require('dotenv').config();
const https = require('https');

// Check Porkbun SMTP settings for joehary@northstarmedic.com
async function checkPorkbunEmail() {
    const apiKey = process.env.PORKBUN_API_KEY;
    const secretKey = process.env.PORKBUN_SECRET_KEY;
    
    console.log('🔍 Checking Porkbun email settings for northstarmedic.com...');
    
    try {
        const res = await fetch('https://api.porkbun.com/api/json/v3/email/listForwards/northstarmedic.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apikey: apiKey, secretapikey: secretKey })
        });
        const data = await res.json();
        console.log('Email forwards:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }

    // Print the SMTP settings to copy into Instantly
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 INSTANTLY SMTP RECONNECT SETTINGS FOR:');
    console.log('   joehary@northstarmedic.com (Porkbun)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('STEP 1: Go to https://app.instantly.ai/app/settings/mailboxes');
    console.log('STEP 2: Find joehary@northstarmedic.com → click "Reconnect" or "Edit"');
    console.log('STEP 3: Use these exact settings:');
    console.log('');
    console.log('  Email:         joehary@northstarmedic.com');
    console.log('  SMTP Host:     smtp.porkbun.com');
    console.log('  SMTP Port:     587  (TLS) or 465 (SSL)');
    console.log('  IMAP Host:     imap.porkbun.com');
    console.log('  IMAP Port:     993  (SSL)');
    console.log('  Username:      joehary@northstarmedic.com');
    console.log('  Password:      [Your Porkbun email password]');
    console.log('');
    console.log('STEP 4: Test connection → Save');
    console.log('STEP 5: Go back to campaign → click ▶️ Play');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('If you forgot the Porkbun email password:');
    console.log('→ Go to https://porkbun.com → Log in → "Email Hosting" → Reset password');
    console.log('');
}

checkPorkbunEmail();
