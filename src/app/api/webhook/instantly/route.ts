import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";

const INSTANTLY_V2_BASE = 'https://api.instantly.ai/api/v2';

// Verify webhook authenticity — check shared secret header
function verifyWebhook(req: NextRequest): boolean {
    const secret = process.env.INSTANTLY_WEBHOOK_SECRET;
    if (!secret) return false; // Reject all requests if no secret configured
    const headerSecret = req.headers.get('x-webhook-secret') || req.headers.get('authorization');
    return headerSecret === secret || headerSecret === `Bearer ${secret}`;
}

// This webhook is connected to Instantly.ai's "Reply Received" trigger
export async function POST(req: NextRequest) {
    try {
        // Verify webhook authenticity
        if (!verifyWebhook(req)) {
            console.error('[WEBHOOK] Invalid webhook secret — possible spoofing attempt');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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

        // Mark lead as replied in database
        try {
            await prisma.lead.updateMany({
                where: { email: leadEmail.toLowerCase() },
                data: { status: 'replied' },
            });
        } catch { /* lead may not exist in DB yet */ }

        // Log the inbound reply for audit
        await prisma.auditLog.create({
            data: {
                userId: 'WEBHOOK',
                action: 'LEAD_REPLY_RECEIVED',
                details: `From: ${leadEmail} @ ${companyName} | Message: ${replyText.substring(0, 200)}`,
            },
        });

        // 2. Elite Sales AI Prompt
        const systemPrompt = `
You are the elite Director of Growth for NorthStar Medic, an AI-powered medical revenue recovery clearinghouse.
You are negotiating with C-Suite executives (CFOs, CEOs, VPs) at Fortune 500 healthcare systems.
Your goal is to handle their objection or question, and push them to accept a "Free 48-Hour Recovery Scan".

RULES:
- Be highly professional, concise, and definitive.
- Acknowledge their specific question or objection.
- Reiterate the core value: "We find money your current human billers missed, and we only charge a 30% success fee on what we recover."
- End every email with a call to action directing them to: https://northstarmedic.com/free-scan
- Keep responses under 150 words.
- Sign off as "Best regards, The NorthStar Medic Team"

OBJECTION HANDLING MATRIX:
- "We already have a billing team/agency": "We don't replace your team; we act as a safety net. Our AI catches the 5-10% of complex denials that slip past human billers. It's found money."
- "Send more info": Give a 2-sentence summary and link the free scan.
- "Not interested": "Understood. If you ever want to run a zero-risk historical scan on your written-off A/R, let us know."
- "How does it work?": 3 steps: 1. Secure upload, 2. AI cross-references state laws to draft appeals, 3. You get paid.
- "Unsubscribe" or "Remove me": Immediately unsubscribe, DO NOT pitch.

Lead Name: ${leadName}
Company: ${companyName}
`;

        // 3. Check for unsubscribe intent first
        const lowerReply = replyText.toLowerCase();
        const isUnsubscribe = ['unsubscribe', 'remove me', 'stop emailing', 'opt out', 'do not contact'].some(
            phrase => lowerReply.includes(phrase)
        );

        if (isUnsubscribe) {
            // Mark as failed/unsubscribed — do NOT auto-reply
            await prisma.lead.updateMany({
                where: { email: leadEmail.toLowerCase() },
                data: { status: 'failed' },
            });
            console.log(`🚫 [AI ROUTER] Unsubscribe request from ${leadEmail} — marked as opted-out`);
            return NextResponse.json({ success: true, action: "unsubscribed", email: leadEmail });
        }

        // 4. Generate AI response
        const { text: aiResponse } = await generateText({
            model: openai("gpt-4-turbo"),
            system: systemPrompt,
            prompt: `The executive replied with: "${replyText}"\n\nDraft the exact email response to send back to them.`,
            temperature: 0.3,
        });

        console.log(`✅ [AI ROUTER] Drafted response for ${companyName}`);

        // 5. AUTO-SEND via Instantly.ai reply API
        const apiKey = process.env.INSTANTLY_API_KEY;
        let autoSent = false;

        if (apiKey && campaignId) {
            try {
                const replyPayload = {
                    campaign_id: campaignId,
                    lead_email: leadEmail,
                    reply_body: aiResponse,
                };

                const response = await fetch(`${INSTANTLY_V2_BASE}/emails/reply`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify(replyPayload),
                });

                if (response.ok) {
                    autoSent = true;
                    console.log(`📬 [AI ROUTER] Auto-replied to ${leadEmail}`);
                } else {
                    const errText = await response.text();
                    console.warn(`⚠️ [AI ROUTER] Instantly reply API returned ${response.status}: ${errText}`);
                }
            } catch (err: any) {
                console.error(`❌ [AI ROUTER] Failed auto-reply to ${leadEmail}:`, err.message);
            }
        }

        // Log outbound for audit
        await prisma.auditLog.create({
            data: {
                userId: 'AI_AGENT',
                action: autoSent ? 'AUTO_REPLY_SENT' : 'REPLY_DRAFTED',
                details: `To: ${leadEmail} @ ${companyName} | AutoSent: ${autoSent} | Response: ${aiResponse.substring(0, 200)}`,
            },
        });

        return NextResponse.json({
            success: true,
            action: autoSent ? "auto_replied" : "drafted_response",
            data: {
                to: leadEmail,
                draft: aiResponse,
                autoSent,
            }
        });

    } catch (error: any) {
        console.error("❌ [AI ROUTER] Error handling webhook:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
