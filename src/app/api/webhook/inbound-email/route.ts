import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";
import sgMail from "@sendgrid/mail";

/**
 * SendGrid Inbound Parse Webhook
 * 
 * Receives all emails sent to *@northstarmedic.com via SendGrid Inbound Parse.
 * Routes to the correct AI persona based on the "to" address, generates a
 * GPT-4 response, sends the reply, and logs everything for HIPAA audit.
 * 
 * Setup required:
 * 1. Porkbun → MX record: northstarmedic.com → mx.sendgrid.net (priority 10)
 * 2. SendGrid → Inbound Parse → hostname: northstarmedic.com
 *    → URL: https://www.northstarmedic.com/api/webhook/inbound-email
 *    → Check "POST the raw, full MIME message" = OFF (use parsed)
 */

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@northstarmedic.com";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "NorthStar Medic";
const ADMIN_EMAIL = process.env.FOUNDER_ADMIN_EMAIL || "joehary@northstarmedic.com";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// ─── Mailbox Routing ────────────────────────────────────────

interface MailboxConfig {
  address: string;
  fromName: string;
  fromEmail: string;
  systemPrompt: string;
  forwardToAdmin: boolean;
}

const MAILBOXES: MailboxConfig[] = [
  {
    address: "legal",
    fromName: "NorthStar Legal",
    fromEmail: "legal@northstarmedic.com",
    forwardToAdmin: true,
    systemPrompt: `You are the Legal Department assistant for NorthStar Medic, an AI-powered medical claim denial recovery company.

ROLE: Handle legal inquiries professionally. You provide general information only — never legal advice.

GUIDELINES:
- Be formal, professional, and concise (under 200 words)
- For simple questions (terms, privacy, BAA), provide direct answers with links
- For complex legal matters (lawsuits, subpoenas, regulatory), acknowledge receipt and say the legal team will follow up within 2 business days
- NEVER provide specific legal advice or opinions on legal disputes
- Direct people to the Terms of Service at https://www.northstarmedic.com/terms
- Direct people to the Privacy Policy at https://www.northstarmedic.com/privacy  
- Direct people to the BAA at https://www.northstarmedic.com/baa
- Direct partner agreement questions to https://www.northstarmedic.com/biller-agreement
- Sign off as "NorthStar Legal Team"

COMPANY INFO:
- NorthStar Medic operates under northstarmedic.com for email
- 30% contingency fee on recovered medical claims
- HIPAA compliant, BAA required before processing PHI
- Florida jurisdiction, binding arbitration
- Biller partners get 15%/15% revenue split`,
  },
  {
    address: "partners",
    fromName: "NorthStar Partnerships",
    fromEmail: "partners@northstarmedic.com",
    forwardToAdmin: true,
    systemPrompt: `You are the Partnerships coordinator for NorthStar Medic, an AI-powered medical claim denial recovery company.

ROLE: Handle inquiries from medical billing professionals interested in becoming biller partners.

GUIDELINES:
- Be enthusiastic but professional (under 200 words)
- Explain the partnership model: billers refer clients, we split the 30% recovery fee 50/50 (15% each)
- Highlight key benefits: zero upfront cost, AI handles all appeals, real-time partner dashboard, Stripe Connect payouts
- Direct them to sign up at https://www.northstarmedic.com/biller-agreement to review terms
- For existing partners with account issues, acknowledge and say the partnerships team will respond within 1 business day
- NEVER promise specific revenue amounts or guarantee recovery rates
- Sign off as "NorthStar Partnerships Team"

PARTNER MODEL:
- 30% contingency fee on recovered claims, split 15/15 between NorthStar and partner
- Permanent client attribution — partners earn on all future recoveries for referred clients
- $100 minimum payout threshold, paid via Stripe Connect
- 12-month auto-renewing agreement, 30-day termination notice`,
  },
  {
    address: "support",
    fromName: "NorthStar Support",
    fromEmail: "support@northstarmedic.com",
    forwardToAdmin: true,
    systemPrompt: `You are the Support assistant for NorthStar Medic, an AI-powered medical claim denial recovery platform.

ROLE: Help existing clients with account, billing, and platform questions.

GUIDELINES:
- Be helpful, empathetic, and concise (under 200 words)
- For account access issues: direct them to https://www.northstarmedic.com/login or suggest resetting password
- For billing questions: direct them to their dashboard at https://www.northstarmedic.com/dashboard
- For claim status questions: acknowledge and say they can check real-time status in the War Room dashboard
- For technical issues: acknowledge, apologize, and say the technical team will investigate within 1 business day
- For HIPAA/privacy concerns: take them seriously, acknowledge, and escalate (the team will respond within 24 hours)
- NEVER share any PHI or account-specific details in email
- Sign off as "NorthStar Support Team"`,
  },
  {
    address: "privacy",
    fromName: "NorthStar Privacy",
    fromEmail: "privacy@northstarmedic.com",
    forwardToAdmin: true,
    systemPrompt: `You are the Privacy Officer assistant for NorthStar Medic.

ROLE: Handle privacy-related inquiries including data access requests, deletion requests, and HIPAA concerns.

GUIDELINES:
- Be formal and compliance-focused (under 200 words)
- For data access requests (right to know): acknowledge receipt, confirm identity verification will be required, and say the privacy team will respond within 10 business days per HIPAA requirements
- For data deletion requests: acknowledge and say the privacy team will process within 30 days
- For breach notifications or HIPAA concerns: treat as urgent, acknowledge immediately, and say the privacy officer will respond within 24 hours
- Direct to Privacy Policy at https://www.northstarmedic.com/privacy
- NEVER confirm or deny whether specific individuals are clients
- Sign off as "NorthStar Privacy Office"`,
  },
];

