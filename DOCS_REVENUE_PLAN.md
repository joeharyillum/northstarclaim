# NORTHSTAR MEDIC — REVENUE & PARTNERSHIP ARCHITECTURE

## 1. STRATEGIC POSITIONING: "THE GENESIS FUNNEL"
To eliminate friction for new, skeptical clinics, the platform leading strategy is the **Genesis 100% Performance Plan**.

### THE GENESIS PLAN ($0 UPFRONT)
- **Setup Fee**: $0 (Bypasses budget approvals)
- **Commission**: 40% of recovered funds
- **Philosophy**: "We only win if you win."
- **Nurture**: Automated via SendGrid for clinics that sign the BAA but haven't uploaded claims.

---

## 2. PARTNER PROFIT SPLIT (BILLERS & ASSOCIATES)
To attract "Whale" billers who already have 50-100 clinic relationships, we offer a **40% Revenue Share**.

### THE 40/60 PARTNER SPLIT
- **NorthStar Collects**: X% Commission from Clinic (e.g., 30% or 40%).
- **Split**: 
  - **40%** to the Biller/Partner (Passive income for their relationship).
  - **60%** to NorthStar (Covers AI scale, legal drafting, and platform).
- **Automation**: Managed via Stripe Connect. Funds are split at the moment of payout.

---

## 3. CORE TIER PRICING (FOR THE CHATBOT)
The AI Assistant ("Dr. Sarah") should prioritize recommending these 3 tiers:

| PLAN | SETUP | COMMISSION | TARGET |
| :--- | :--- | :--- | :--- |
| **GENESIS** | **$0** | **40%** | New Clinics / Skeptics |
| **GUARDIAN**| **$2,500** | **30%** | Mid-size Private Practices |
| **GROWTH**  | **$7,500** | **20%** | Multi-facility Medical Groups |

---

## 4. CONVERSION PIPELINE (CLOSING LOGIC)
1. **The Scan**: Clinic provides ERA/EOB data → AI runs a "Potential Recovery Estimate".
2. **The BAA**: Chatbot collects details → Generates HIPAA BAA via SendGrid/API.
3. **The Activation**: Once BAA is signed, SendGrid sends a "Tier Selection" link.
4. **The Closing**: Stripe Checkout processes the setup (if any) or confirms the performance fee mandate.

---

## 5. AUTHENTICATION & SECURITY
- **Unified Login**: One portal for Admins, Billers, and Clients.
- **2FA**: Required for all roles (Google Auth or 6-Digit Email Code).
- **OAuth**: Google/Apple Login (Placeholders in .env).
