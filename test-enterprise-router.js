// test-enterprise-router.js
const testEnterpriseWebhook = async () => {
    // Simulate a webhook payload from an RCM Agency responding to our cold email
    const payload = {
        email: "vp_ops@massive-rcm-billing.com",
        name: "VP of Operations",
        text: "I saw your email. We currently employ 600 people doing nothing but writing manual appeals for our hospital clients. It's a huge cost center. How does your AI work and can we white-label it?",
        campaignId: "rcm_agency_outreach_v1"
    };

    console.log("--- Sending Enterprise Webhook Reply (RCM Agency) ---");
    console.log(`Payload: ${payload.text}\n`);

    try {
        const response = await fetch("http://localhost:3000/api/leads/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log(`Status Code: ${response.status}`);
        console.log(`\nAI Classification: ${data.decision.classification}`);
        console.log(`AI Drafted Response:\n${data.decision.generatedEmailReplyText}`);
        console.log("\n-----------------------------------------------------");
    } catch (e) {
        console.error("Test failed:", e);
    }
};

testEnterpriseWebhook();
