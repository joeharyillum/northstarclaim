#!/usr/bin/env node
require('dotenv').config();

async function testWebhook() {
    const payload = {
        lead_email: "test.cfo@examplehospital.com",
        first_name: "John",
        company_name: "Example Hospital",
        text: "We currently use another agency for this. How are you different?",
        campaign_id: process.env.INSTANTLY_CAMPAIGN_ID,
    };

    console.log("Simulating Instantly Webhook to local API...");
    // Since we are running the Next.js server somewhere? Wait, Next.js server is not running right now.
    // I can just import the POST function directly and call it with a mock request.
}

testWebhook();
