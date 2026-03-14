import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// This webhook is designed to be connected to Instantly.ai's "Reply Received" trigger
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Extract data from the Instantly Webhook payload
        const leadEmail = body.lead_email;
        const leadName = body.first_name || "there";
        const companyName = body.company_name || "your clinic";
        const replyText = body.text || body.body_plain || "";
        const campaignId = body.campaign_id;

        if (!replyText || !leadEmail) {
            return NextResponse.json({ error: "Missing reply text or email" }, { status: 400 });
        }

        console.log(`\n🧠 [AI ROUTER] Intercepted reply from ${leadEmail} at ${companyName}`);
        console.log(`💬 Message: "${replyText.substring(0, 100)}..."`);

        // 2. The $1B Fortune 500 Sales Prompt
        const systemPrompt = `
You are the elite Director of Growth for Northstar Claim, an AI-powered medical revenue recovery clearinghouse.
You are negotiating with C-Suite executives (CFOs, CEOs, VPs) at Fortune 500 healthcare systems.
Your goal is to handle their objection or question, and push them to accept a "Free 48-Hour Recovery Scan".

RULES:
- Be highly professional, concise, and definitive.
- Acknowledge their specific question or objection.
- Reiterate the core value: "We find money your current human billers missed, and we only charge a 30% success fee on what we recover."
- End every email with a call to action directing them to: https://northstarclaim.com/free-scan

OBJECTION HANDLING MATRIX:
- If they say "We already have a billing team/agency": Say "We don't replace your team; we act as a safety net. Our AI catches the 5-10% of complex denials that slip past human billers. It's found money."
- If they say "Send more info": Give a 2-sentence summary of the zero-touch pipeline and link the free scan.
- If they say "Not interested": Say "Understood. If you ever want to run a zero-risk historical scan on your written-off A/R, let us know."
- If they say "How does it work?": Explain the 3 steps: 1. Secure upload, 2. AI cross-references state laws to draft appeals, 3. You get paid.

Lead Name: ${leadName}
Company: ${companyName}
`;

        // 3. Generate the response using OpenAI
        const { text: aiResponse } = await generateText({
            model: openai("gpt-4-turbo"),
            system: systemPrompt,
            prompt: `The executive replied with: "${replyText}"\n\nDraft the exact email response to send back to them.`,
            temperature: 0.3, // Keep it professional and calculated
        });

        console.log(`✅ [AI ROUTER] Drafted elite response for ${companyName}`);

        // 4. In a production environment, we would use the Instantly API to automatically reply.
        // For safety in this phase, we log it so you can review the AI's closing ability.
        
        // TODO: Wire up Instantly API v2 POST /reply endpoint here to make it 100% zero-touch

        return NextResponse.json({
            success: true,
            action: "drafted_response",
            data: {
                to: leadEmail,
                draft: aiResponse
            }
        });

    } catch (error: any) {
        console.error("❌ [AI ROUTER] Error handling webhook:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
