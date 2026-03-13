# 🛡️ Northstar Claim: Master Operations & Recovery Plan

This document serves as the single source of truth for the Northstar Claim AI infrastructure. It contains everything needed to maintain, scale, and recover the business if system access is interrupted.

## 1. Business Vision & Revenue Architecture
- **Objective:** Scale to $1B+ by automating the medical claim denial appeal process.
- **Value Prop:** "Zero-Human" autonomous recovery. $0 upfront for clinics.
- **Pricing Model:**
  - **Direct Clinic:** 30% of recovered revenue.
  - **Biller Alliance:** 15% to MediClaim AI, 15% to the Referral Partner (50/50 split of the 30% fee).
- **Goal:** MSI Titan 18 Special Edition (Phase 1 Milestone).

## 2. Infrastructure & Environment
- **Local Path:** `C:\Users\illum\Desktop\mediclaim-ai`
- **Frontend/API:** Next.js (Port 3000)
- **Database:** Prisma / SQLite (`dev.db`)
- **Public Domain:** `https://www.northstarclaim.com` (via Cloudflare Tunnel)
- **External Dependencies:**
  - **Apollo API:** Lead Scraping
  - **Instantly.ai:** Cold Email Outreach
  - **Stripe:** Revenue Collection & Splits

## 3. The "Runbook" (Critical Commands)

### A. Start the Business (Frontend & Tunnel)
If the website is down, run these:
1. **Reset Tunnel:**
   ```powershell
   Stop-Process -Name cloudflared -Force
   cloudflared tunnel run northstarclaim
   ```
2. **Start Frontend (Dev Mode):**
   ```powershell
   npm run dev
   ```

### B. Launch the Lead Machine (Autonomous)
1. **Start Scraper (No Credit Mode):**
   ```powershell
   node src/scripts/autopilot.js
   ```
2. **Push to Instantly (Manual Override):**
   ```powershell
   node src/scripts/run-pipeline.js --live --count 50
   ```

### C. System Health Checks
- **Check Backend Logs:** `pm2 logs northstar-backend`
- **Check DB Status:** `node inspect_db.js`
- **Check Pipeline Progress:** `cat pipeline_output_utf8.txt`

## 4. Disaster Recovery & Continuity
- **Code Backup:** The entire project is in `C:\Users\illum\Desktop\mediclaim-ai`.
- **Environment Keys:** Stored in `.env`. **DO NOT LOSE THIS FILE.**
- **Lead Cache:** All scraped leads are backed up in `leads_cache.json`.
- **Server Independence:** The system is configured for Railway.app deployment for cloud redundancy.

## 5. Scaling Plan ($1B Roadmap)
1. **Phase 1 (Current):** Cold email billers/clinics via Instantly.ai.
2. **Phase 2:** API-level integration with EHRs (Epic/Cerner).
3. **Phase 3:** Sell the AI "Truth Engine" to Insurance Payers to optimize their own claims processing.

---
*Created by Antigravity AI for the TOP G. Salute.*
