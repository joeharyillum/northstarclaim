# NORTHSTAR MEDIC — AI AGENT CONTINUATION FILE
> **Last Updated:** March 17, 2026  
> **Purpose:** Read this file FIRST so you can resume work without scanning the entire codebase.

---

## PROJECT LOCATION
```
C:\Users\illum\Desktop\mediclaim-ai
```

## WHAT THIS IS
NorthStar Medic — AI-powered medical claim denial recovery platform.  
Cold email leads → AI auto-reply → Stripe checkout → AI processes claims → auto-appeals → revenue.

## TECH STACK
| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + globals.css (dark space theme) |
| Database | Neon PostgreSQL via Prisma ORM (13 models) |
| Auth | NextAuth v5 |
| Payments | Stripe (Checkout + Connect + Webhooks) |
| AI | OpenAI GPT-4o (14-agent pipeline) |
| Email | SendGrid (transactional) + Porkbun SMTP (sender) |
| Cold Email | Instantly.ai (250 leads loaded, campaign "NorthStar Denied Claims Recovery", email account SMTP disconnected — needs manual reconnect) |
| Lead Source | Apollo.io |
| Deployment | Railway (auto-deploys from GitHub push via Dockerfile, Node 22) |
| Domain | northstarmedic.com |
| GitHub | github.com/joeharyillum/northstarclaim.git (branch: master) |

## KEY DIRECTORIES
```
src/app/                  → Pages (App Router)
src/app/api/              → API routes
src/app/dashboard/        → Authenticated dashboard pages
src/components/           → Shared React components
src/lib/                  → Core libraries (prisma, security, AI engines, sendgrid)
prisma/schema.prisma      → Database schema (13 models)
.env                      → Environment variables (NEVER commit)
SOLO_FOUNDER_REVENUE_PLAN.js → Business strategy/revenue plan
```

