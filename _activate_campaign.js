require('dotenv').config();

async function activateCampaign() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = '93700fc2-53a9-4b1d-8989-cb3d1d1e424b';
    
    console.log(`🚀 Activating campaign: ${campaignId}...`);
    
    // Instantly V2 Resume endpoint? Or just update status?
    // Let's try to find if there is a 'resume' endpoint.
    // Usually it's /api/v2/campaigns/{id}/resume or /api/v2/campaigns/{id}/pause
    
    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}/resume`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        let data = {};
        try {
            data = await res.json();
        } catch(e) {}
        
        if (res.ok) {
            console.log('✅ Successfully activated campaign!');
            console.log('Response:', data);
        } else {
            console.error('❌ FAILED to activate campaign:', res.status, data);
            
            // Try fallback: update status directly if resume endpoint doesn't work
            console.log('Trying fallback update status...');
            const res2 = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 1 }) // 1 is often active
            });
            const data2 = await res2.json();
            console.log('Fallback Response:', data2);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

activateCampaign();
