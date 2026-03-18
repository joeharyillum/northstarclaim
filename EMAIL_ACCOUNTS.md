# NorthStar Email Accounts & Platforms

## 1. joehary@northstarmedic.com (Porkbun)
- **Platform:** Porkbun email hosting
- **Webmail:** https://webmail.porkbun.com
- **Protocol:** IMAP/SMTP
- **Used for:** Instantly.ai cold outreach campaign
- **Status:** SMTP disconnected on Instantly (status -1) — needs manual reconnect at https://app.instantly.ai
- **DNS:** northstarmedic.com on Cloudflare (serenity.ns / anderson.ns)

## 2. joe@northstarclaim.com (SendGrid)
- **Platform:** SendGrid (transactional + inbound parse)
- **No inbox UI** — emails are processed by webhook
- **Sending:** SendGrid API (free plan, 100/day)
- **Inbound:** parse.northstarclaim.com → webhook at https://www.northstarmedic.com/api/webhook/inbound
- **AI auto-reply:** GPT-4 reads inbound, generates response, sends back via SendGrid
- **From address:** noreply@northstarclaim.com (transactional), joe@northstarclaim.com (outreach)
- **Domain authenticated:** Yes (domain ID: 29946956, SPF/DKIM verified)
- **DNS:** northstarclaim.com on Cloudflare (vita.ns / wells.ns)
- **Pending:** MX record for parse.northstarclaim.com → mx.sendgrid.net (priority 10)

## 3. noreply@northstarclaim.com (SendGrid)
- **Used for:** Welcome emails, BAA confirmations, payment receipts, admin notifications
- **Configured in:** .env as SENDGRID_FROM_EMAIL

## How to Read Emails
| Account | How to read |
|---------|------------|
| joehary@northstarmedic.com | https://webmail.porkbun.com or any IMAP client |
| joe@northstarclaim.com | No inbox — AI handles via webhook. Check AuditLog in dashboard |
| noreply@northstarclaim.com | Send-only, no inbox |

## Daily Auto-Sender
- **Script:** `_daily_send.js` (95 leads/day via SendGrid)
- **Scheduler:** Windows Task Scheduler → "NorthStar-DailySend" at 3PM UTC daily
- **Status:** Ready

## Current Stats (March 18, 2026)
- 119 emails sent via SendGrid (53 delivered, 14 blocked, 4 bounced)
- 756 unique real leads in DB
- SendGrid credits: 100/day (resets daily)
- Instantly account: disconnected (needs manual SMTP reconnect)