// Fallback for any unrecognized address
const DEFAULT_MAILBOX: MailboxConfig = {
  address: "default",
  fromName: FROM_NAME,
  fromEmail: FROM_EMAIL,
  forwardToAdmin: true,
  systemPrompt: `You are an AI assistant for NorthStar Medic, an AI-powered medical claim denial recovery company.

GUIDELINES:
- Be professional and helpful (under 150 words)
- For general inquiries, provide brief info about the company and direct to https://www.northstarmedic.com
- For specific department questions, suggest the right email: legal@, partners@, support@, or privacy@northstarmedic.com
- Sign off as "NorthStar Claim Team"`,
};

// ─── Webhook Handler ────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Webhook auth: verify shared secret to prevent unauthorized access
  const webhookSecret = process.env.INBOUND_EMAIL_SECRET;
  if (webhookSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Basic ${webhookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // SendGrid Inbound Parse sends multipart/form-data
    const formData = await req.formData();

    const toRaw = (formData.get("to") as string) || "";
    const fromRaw = (formData.get("from") as string) || "";
    const senderEmail = extractEmail(fromRaw);
    const senderName = extractName(fromRaw);
    const subject = (formData.get("subject") as string) || "(no subject)";
    const textBody = (formData.get("text") as string) || "";
    const htmlBody = (formData.get("html") as string) || "";
    const spamScore = parseFloat((formData.get("spam_score") as string) || "0");

    // Use plain text body, fall back to stripping HTML
    const messageBody = textBody || stripHtml(htmlBody);

    if (!senderEmail || !messageBody.trim()) {
      console.log("[INBOUND] Empty email or no sender — ignoring");
      return NextResponse.json({ success: true, action: "ignored" });
    }

    // Spam filter — reject high spam scores
    if (spamScore > 5) {
      console.log(`[INBOUND] Spam detected (score: ${spamScore}) from ${senderEmail} — dropping`);
      await logAudit("INBOUND_SPAM_DROPPED", `From: ${senderEmail} | Score: ${spamScore} | Subject: ${subject}`);
      return NextResponse.json({ success: true, action: "spam_dropped" });
    }

    console.log(`\n📧 [INBOUND] Email received`);
    console.log(`   From: ${senderEmail} (${senderName})`);
    console.log(`   To: ${toRaw}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${messageBody.substring(0, 100)}...`);

    // Route to the correct mailbox
    const targetAddress = extractLocalPart(toRaw);
    const mailbox = MAILBOXES.find((m) => m.address === targetAddress) || DEFAULT_MAILBOX;

    console.log(`   Routed to: ${mailbox.address}@ mailbox`);

    // Log inbound for HIPAA audit
    await logAudit(
      "INBOUND_EMAIL_RECEIVED",
      `From: ${senderEmail} | To: ${targetAddress}@northstarmedic.com | Subject: ${subject} | Body: ${messageBody.substring(0, 300)}`
    );

    // Generate AI response
    const { text: aiResponse } = await generateText({
      model: openai("gpt-4-turbo"),
      system: mailbox.systemPrompt,
      prompt: `Incoming email from ${senderName} (${senderEmail}).
Subject: ${subject}

Message:
${messageBody.substring(0, 2000)}

Draft a professional email response.`,
      temperature: 0.3,
    });

    console.log(`   AI response generated (${aiResponse.length} chars)`);

    // Send the AI reply
    await sgMail.send({
      to: senderEmail,
      from: { email: mailbox.fromEmail, name: mailbox.fromName },
      subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
      text: aiResponse,
      html: formatReplyHtml(aiResponse, mailbox.fromName),
    });

    console.log(`   ✅ Reply sent to ${senderEmail} from ${mailbox.fromEmail}`);

    // Forward to admin for visibility
    if (mailbox.forwardToAdmin) {
      await sgMail.send({
        to: ADMIN_EMAIL,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `[${mailbox.address.toUpperCase()} INBOX] ${subject} — from ${senderEmail}`,
        html: `
          <div style="font-family:monospace;max-width:700px;padding:20px;background:#1a1a2e;color:#e0e0e0;">
            <h2 style="color:#00d4ff;">Inbound Email — ${escapeHtml(mailbox.address)}@northstarmedic.com</h2>
            <table style="border-collapse:collapse;width:100%;margin:10px 0;">
              <tr><td style="padding:6px;color:#888;">From:</td><td style="padding:6px;">${escapeHtml(senderName)} &lt;${escapeHtml(senderEmail)}&gt;</td></tr>
              <tr><td style="padding:6px;color:#888;">Subject:</td><td style="padding:6px;">${escapeHtml(subject)}</td></tr>
              <tr><td style="padding:6px;color:#888;">Spam Score:</td><td style="padding:6px;">${spamScore}</td></tr>
            </table>
            <h3 style="color:#ff9f43;">Original Message:</h3>
            <pre style="white-space:pre-wrap;background:#0d1117;padding:15px;border-radius:6px;">${escapeHtml(messageBody.substring(0, 3000))}</pre>
            <h3 style="color:#2ed573;">AI Response Sent:</h3>
            <pre style="white-space:pre-wrap;background:#0d1117;padding:15px;border-radius:6px;">${escapeHtml(aiResponse)}</pre>
            <p style="color:#666;font-size:11px;margin-top:20px;">Auto-processed at ${new Date().toISOString()}</p>
          </div>
        `,
      });
    }

    // Log outbound reply for audit
    await logAudit(
      "INBOUND_EMAIL_AUTO_REPLIED",
      `To: ${senderEmail} | From: ${mailbox.fromEmail} | Subject: Re: ${subject} | Response: ${aiResponse.substring(0, 300)}`
    );

    return NextResponse.json({
      success: true,
      action: "auto_replied",
      mailbox: mailbox.address,
      from: senderEmail,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[INBOUND] Error processing inbound email:", message);

    await logAudit("INBOUND_EMAIL_ERROR", `Error: ${message}`).catch(() => {});

    // Return 200 so SendGrid doesn't retry endlessly
    return NextResponse.json({ success: false, error: message }, { status: 200 });
  }
}

// ─── Helpers ────────────────────────────────────────────────

/** Extract email from "Name <email@domain.com>" format */
function extractEmail(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  if (match) return match[1].toLowerCase();
  // Might just be a plain email
  const emailMatch = raw.match(/[\w.+-]+@[\w.-]+\.\w+/);
  return emailMatch ? emailMatch[0].toLowerCase() : "";
}

/** Extract display name from "Name <email@domain.com>" format */
function extractName(raw: string): string {
  const match = raw.match(/^"?([^"<]+)"?\s*</);
  if (match) return match[1].trim();
  return extractEmail(raw).split("@")[0];
}

/** Extract local part (before @) from a To address */
function extractLocalPart(to: string): string {
  const email = extractEmail(to);
  return email.split("@")[0].toLowerCase();
}

/** Strip HTML tags for plain text fallback */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

/** Format AI response as HTML email */
function formatReplyHtml(text: string, teamName: string): string {
  const paragraphs = text
    .split("\n\n")
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      ${paragraphs}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:30px 0 15px;">
      <p style="color:#999;font-size:12px;">${escapeHtml(teamName)} — NorthStar Medic | <a href="https://www.northstarmedic.com">www.northstarmedic.com</a></p>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function logAudit(action: string, details: string) {
  await prisma.auditLog.create({
    data: {
      userId: "INBOUND_EMAIL",
      action,
      details: details.substring(0, 1000),
    },
  });
}
