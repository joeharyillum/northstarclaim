import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NorthStar Medic",
  description: "NorthStar Medic privacy policy — how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <main style={{ background: "var(--bg-dark)", color: "#fff", minHeight: "100vh" }}>
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "10rem 1.5rem 5rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "1rem" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "3rem" }}>Last updated: March 2026</p>

        <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
          <Section title="1. Introduction">
            NorthStar Medic (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website www.northstarmedic.com and provides AI-powered medical claim recovery services. This Privacy Policy describes how we collect, use, disclose, and protect your personal information when you use our services.
          </Section>

          <Section title="2. Information We Collect">
            <strong>Account Information:</strong> When you create an account, we collect your name, email address, and password (stored in hashed form).
            <br /><br />
            <strong>Payment Information:</strong> Payment processing is handled by Stripe. We do not store your credit card numbers. We receive transaction confirmations including amount, email, and subscription status.
            <br /><br />
            <strong>Protected Health Information (PHI):</strong> If you upload medical claims data, we process this information solely for the purpose of generating appeal letters and recovering denied claims. PHI is handled in accordance with HIPAA regulations and our Business Associate Agreement (BAA).
            <br /><br />
            <strong>Usage Data:</strong> We collect standard server logs including IP addresses, browser type, pages visited, and timestamps.
          </Section>

          <Section title="3. How We Use Your Information">
            We use your information to:
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Provide and maintain our medical claim recovery services</li>
              <li>Process payments and manage subscriptions</li>
              <li>Generate AI-powered appeal letters for denied claims</li>
              <li>Communicate with you about your account and services</li>
              <li>Comply with legal obligations including HIPAA requirements</li>
              <li>Improve our services and user experience</li>
            </ul>
          </Section>

          <Section title="4. HIPAA Compliance">
            We are committed to protecting Protected Health Information (PHI) in accordance with the Health Insurance Portability and Accountability Act (HIPAA). Before processing any PHI, we require a signed Business Associate Agreement (BAA). PHI is used solely for claim recovery purposes and is not sold, shared for marketing, or used for any purpose unrelated to your services.
          </Section>

          <Section title="5. Data Sharing">
            We do not sell your personal information. We may share information with:
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li><strong>Service Providers:</strong> Stripe (payments), OpenAI (AI processing under data processing agreements), database hosting providers</li>
              <li><strong>Insurance Payers:</strong> Claim and appeal information is submitted to payers on your behalf as part of the recovery service</li>
              <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
            </ul>
          </Section>

          <Section title="6. Data Security">
            We implement industry-standard security measures including:
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>TLS encryption for all data in transit</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Role-based access controls</li>
              <li>Audit logging of system access</li>
              <li>Security headers (HSTS, CSP, X-Frame-Options)</li>
            </ul>
          </Section>

          <Section title="7. Data Retention">
            We retain your account data for as long as your account is active. Claim data and appeal records are retained for the duration required to complete recovery services and comply with applicable record retention requirements. You may request deletion of your account and personal data by contacting us.
          </Section>

          <Section title="8. Your Rights">
            Depending on your jurisdiction, you may have the right to:
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt out of marketing communications</li>
              <li>Receive a copy of your data in a portable format</li>
            </ul>
            To exercise these rights, contact us at privacy@northstarclaim.com.
          </Section>

          <Section title="9. Cookies">
            We use essential cookies required for authentication and session management. We do not use third-party advertising or tracking cookies.
          </Section>

          <Section title="10. Children&apos;s Privacy">
            Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.
          </Section>

          <Section title="11. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify registered users of material changes via email. Continued use of our services after changes constitutes acceptance of the updated policy.
          </Section>

          <Section title="12. Contact Us">
            If you have questions about this Privacy Policy, contact us at:
            <br /><br />
            NorthStar Medic<br />
            Email: privacy@northstarclaim.com
          </Section>
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
