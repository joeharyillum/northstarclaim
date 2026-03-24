import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const FROM_EMAIL = "joe@northstarclaim.com";
const FROM_NAME = "Joe Hary — NorthStar Claim AI";

const systemPrompt = `
You are the elite Director of Growth for NorthStar Medic, an AI-powered medical revenue recovery clearinghouse.
You are negotiating with C-Suite executives (CFOs, CEOs, VPs) at Fortune 500 healthcare systems.
Your goal is to handle their objection or question, and push them to accept a "Free 48-Hour Recovery Scan".

RULES:
- Be highly professional, concise, and definitive.
- Acknowledge their specific question or objection.
- Reiterate the core value: "We find money your current human billers missed, and we only charge a 30% success fee on what we recover."
- End every email with a call to action directing them to: https://www.northstarmedic.com/free-scan
- Keep responses under 150 words.
- Sign off as "Best regards, Joe Hary — NorthStar Claim AI Team"

OBJECTION HANDLING MATRIX:
- "We already have a billing team/agency": "We don't replace your team; we act as a safety net. Our AI catches the 5-10% of complex denials that slip past human billers. It's found money."
- "Send more info": Give a 2-sentence summary and link the free scan.
- "Not interested": "Understood. If you ever want to run a zero-risk historical scan on your written-off A/R, let us know."
- "How does it work?": 3 steps: 1. Secure upload, 2. AI cross-references state laws to draft appeals, 3. You get paid.
- "Unsubscribe" or "Remove me": Immediately unsubscribe, DO NOT pitch.
`;

// SendGrid Inbound Parse sends multipart/form-data
export async function POST(req: NextRequest) {
    try {
        // Verify this is from SendGrid (check for expected fields)
        const formData = await req.formData();

        const from = formData.get("from")?.toString() || "";
        const to = formData.get("to")?.toString() || "";
        const subject = formData.get("subject")?.toString() || "";
        const text = formData.get("text")?.toString() || "";
        const html = formData.get("html")?.toString() || "";
        const envelope = formData.get("envelope")?.toString() || "";

        // Extract sender email from the "from" field (format: "Name <email@domain.com>")
        const emailMatch = from.match(/<([^>]+)>/) || [null, from.split(" ")[0]];
        const senderEmail = (emailMatch[1] || from).trim().toLowerCase();
        const senderName = from.replace(/<[^>]+>/, "").trim() || "there";

        if (!senderEmail || !text) {
            console.log("[INBOUND] Empty sender or text, skipping");
            return NextResponse.json({ ok: true });
        }

        console.log(`\n📨 [INBOUND] Reply from ${senderEmail}`);
        console.log(`📝 Subject: ${subject}`);
        console.log(`💬 Message: "${text.substring(0, 100)}..."`);

        // Look up the lead in DB
        const lead = await prisma.lead.findFirst({
            where: { email: senderEmail },
        });

        const companyName = lead?.company || "your organization";
        const leadName = lead?.firstName || senderName.split(" ")[0] || "there";

        // Mark lead as replied
        if (lead) {
            await prisma.lead.update({
                where: { id: lead.id },
                data: { status: "replied" },
            });
        }

        // Log inbound for audit
        await prisma.auditLog.create({
            data: {
                userId: "INBOUND_WEBHOOK",
                action: "LEAD_REPLY_RECEIVED",
                details: `From: ${senderEmail} @ ${companyName} | Subject: ${subject} | Message: ${text.substring(0, 200)}`,
            },
        });

        // Check for unsubscribe
        const lowerText = text.toLowerCase();
        const isUnsubscribe = [
            "unsubscribe", "remove me", "stop emailing",
            "opt out", "do not contact", "take me off",
        ].some((phrase) => lowerText.includes(phrase));

        if (isUnsubscribe) {
            if (lead) {
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { status: "failed" },
                });
            }
            console.log(`🚫 [INBOUND] Unsubscribe from ${senderEmail} — removed`);
            return NextResponse.json({ ok: true, action: "unsubscribed" });
        }

        // Generate AI response
        const { text: aiResponse } = await generateText({
            model: openai("gpt-4-turbo"),
            system: systemPrompt + `\nLead Name: ${leadName}\nCompany: ${companyName}`,
            prompt: `The executive replied with: "${text}"\n\nDraft the exact email response to send back to them.`,
            temperature: 0.3,
        });

        console.log(`🤖 [INBOUND] AI drafted response for ${senderEmail}`);

        // Auto-reply via SendGrid
        const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;

        const sendPayload = {
            personalizations: [
                {
                    to: [{ email: senderEmail, name: senderName }],
                },
            ],
            from: { email: FROM_EMAIL, name: FROM_NAME },
            reply_to: { email: FROM_EMAIL, name: FROM_NAME },
            subject: replySubject,
            content: [
                { type: "text/plain", value: aiResponse },
                {
                    type: "text/html",
                    value: aiResponse
                        .split("\n")
                        .map((line: string) => (line.trim() ? `<p>${line}</p>` : "<br/>"))
                        .join(""),
                },
            ],
            tracking_settings: {
                click_tracking: { enable: false },
                open_tracking: { enable: false },
            },
        };

        const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SENDGRID_API_KEY}`,
            },
            body: JSON.stringify(sendPayload),
        });

        const autoSent = sgRes.status === 202;

        if (autoSent) {
            console.log(`📬 [INBOUND] Auto-replied to ${senderEmail}`);
        } else {
            const errText = await sgRes.text();
            console.warn(`⚠️ [INBOUND] SendGrid reply failed ${sgRes.status}: ${errText}`);
        }

        // Log outbound
        await prisma.auditLog.create({
            data: {
                userId: "AI_AGENT",
                action: autoSent ? "AUTO_REPLY_SENT" : "REPLY_DRAFTED",
                details: `To: ${senderEmail} @ ${companyName} | AutoSent: ${autoSent} | Response: ${aiResponse.substring(0, 200)}`,
            },
        });

        return NextResponse.json({
            ok: true,
            action: autoSent ? "auto_replied" : "drafted",
            to: senderEmail,
        });
    } catch (err: any) {
        console.error("[INBOUND] Error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
