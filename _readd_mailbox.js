require('dotenv').config();

async function deleteAndReadd() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const email = 'joehary@northstarmedic.com';
    
    // Step 1: Delete the broken account (no body needed for DELETE)
    console.log('🗑️ Deleting broken mailbox account...');
    const delRes = await fetch(`https://api.instantly.ai/api/v2/accounts/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${apiKey}` }
        // No Content-Type or body for DELETE
    });
    
    let delData = {};
    try { delData = await delRes.json(); } catch(e) {}
    console.log(`Delete status: ${delRes.status}`, JSON.stringify(delData, null, 2));
    
    if (delRes.status >= 400) {
        console.error('❌ Could not delete. Trying direct re-add instead...');
    } else {
        console.log('✅ Deleted successfully. Waiting 2s...');
        await new Promise(r => setTimeout(r, 2000));
    }
    
    // Step 2: Re-add with SMTP credentials
    // The user's Porkbun email password is needed here.
    // We need to ask them or check if it's stored anywhere.
    console.log('\n📧 Attempting to create account with SMTP credentials...');
    const createRes = await fetch('https://api.instantly.ai/api/v2/accounts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            first_name: 'Joe',
            last_name: 'Illum',
            smtp_host: 'smtp.porkbun.com',
            smtp_port: 587,
            smtp_username: email,
            smtp_password: 'PORKBUN_PASSWORD_NEEDED',
            imap_host: 'imap.porkbun.com',
            imap_port: 993,
            imap_username: email,
            imap_password: 'PORKBUN_PASSWORD_NEEDED',
        })
    });
    const createData = await createRes.json();
    console.log(`Create status: ${createRes.status}`, JSON.stringify(createData, null, 2));
    
    // Also check what fields are required
    if (createData.message) {
        console.log('\n⚠️  Field requirements from API:', createData.message);
    }
}

deleteAndReadd();
