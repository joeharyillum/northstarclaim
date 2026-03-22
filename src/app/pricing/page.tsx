"use client";
import CheckoutButton from "@/components/CheckoutButton";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PricingPage() {
  return (
    <main style={{ background: "var(--bg-dark)", color: "#fff", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "10rem 1.5rem 4rem", position: "relative", overflow: "hidden" }}>
        <div className="section-bg-image" style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "url('/hero-neon-medical.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
          filter: "brightness(0.3) contrast(1.15) saturate(1.1)",
        }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, var(--bg-primary) 0%, rgba(15,23,42,0.85) 50%, var(--bg-primary) 100%)", zIndex: 1 }} />
        <p style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "3px", color: "var(--brand-primary)", marginBottom: "1.5rem" }}>Pricing</p>
        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: "800", marginBottom: "1.5rem", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Performance-Based. <span style={{ color: "var(--brand-primary)" }}>Zero Risk.</span>
        </h1>
        <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
          You never pay upfront. We earn our fee only when we successfully recover your denied claims. Your victory is our revenue.
        </p>
      </section>

      {/* Pricing Cards */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>

          {/* Card 1: Guardian Pilot */}
          <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "2.5rem 2rem", background: "var(--bg-card)", backdropFilter: "blur(12px)", transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "0.5rem" }}>Guardian Pilot</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>Prove the value — risk free</p>
            <div style={{ marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "2.75rem", fontWeight: "800", color: "var(--brand-primary)" }}>$2,500</span>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.85rem" }}>One-time pilot fee + 30% recovery commission</p>
            <ul style={{ textAlign: "left", color: "var(--text-secondary)", lineHeight: "2.4", marginBottom: "2rem", flex: 1 }}>
              <li>✓ 500-Claim Free Pilot Scan</li>
              <li>✓ Full AI Denial Analysis</li>
              <li>✓ Recovery Estimate Report</li>
              <li>✓ 30% Commission on Recoveries</li>
              <li>✓ HIPAA Compliant + BAA Included</li>
              <li>✓ 48-Hour Processing Window</li>
            </ul>
            <CheckoutButton tier="guardian-pilot" label="Start Pilot — $2,500" variant="outline" directUrl="https://buy.stripe.com/28E3cv9Vb57SavxfNQ0Ny00" />
          </div>

          {/* Card 2: Growth Lattice — Featured */}
          <div style={{ border: "2px solid var(--brand-primary)", borderRadius: "var(--radius-xl)", padding: "2.5rem 2rem", background: "rgba(56,189,248,0.04)", boxShadow: "0 0 40px rgba(56,189,248,0.12)", position: "relative", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", color: "#000", padding: "0.35rem 1rem", borderRadius: "var(--radius-full)", fontSize: "0.7rem", fontWeight: "800", marginBottom: "1rem", width: "fit-content", textTransform: "uppercase", letterSpacing: "1px" }}>⭐ Recommended</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--brand-primary)" }}>Growth Lattice</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>Maximum scale, minimum commission</p>
            <div style={{ marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "2.75rem", fontWeight: "800", color: "var(--brand-primary)" }}>$7,500</span>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.85rem" }}>Setup fee + reduced 20% recovery commission</p>
            <ul style={{ textAlign: "left", color: "var(--text-secondary)", lineHeight: "2.4", marginBottom: "2rem", flex: 1 }}>
              <li>✓ Unlimited Claim Processing</li>
              <li>✓ 20% Commission (lower rate)</li>
              <li>✓ Full HIPAA/BAA Compliance</li>
              <li>✓ Multi-Level AI Appeal Engine</li>
              <li>✓ Automated Payer Submission</li>
              <li>✓ Priority 24-Hour Processing</li>
              <li>✓ Dedicated Recovery Dashboard</li>
              <li>✓ Stripe Auto-Payout Integration</li>
            </ul>
            <CheckoutButton tier="growth-lattice" label="Start Recovery — $7,500" variant="gradient" directUrl="https://buy.stripe.com/dRm9AT5EVeIs4793140Ny06" />
          </div>

          {/* Card 3: Network Core */}
          <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "2.5rem 2rem", background: "var(--bg-card)", backdropFilter: "blur(12px)", transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "0.5rem" }}>Network Core</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>Enterprise health systems & networks</p>
            <div style={{ marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "2.75rem", fontWeight: "800", color: "#a855f7" }}>Custom</span>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.85rem" }}>Volume pricing for 5,000+ claims/month</p>
            <ul style={{ textAlign: "left", color: "var(--text-secondary)", lineHeight: "2.4", marginBottom: "2rem", flex: 1 }}>
              <li>✓ Direct EHR Integration (Epic, Cerner)</li>
              <li>✓ Custom Volume Commission Rate</li>
              <li>✓ Dedicated Account Manager</li>
              <li>✓ White-Label Option Available</li>
              <li>✓ SLA Guarantees (99.9% Uptime)</li>
              <li>✓ HIPAA Compliant + BAA</li>
              <li>✓ Custom API Access</li>
            </ul>
            <a href="mailto:sales@northstarmedic.com" style={{ display: "block", padding: "0.85rem", border: "1px solid #a855f7", borderRadius: "var(--radius-lg)", textAlign: "center", color: "#a855f7", textDecoration: "none", fontWeight: "600", transition: "all 0.2s" }}>Contact Sales</a>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ border: "1px solid rgba(56,189,248,0.2)", borderRadius: "var(--radius-2xl)", padding: "3rem 2.5rem", background: "rgba(56,189,248,0.02)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "3px", color: "var(--brand-primary)", marginBottom: "1rem" }}>For Medical Billers & RCM Agencies</p>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "1rem" }}>50/50 Biller Partner Program</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "2rem", maxWidth: "700px" }}>
            You already manage provider relationships. Our AI recovers their denied claims. We split the performance fee 50/50 — you earn on every recovery without lifting a finger.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
              <h4 style={{ color: "var(--brand-primary)", marginBottom: "0.5rem", fontSize: "1rem" }}>50/50 Split</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Fair revenue share on every successful recovery.</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
              <h4 style={{ color: "var(--brand-primary)", marginBottom: "0.5rem", fontSize: "1rem" }}>Zero Cost</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>No setup fees. No software cost. Pure performance.</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
              <h4 style={{ color: "var(--brand-primary)", marginBottom: "0.5rem", fontSize: "1rem" }}>Instant Payouts</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Stripe Connect auto-splits — paid within 48 hours.</p>
            </div>
          </div>
          <a href="/signup" style={{ display: "inline-block", padding: "0.85rem 2rem", background: "var(--brand-primary)", color: "#000", borderRadius: "var(--radius-lg)", textDecoration: "none", fontWeight: "700", fontSize: "0.95rem" }}>Apply as Partner</a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        <h2 style={{ textAlign: "center", marginBottom: "3rem", fontSize: "2rem", fontWeight: "800" }}>Frequently Asked</h2>
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {[
            { q: "When do I pay?", a: "You only pay when we successfully recover your denied claims. The pilot fee covers our AI analysis costs. Commission is charged only on money we put back in your pocket." },
            { q: "What's the difference between Guardian Pilot and Growth Lattice?", a: "Guardian Pilot is a $2,500 one-time entry point with 30% commission — ideal for proving value. Growth Lattice is $7,500 setup with a reduced 20% commission — better economics at scale." },
            { q: "Is this HIPAA compliant?", a: "Yes. Full HIPAA compliance with signed BAA before any PHI is processed. All data is encrypted in transit via TLS. We follow healthcare industry security best practices." },
            { q: "How fast do you process claims?", a: "Our AI processes claims within 48 hours of submission. Appeals are generated and submitted to payers automatically." },
            { q: "Can I cancel anytime?", a: "Yes. No long-term contracts. Cancel anytime. You only owe commission on claims already recovered." },
            { q: "How does the Biller Partner Program work?", a: "You connect your existing provider clients to our platform. When we recover their denied claims, the 30% fee is split 50/50 between you and us. You earn 15% on every recovery — automatically via Stripe." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.25rem" }}>
              <h4 style={{ color: "var(--brand-primary)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: "600" }}>{faq.q}</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", textAlign: "center", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-secondary)" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: "800" }}>Ready to Get Started?</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem", fontSize: "1.1rem", maxWidth: "500px", margin: "0 auto 2.5rem" }}>Choose the plan that fits your practice and start recovering denied claims today.</p>
        <a href="/signup" style={{ display: "inline-block", padding: "1rem 2.5rem", background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", color: "#000", borderRadius: "var(--radius-lg)", textDecoration: "none", fontWeight: "700", fontSize: "1.05rem" }}>Start Your Pilot</a>
      </section>
    </main>
  );
}
