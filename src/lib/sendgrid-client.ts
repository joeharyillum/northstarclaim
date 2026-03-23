/**
 * SendGrid Transactional Email Client
 * 
 * Handles all outbound emails: welcome, BAA confirmation, payment receipts,
 * recovery updates, and compliance notifications.
 * 
 * Domain: northstarclaim.com (SPF/DKIM authenticated)
 */

import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Sanitize Env Variables
const SENDGRID_API_KEY = (process.env.SENDGRID_API_KEY || '').replace(/['"]/g, '').trim();
const FROM_EMAIL = (process.env.SENDGRID_FROM_EMAIL || 'noreply@northstarclaim.com').replace(/['"]/g, '').trim();
const FROM_NAME = (process.env.SENDGRID_FROM_NAME || 'NorthStar Claim').replace(/['"]/g, '').trim();

// Porkbun SMTP Credentials (FREE & UNLIMITED FALLBACK)
const PORKBUN_USER = 'joehary@northstarmedic.com';
const PORKBUN_PASS = (process.env.PORKBUN_SMTP_PASSWORD || 'joehary888888881A#a').replace(/['"]/g, '').trim();
const PORKBUN_HOST = 'fortress.porkbun.com';

// ─── Initialize Providers ───────────────────────────────────

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const from = { email: FROM_EMAIL, name: FROM_NAME };

// Create Nodemailer Transporter
const transporter = PORKBUN_PASS ? nodemailer.createTransport({
  host: PORKBUN_HOST,
  port: 465,
  secure: true,
  auth: {
    user: PORKBUN_USER,
    pass: PORKBUN_PASS
  }
}) : null;

// ─── Unified Send Function ──────────────────────────────────

async function sendEmail(options: { to: string; subject: string; html: string }) {
  // If we have Porkbun SMTP (Unlimited & Free), use it as primary
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${FROM_NAME}" <${PORKBUN_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      });
      console.log('[EMAIL_CLIENT] Sent via Porkbun SMTP');
      return;
    } catch (error: any) {
      console.error('[EMAIL_CLIENT] Porkbun SMTP failed, falling back to SendGrid:', error.message);
    }
  }

  // Fallback to SendGrid
  if (SENDGRID_API_KEY) {
    await sgMail.send({
      to: options.to,
      from,
      subject: options.subject,
      html: options.html
    });
    console.log('[EMAIL_CLIENT] Sent via SendGrid');
  } else {
    throw new Error('No email provider configured (SendGrid key missing and Porkbun SMTP password missing)');
  }
}

// ─── Email Senders ──────────────────────────────────────────

export async function sendWelcomeEmail(to: string, clinicName: string) {
  await sendEmail({
    to,
    subject: `Welcome to NorthStar Claim, ${clinicName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#1a365d;">Welcome to NorthStar Claim</h1>
        <p>Hi ${escapeHtml(clinicName)},</p>
        <p>Your account has been created and your BAA has been signed. You're ready to start recovering denied claims.</p>
        <h3>What happens next:</h3>
        <ul>
          <li><strong>Upload denied claims</strong> — our AI analyzes each one automatically</li>
          <li><strong>AI-generated appeals</strong> — medically coded, legally compliant letters drafted instantly</li>
          <li><strong>Track recovery</strong> — see real-time progress in your War Room dashboard</li>
        </ul>
        <p>If you have questions, reply to this email or contact us at <a href="mailto:support@northstarclaim.com">support@northstarclaim.com</a>.</p>
        <p style="color:#666;font-size:12px;margin-top:30px;">NorthStar Claim — AI-Powered Medical Claim Recovery</p>
      </div>
    `,
  });
}

export async function sendBaaConfirmationEmail(to: string, userName: string, signedAt: Date, ipAddress: string | null) {
  await sendEmail({
    to,
    subject: 'BAA Signed — NorthStar Claim',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#1a365d;">Business Associate Agreement Signed</h1>
        <p>Hi ${escapeHtml(userName)},</p>
        <p>This confirms your Business Associate Agreement (BAA) has been electronically signed.</p>
        <table style="border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:8px;font-weight:bold;">Date:</td><td style="padding:8px;">${signedAt.toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">IP Address:</td><td style="padding:8px;">${ipAddress || 'N/A'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Agreement:</td><td style="padding:8px;">HIPAA Business Associate Agreement</td></tr>
        </table>
        <p>This agreement remains in effect for the duration of our business relationship. A copy is stored securely for compliance purposes.</p>
        <p style="color:#666;font-size:12px;margin-top:30px;">NorthStar Claim — HIPAA Compliant Medical Claim Recovery</p>
      </div>
    `,
  });
}

export async function sendPaymentReceiptEmail(
  to: string,
  amount: number,
  tier: string,
  transactionId: string,
) {
  const tierNames: Record<string, string> = {
    'guardian-pilot': 'Guardian Pilot',
    'growth-lattice': 'Growth Lattice',
  };
  const tierName = tierNames[tier] || tier;
  const dollars = (amount / 100).toFixed(2);

  await sendEmail({
    to,
    subject: `Payment Received — $${dollars}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#1a365d;">Payment Confirmation</h1>
        <p>Thank you for your payment.</p>
        <table style="border-collapse:collapse;margin:20px 0;width:100%;">
          <tr style="background:#f7fafc;"><td style="padding:10px;font-weight:bold;">Plan</td><td style="padding:10px;">${escapeHtml(tierName)}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Amount</td><td style="padding:10px;">$${dollars} USD</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:10px;font-weight:bold;">Transaction ID</td><td style="padding:10px;font-size:12px;">${escapeHtml(transactionId)}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Date</td><td style="padding:10px;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td></tr>
        </table>
        <p>Your account is now active. Visit your <a href="https://www.northstarmedic.com/dashboard">dashboard</a> to get started.</p>
        <p style="color:#666;font-size:12px;margin-top:30px;">NorthStar Claim — AI-Powered Medical Claim Recovery</p>
      </div>
    `,
  });
}

export async function sendPaymentFailedEmail(to: string, invoiceId: string) {
  await sendEmail({
    to,
    subject: 'Payment Failed — Action Required',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#c53030;">Payment Failed</h1>
        <p>We were unable to process your subscription payment.</p>
        <p>Please update your payment method to avoid any interruption in service.</p>
        <p><a href="https://www.northstarmedic.com/dashboard/billing" style="background:#1a365d;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Update Payment Method</a></p>
        <p style="color:#666;font-size:12px;">Invoice ID: ${escapeHtml(invoiceId)}</p>
        <p style="color:#666;font-size:12px;margin-top:30px;">NorthStar Claim — AI-Powered Medical Claim Recovery</p>
      </div>
    `,
  });
}

export async function sendRecoveryUpdateEmail(
  to: string,
  clinicName: string,
  claimsRecovered: number,
  totalRecovered: number,
) {
  const dollars = totalRecovered.toFixed(2);

  await sgMail.send({
    to,
    from,
    subject: `Recovery Update — $${dollars} Recovered`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#1a365d;">Recovery Report</h1>
        <p>Hi ${escapeHtml(clinicName)},</p>
        <p>Here's your latest recovery update:</p>
        <div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
          <p style="font-size:32px;font-weight:bold;color:#276749;margin:0;">$${dollars}</p>
          <p style="color:#276749;margin:5px 0 0;">Total Recovered</p>
        </div>
        <p><strong>${claimsRecovered}</strong> claims successfully recovered so far.</p>
        <p><a href="https://www.northstarmedic.com/dashboard/war-room">View Full Report →</a></p>
        <p style="color:#666;font-size:12px;margin-top:30px;">NorthStar Claim — AI-Powered Medical Claim Recovery</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail({
    to,
    from,
    subject: 'Reset Your Password — NorthStar Claim',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#1a365d;">Reset Your Password</h1>
        <p>A request to reset your password was made. Click the button below to choose a new password:</p>
        <p style="margin:30px 0;">
          <a href="${resetUrl}" style="background:#1a365d;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Reset Password</a>
        </p>
        <p>If you did not request this, you can safely ignore this email. This link will expire in 1 hour.</p>
        <p style="font-size:12px;color:#666;margin-top:30px;word-break:break-all;">
          Or copy and paste this link: <br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color:#666;font-size:12px;margin-top:30px;">NorthStar Claim — AI-Powered Medical Claim Recovery</p>
      </div>
    `,
  });
}

export async function sendAdminNotification(subject: string, message: string) {
  const adminEmail = process.env.FOUNDER_ADMIN_EMAIL || 'joehary@northstarmedic.com';

  await sendEmail({
    to: adminEmail,
    from,
    subject: `[ADMIN] ${subject}`,
    html: `
      <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:20px;background:#1a1a2e;color:#e0e0e0;">
        <h2 style="color:#00d4ff;">NorthStar Admin Alert</h2>
        <pre style="white-space:pre-wrap;">${escapeHtml(message)}</pre>
        <p style="color:#666;font-size:11px;margin-top:30px;">Automated notification — ${new Date().toISOString()}</p>
      </div>
    `,
  });
}

// ─── Helpers ────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
