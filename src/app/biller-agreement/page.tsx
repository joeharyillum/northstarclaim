import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biller Partnership Agreement | NorthStar Medic",
  description: "NorthStar Medic biller partnership agreement — revenue-sharing terms for medical billing professionals.",
};

export default function BillerAgreementPage() {
  return (
    <main style={{ background: "var(--bg-dark)", color: "#fff", minHeight: "100vh" }}>
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "10rem 1.5rem 5rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "1rem" }}>Biller Partnership Agreement</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "3rem" }}>Last updated: March 2026</p>

        <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
          <Section title="1. Parties">
            This Biller Partnership Agreement (&quot;Agreement&quot;) is entered into by and between NorthStar Medic (&quot;Company&quot;) and the undersigned medical billing professional, billing company, or revenue cycle management organization (&quot;Partner&quot;). Together referred to as the &quot;Parties.&quot;
          </Section>

          <Section title="2. Purpose">
            The Company operates an AI-powered medical claim denial recovery platform. The Partner refers healthcare providers (&quot;Referred Clients&quot;) to the platform for denied claim recovery services. This Agreement governs the revenue-sharing arrangement between the Parties.
          </Section>

          <Section title="3. Partner Obligations">
            The Partner agrees to:
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Identify and refer healthcare providers who may benefit from the Company&apos;s claim recovery services</li>
              <li>Ensure that Referred Clients are informed of the Company&apos;s service terms, including the 30% contingency fee on recovered claims</li>
              <li>Not make guarantees of recovery outcomes or revenue amounts on behalf of the Company</li>
              <li>Comply with all applicable federal and state healthcare regulations, including HIPAA, the Anti-Kickback Statute (42 U.S.C. § 1320a-7b), and the Stark Law (42 U.S.C. § 1395nn)</li>
              <li>Maintain accurate records of all referrals and communications with Referred Clients</li>
              <li>Not engage in any deceptive, misleading, or coercive practices when soliciting referrals</li>
            </ul>
          </Section>

          <Section title="4. Company Obligations">
            The Company agrees to:
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Process all denied claims submitted by Referred Clients using its AI-powered recovery platform</li>
              <li>Generate and submit appeal letters in accordance with applicable regulations and payer requirements</li>
              <li>Maintain HIPAA compliance and execute Business Associate Agreements with all Referred Clients before processing PHI</li>
              <li>Provide the Partner with a dashboard to track referrals, claim status, and commission earnings</li>
              <li>Pay Partner commissions within 30 days of confirmed recovery payment</li>
              <li>Not solicit Referred Clients for services outside the scope of this Agreement without Partner consent</li>
            </ul>
          </Section>

          <Section title="5. Revenue Sharing">
            <strong>Recovery Fee:</strong> The Company charges a 30% contingency fee on the gross amount recovered from each successfully appealed claim.
            <br /><br />
            <strong>Revenue Split:</strong> The 30% recovery fee is divided equally between the Parties:
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li><strong>Company:</strong> 15% of recovered amount</li>
              <li><strong>Partner:</strong> 15% of recovered amount</li>
            </ul>
            <br />
            <strong>Example:</strong> If a denied claim of $10,000 is successfully recovered, the total fee is $3,000 (30%). The Company retains $1,500 (15%) and the Partner receives $1,500 (15%).
            <br /><br />
            <strong>Payment Method:</strong> Commission payments are processed via Stripe Connect. The Partner must maintain a valid Stripe account linked to the platform.
            <br /><br />
            <strong>Minimum Threshold:</strong> Commission payments are issued when the Partner&apos;s accrued balance reaches $100 or more. Balances below $100 carry over to the next payment cycle.
          </Section>

          <Section title="6. Referral Tracking">
            Each Partner is assigned a unique partner ID upon registration. Referred Clients are attributed to the Partner when they sign up using the Partner&apos;s referral link or when the Partner registers them through the partner portal. Attribution is permanent for the lifetime of the Referred Client&apos;s account.
          </Section>

          <Section title="7. HIPAA Compliance">
            The Partner acknowledges that the Company&apos;s services involve Protected Health Information (PHI). The Partner agrees to:
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Not access, view, or store any PHI belonging to Referred Clients unless independently authorized to do so under a separate agreement with those clients</li>
              <li>Refer clients to execute the Company&apos;s Business Associate Agreement (BAA) before submitting any PHI</li>
              <li>Report any suspected PHI breach to the Company immediately</li>
            </ul>
          </Section>

          <Section title="8. Anti-Kickback and Stark Law Compliance">
            This Agreement is structured to comply with the Anti-Kickback Statute and Stark Law:
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Compensation is based solely on the value of recovered claims (not volume or value of referrals)</li>
              <li>The Partner is compensated only when a claim is actually recovered — there is no payment for referrals alone</li>
              <li>The arrangement is at fair market value and commercially reasonable</li>
              <li>This Agreement is documented in writing, specifying all material terms of the arrangement</li>
              <li>The Partner&apos;s referral activity is not contingent upon or influenced by the Partner&apos;s clinical decision-making or the clinical decisions of Referred Clients</li>
            </ul>
          </Section>

          <Section title="9. Representations and Warranties">
            Each Party represents and warrants that:
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>It has the legal authority to enter into this Agreement</li>
              <li>It will comply with all applicable federal, state, and local laws and regulations</li>
              <li>It will not engage in any activity that would violate healthcare fraud and abuse laws</li>
              <li>The information provided during registration is accurate and complete</li>
            </ul>
          </Section>

          <Section title="10. Term and Termination">
            <strong>Term:</strong> This Agreement is effective upon electronic signature and continues for an initial term of twelve (12) months, automatically renewing for successive 12-month periods unless either Party provides 30 days&apos; written notice of non-renewal.
            <br /><br />
            <strong>Termination for Cause:</strong> Either Party may terminate this Agreement immediately upon written notice if the other Party materially breaches any provision and fails to cure within 15 days of notice.
            <br /><br />
            <strong>Termination for Convenience:</strong> Either Party may terminate this Agreement at any time with 30 days&apos; written notice.
            <br /><br />
            <strong>Effect of Termination:</strong> Upon termination, the Partner remains entitled to commission payments for all claims that were submitted before termination and are subsequently recovered. No new referrals will be accepted after the termination date.
          </Section>

          <Section title="11. Limitation of Liability">
            To the maximum extent permitted by law, neither Party shall be liable for any indirect, incidental, special, consequential, or punitive damages. The Company&apos;s total liability under this Agreement shall not exceed the total commissions paid to the Partner in the twelve (12) months preceding the claim.
          </Section>

          <Section title="12. Indemnification">
            Each Party agrees to indemnify and hold harmless the other Party from any claims, losses, or damages arising from a breach of this Agreement, negligence, or violation of applicable law.
          </Section>

          <Section title="13. Independent Contractor">
            The Partner is an independent contractor and not an employee, agent, or representative of the Company. Nothing in this Agreement creates an employment, partnership, or joint venture relationship. The Partner is solely responsible for their own taxes, insurance, and business expenses.
          </Section>

          <Section title="14. Confidentiality">
            Each Party agrees to keep confidential all non-public information disclosed by the other Party, including but not limited to business strategies, client lists, pricing, and technology. This obligation survives termination of this Agreement.
          </Section>

          <Section title="15. Modifications">
            The Company reserves the right to modify the terms of this Agreement with 30 days&apos; written notice to the Partner. Continued participation after the modification effective date constitutes acceptance. If the Partner does not agree to the modified terms, the Partner may terminate this Agreement.
          </Section>

          <Section title="16. Governing Law">
            This Agreement shall be governed by and construed in accordance with the laws of the State of Florida, without regard to conflict of law principles. Any disputes arising under this Agreement shall be resolved through binding arbitration in the State of Florida.
          </Section>

          <Section title="17. Entire Agreement">
            This Agreement, together with the Company&apos;s Terms of Service and Privacy Policy, constitutes the entire agreement between the Parties regarding the subject matter herein and supersedes all prior agreements and understandings.
          </Section>

          <Section title="18. Contact">
            For questions about this Biller Partnership Agreement, contact us at:
            <br /><br />
            NorthStar Medic<br />
            Email: partners@northstarclaim.com
          </Section>

          <div style={{ marginTop: "4rem", textAlign: "center", padding: "3rem", borderRadius: "1.5rem", background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)" }}>
             <h2 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Ready to become a partner?</h2>
             <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Start earning 15% override commission on every recovered claim from your referrals.</p>
             <a href="/partner" style={{ 
                display: "inline-block", 
                padding: "1rem 3rem", 
                background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", 
                color: "#000", 
                borderRadius: "var(--radius-full)", 
                textDecoration: "none", 
                fontWeight: "700", 
                fontSize: "1.1rem" 
             }}>
                Accept & Join Program
             </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.75rem" }}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