## CRITICAL FILES (read these when needed)
| File | Purpose |
|------|---------|
| `src/middleware.ts` | 7-layer security: IP ban, rate limit, HTTPS, auth, admin guard |
| `src/lib/security.ts` | Rate limiting, brute-force protection, AML checks |
| `src/lib/orchestrator.ts` | Master AI orchestrator — routes claims to best strategy |
| `src/lib/owner-session.ts` | Auth helper — returns session or null |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/sendgrid-client.ts` | All outbound email functions |
| `src/app/api/stripe/checkout/route.ts` | PUBLIC checkout (no auth required) |
| `src/app/api/webhook/stripe/route.ts` | Payment webhook + commission splits |
| `src/app/api/webhook/instantly/route.ts` | AI auto-responder for cold email replies |
| `src/app/api/webhook/inbound-email/route.ts` | SendGrid inbound parse (legal@, partners@, support@) |
| `src/app/api/analyze/route.ts` | GPT-4o claim analysis |
| `src/app/api/generate-appeal/route.ts` | AI appeal letter generation |
| `src/app/api/free-scan/route.ts` | Public free scan API (GPT-4o powered) |
| `src/components/Navigation.tsx` | Global nav header |
| `next.config.ts` | Next.js config (security headers, HIPAA caching) |

## DATABASE MODELS (Prisma)
```
User              → Clinic admin or biller (has stripeAccountId for Connect)
Account/Session   → NextAuth standard
UploadBatch       → Group of uploaded claim files
Payer             → Insurance company routing data (fax/address)
Claim             → Core claim (CPT code, billed amount, denial reason, status)
Appeal            → AI-drafted appeal letter for a claim
Negotiation       → War Room live negotiation state
Invoice           → Recovery invoice with billerCommission field
Payment           → Stripe checkout payments ($2,500/$7,500 tiers)
PhysicalDispatch  → Fax/mail tracking
AuditLog          → HIPAA compliance logging
Lead              → Apollo/Instantly cold email leads
```

## DASHBOARD ROUTES
```
/dashboard              → Main overview
/dashboard/claims       → Claim tracking
/dashboard/upload       → Upload claims (admin)
/dashboard/review       → Manual review (admin)
/dashboard/leads        → Lead management (admin)
/dashboard/invoices     → Billing & invoices
/dashboard/settlements  → Settlement tracking
/dashboard/wallet       → Financial wallet
/dashboard/negotiate    → Live negotiation
/dashboard/war-room     → War room (admin)
/dashboard/command      → Command center
```

## API ROUTES
```
PUBLIC (no auth):
  /api/auth/*           → NextAuth endpoints
  /api/chat             → Dr. Sarah chatbot
  /api/stripe/checkout  → Stripe checkout (cold leads can pay)
  /api/free-scan        → AI-powered free claim scan

WEBHOOKS (secret-authenticated):
  /api/webhook/stripe       → Stripe payment events + commission splits
  /api/webhook/instantly    → AI auto-responder for email replies
  /api/webhook/inbound-email → SendGrid inbound parse

AUTHENTICATED:
  /api/claims           → Fetch user's claims
  /api/analyze          → AI claim analysis
  /api/generate-appeal  → Generate appeal letter
  /api/stripe/balance   → Wallet balance
  /api/stripe/invoice   → Invoice history
  /api/stripe/onboard   → Stripe Connect onboarding
  /api/stripe/payout    → Commission payout

ADMIN ONLY:
  /api/system/stats     → System metrics
  /api/leads/*          → Lead management
  /api/pipeline/run     → Run lead pipeline
```

## ENVIRONMENT VARIABLES STATUS
```
✅ CONFIGURED:
  DATABASE_URL, DIRECT_URL          → Neon PostgreSQL
  AUTH_SECRET                       → NextAuth
  OPENAI_API_KEY                    → GPT-4o
  STRIPE_SECRET_KEY                 → Live Stripe key
  SENDGRID_API_KEY                  → Email sending
  INSTANTLY_API_KEY                 → Cold email platform
  INSTANTLY_CAMPAIGN_ID             → Active campaign
  INSTANTLY_WEBHOOK_SECRET          → Webhook verification
  APOLLO_API_KEY                    → Lead enrichment
  INBOUND_EMAIL_SECRET              → SendGrid inbound
  FOUNDER_ADMIN_EMAIL               → joehary@northstarmedic.com
  NEXT_PUBLIC_APP_URL               → https://www.northstarmedic.com

⚠️ ALL SET — NO ACTION REQUIRED:
  STRIPE_WEBHOOK_SECRET              ← CONFIGURED (webhook at https://www.northstarmedic.com/api/webhook/stripe)
  FOUNDER_ADMIN_ID                   ← SET TO: 56116cd1-1794-4c03-8040-c5f6943a4263

📝 These values are in .env locally. ALSO set them in Vercel Dashboard → Project Settings → Environment Variables
```

## WHAT WAS FIXED (March 17, 2026)
1. **Checkout auth blocked cold leads** — Removed `getOwnerSession()` from checkout route. Now public. Leads from cold email can pay without logging in.
2. **Commission split missing** — Added `processCommissionSplit()` to Stripe webhook. Auto-transfers 15% to biller's Stripe Connect account when payments come in.
3. **Free scan was fake** — Rewired to call GPT-4o via `/api/free-scan` API. Now generates real recovery estimates based on clinic name and files uploaded. Falls back to industry averages if API is down.
4. **Free-scan API created** — New public endpoint at `/api/free-scan/route.ts` with rate limiting (3/min per IP).
5. **Middleware updated** — Added `/api/free-scan` to public API routes.
6. **Webhook placeholder warning** — Better error message when `STRIPE_WEBHOOK_SECRET` is still `whsec_REPLACE_ME`.
7. **Navigation overlap** — Fixed CSS flex-wrap and added tablet breakpoints (done in previous session).

## WHAT STILL NEEDS DOING (Priority Order)
### BLOCKING — Must fix before first dollar flows:
1. **Set env vars on Vercel** — `STRIPE_WEBHOOK_SECRET` and `FOUNDER_ADMIN_ID` are set in local .env but MUST also be added to Vercel Dashboard → Project Settings → Environment Variables for production to work.

### HIGH PRIORITY:
3. **Partner/Biller dashboard** — No UI at `/dashboard/partner/` yet. Billers need to see their referred clients, commissions earned, and payout history.
4. **Partner signup flow** — Only the biller-agreement page exists. Need a registration flow where billers create accounts and get referral links.
5. **Referral link generation** — No unique partner referral URLs exist yet. Billers need shareable links that track attributions.

### MEDIUM PRIORITY:
6. **Add MX record on Cloudflare** — `parse.northstarclaim.com` → `mx.sendgrid.net` (priority 10) for SendGrid inbound parse to work. DNS is on Cloudflare (vita.ns.cloudflare.com, wells.ns.cloudflare.com). SendGrid inbound parse is configured for `parse.northstarclaim.com` → `https://www.northstarmedic.com/api/webhook/inbound`
7. **Wire file upload to claim ingest** — The free-scan upload UI doesn't actually process uploaded files through the claim pipeline yet (it uses GPT estimates)
8. **Vapi/Bland phone integration** — War Room live negotiation queues claims but can't make calls yet

### LOW PRIORITY:
9. **Phaxio fax integration** — API keys commented out in .env
10. **Lob certified mail** — Not wired yet
11. **Case study page** — For whale hunting credibility

## REVENUE PLAN SUMMARY
Read `SOLO_FOUNDER_REVENUE_PLAN.js` for full details.
- **Phase 1 (Months 1-3):** Cold email 5,000 leads → close first Guardian Pilot ($2,500) → build case study
- **Phase 2 (Months 4-6):** Scale to 7,500 leads/mo → close first whale hospital → $7M+/month
- **Phase 3 (Months 7-12):** 50,000+ leads → 10 whales + 3 health systems → $50M-$500M/month
- **Current:** 5,000 leads loaded on Instantly, campaign active Mon-Fri, AI auto-responder live

## TERMINAL NOTE
Background terminals start in `C:\Users\illum`. Always prefix commands with:
```
Push-Location C:\Users\illum\Desktop\mediclaim-ai; <your-command>
```

## DESIGN PREFERENCES (from user)
- Dark space theme (#020617 base)
- Brand colors: Electric Blue (#38bdf8), Cyan (#22d3ee), Indigo (#818cf8)
- Glass panels with backdrop blur
- Use "AI-Powered" NOT "Autonomous AI"
- Shiny gradient text with sparkling star animations
- Background images: doctors/surgeons with AI tech, 8K quality
