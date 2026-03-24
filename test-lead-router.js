// test-lead-router.js
const testLeadRouting = async () => {
    const payloads = [
        {
            leadEmail: "dr.smith@example.com",
            leadName: "Dr. Smith",
            emailBody: "We already use a large billing agency and I don't think we need another software tool right now. Please take me off this list."
        },
        {
            leadEmail: "billing@cityhospital.com",
            leadName: "",
            emailBody: "How does the pricing work? Do you integrate with Epic?"
        },
        {
            // Simulating an Instantly.ai incoming webhook payload
            lead_email: "mark@instantly-sim.com",
            lead_first_name: "Mark",
            text: "This sounds interesting. Let's set up a quick demo to see the zero-touch appeal process.",
            campaign_id: "idx_instantly_1"
        }
    ];

    console.log("--- Starting AI Sales Executive Router Test ---\n");

    for (const payload of payloads) {
        try {
            const response = await fetch("http://localhost:3000/api/leads/ingest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            console.log(`Lead: ${payload.leadEmail}`);
            console.log(`Original Email: "${payload.emailBody}"`);
            console.log(`AI Classification: [${data.decision.classification}]`);
            console.log(`AI Generated Reply:\n${data.decision.generatedEmailReplyText}\n`);
            console.log("--------------------------------------------------\n");
        } catch (e) {
            console.error("Test failed:", e);
        }
    }
};

testLeadRouting();
