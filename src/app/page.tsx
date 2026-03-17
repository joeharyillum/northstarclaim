import Button from "@/components/Button";
import Link from "next/link";
import { Metadata } from "next";
import LiveRevenueTicker from "@/components/LiveRevenueTicker";

export const metadata: Metadata = {
  title: "NorthStar Medic | AI-Powered Medical Claim Recovery",
  description:
    "Stop losing revenue to denied insurance claims. NorthStar Medic's AI-powered platform recovers denied medical claims faster than any manual process. HIPAA compliant, enterprise-grade.",
  alternates: {
    canonical: "https://northstarmedic.com",
  },
};

export default function Home() {
  return (
    <>
      {/* Hero Section - The Neural Guardian */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        padding: "clamp(4rem, 8vw, 8rem) 0",
        background: "var(--bg-primary)",
        perspective: "1200px",
      }}>

        {/* Background Image - Neon Medical Future */}
        <div className="hero-bg-image" style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "url('/hero-neon-medical.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          zIndex: 0,
          filter: "brightness(0.45) contrast(1.15) saturate(1.1)",
          transform: "scale(1.05)"
        }} />

        {/* Dark gradient overlay for text readability */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(to bottom, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.55) 50%, var(--bg-primary) 100%)",
          zIndex: 1
        }} />

        {/* 3D Floating Orbs */}
        <div className="orb orb-1" style={{ top: "10%", left: "-5%", zIndex: 2 }} />
        <div className="orb orb-2" style={{ top: "30%", right: "-10%", zIndex: 2 }} />
        <div className="orb orb-3" style={{ bottom: "5%", left: "20%", zIndex: 2 }} />

        {/* 3D Perspective Grid Floor */}
        <div className="perspective-grid" style={{ zIndex: 2 }} />

        {/* 3D Rotating Ring behind title */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 3, pointerEvents: "none" }}>
          <div className="hero-ring" />
          <div className="hero-ring" style={{ width: "480px", height: "480px", top: "60px", left: "60px", animationDirection: "reverse", animationDuration: "45s", borderColor: "rgba(129, 140, 248, 0.06)" }} />
        </div>

        {/* Floating Particles */}
        <div className="particle" style={{ top: "15%", left: "10%", ["--duration" as string]: "5s", ["--delay" as string]: "0s", zIndex: 3 } as React.CSSProperties} />
        <div className="particle" style={{ top: "25%", right: "15%", ["--duration" as string]: "6s", ["--delay" as string]: "1s", zIndex: 3, background: "var(--brand-secondary)" } as React.CSSProperties} />
        <div className="particle" style={{ top: "60%", left: "25%", ["--duration" as string]: "4.5s", ["--delay" as string]: "2s", zIndex: 3, background: "var(--brand-accent)" } as React.CSSProperties} />
        <div className="particle" style={{ top: "70%", right: "20%", ["--duration" as string]: "5.5s", ["--delay" as string]: "0.5s", zIndex: 3 } as React.CSSProperties} />
        <div className="particle" style={{ top: "40%", left: "5%", ["--duration" as string]: "7s", ["--delay" as string]: "1.5s", zIndex: 3, background: "var(--brand-secondary)" } as React.CSSProperties} />
        <div className="particle" style={{ top: "80%", right: "30%", ["--duration" as string]: "4s", ["--delay" as string]: "3s", zIndex: 3, background: "var(--brand-accent)" } as React.CSSProperties} />
        <div className="particle" style={{ top: "50%", left: "70%", ["--duration" as string]: "6.5s", ["--delay" as string]: "0.8s", zIndex: 3 } as React.CSSProperties} />
        <div className="particle" style={{ top: "20%", left: "50%", ["--duration" as string]: "5s", ["--delay" as string]: "2.5s", zIndex: 3, width: "4px", height: "4px" } as React.CSSProperties} />


        <div className="container" style={{ position: "relative", zIndex: 10, textAlign: 'center' }}>
          <div style={{ marginBottom: "2rem" }} className="animate-fade-in">
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "1rem",
              background: "var(--bg-card)",
              padding: "0.5rem 1.25rem 0.5rem 0.5rem",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)",
              backdropFilter: "blur(16px)"
            }}>
              <span style={{
                background: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))",
                color: "var(--bg-primary)",
                padding: "0.3rem 0.75rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.7rem",
                fontWeight: "700",
                textTransform: "uppercase"
              }}>System Status</span>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: "500" }}>All Agents Operational</span>
               <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>
          </div>

          <div style={{ maxWidth: "900px", textAlign: "center", margin: "0 auto" }} className="animate-fade-in">
            <h1 style={{
              fontSize: "clamp(3rem, 8vw, 5.5rem)", marginBottom: "1.5rem", color: "var(--text-primary)", fontWeight: "800", lineHeight: "1.1",
              letterSpacing: "-0.04em",
            }}>
              Intelligent Claims. <br />
              <span className="text-gradient">
                Medical Revenue Recovery
              </span>
            </h1>

            <p style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.25rem)", color: "var(--text-secondary)", marginBottom: "3rem", maxWidth: "700px", margin: "0 auto 3rem", lineHeight: "1.7"
            }}>
              Healthcare providers are leaving recoverable revenue on the table from denied claims. Our AI-powered platform handles the heavy lifting — so you can focus on patient care.
            </p>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                <Button href="/pricing" size="lg" variant="primary" style={{ borderRadius: "var(--radius-full)", padding: "1rem 2.5rem", fontSize: "1rem" }}>
                    View Pricing
                </Button>
                <Button href="/auth/register" size="lg" variant="outline" style={{ borderRadius: "var(--radius-full)", padding: "1rem 2.5rem", fontSize: "1rem" }}>
                    Get Started
                </Button>
            </div>

            {/* Trust Badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "3rem", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.7 }}>
                <span style={{ fontSize: "1.2rem" }}>🔒</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>HIPAA Compliant</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.7 }}>
                <span style={{ fontSize: "1.2rem" }}>✅</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>W3C Compatible</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.7 }}>
                <span style={{ fontSize: "1.2rem" }}>🛡️</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>BAA Protected</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.7 }}>
                <span style={{ fontSize: "1.2rem" }}>⚡</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>256-bit SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Glow Separator */}
      <div className="glow-line" />

      {/* BENTO GRID SECTION */}
      <section className="section-padding" style={{ background: "var(--bg-primary)", position: "relative", borderTop: "none", overflow: "hidden" }}>
        {/* Surgeons & Medical Tech Background */}
        {/* Surgeons & Medical Tech Background */}
        <div className="section-bg-image" style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "url('/surgeons-technology.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          zIndex: 0,
          filter: "brightness(0.35) contrast(1.15) saturate(1.1)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(to bottom, var(--bg-primary) 0%, rgba(2,6,23,0.75) 30%, rgba(2,6,23,0.75) 70%, var(--bg-primary) 100%)",
          zIndex: 1
        }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 4rem" }}>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "1.5rem", lineHeight: "1.2" }}>The <span className="text-gradient">NORTHSTAR MEDIC</span> Advantage</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
                Our platform is more than a tool—it's a complete AI-powered revenue recovery engine built for modern healthcare.
              </p>
            </div>

            <div className="bento-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
            }}>
                {/* Live Recovery Ticker — spans 2 columns */}
                <div className="glass-panel card-3d bento-span-2" style={{ padding: '2rem', gridColumn: 'span 2 / span 2' }}>
                    <LiveRevenueTicker label="Live Recovery Engine" />
                </div>

                {/* Card 1: AI-Powered */}
                <div className="glass-panel card-3d" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>AI-Driven Recovery</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>Our intelligent agents work around the clock analyzing and processing your denied claims with precision.</p>
                </div>

                {/* Card 2: Security */}
                <div className="glass-panel card-3d" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>Enterprise Security</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>HIPAA compliant with 256-bit TLS encryption, signed BAAs, and full regulatory compliance built in.</p>
                </div>

                {/* Card 3: Speed */}
                <div className="glass-panel card-3d" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>Lightning Fast</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>Claims processed in hours, not weeks. Our platform eliminates the manual bottleneck entirely.</p>
                </div>

                {/* Card 4: Dashboard */}
                <div className="glass-panel card-3d" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>Real-Time Dashboard</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>Track every claim, every appeal, and every outcome from a single command center.</p>
                </div>

                {/* Card 5: Integration */}
                <div className="glass-panel card-3d" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔗</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>Seamless Integration</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>Works with your existing billing systems. Upload files directly — PDF, CSV, or text formats.</p>
                </div>

                {/* Card 6: Performance */}
                <div className="glass-panel card-3d" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💎</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>Performance-Based</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>You only pay when we deliver results. Our interests are fully aligned with yours.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Glow Separator */}
      <div className="glow-line" />

      {/* AHA MOMENT — Video Section */}
      <section className="section-padding" style={{
        background: "var(--bg-primary)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle animated gradient background */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(129,140,248,0.08) 0%, transparent 50%)",
          zIndex: 0
        }} />

        {/* 3D Orbs flanking the video */}
        <div className="orb orb-2" style={{ top: "-10%", left: "-15%", zIndex: 1, width: "300px", height: "300px" }} />
        <div className="orb orb-1" style={{ bottom: "-10%", right: "-10%", zIndex: 1, width: "250px", height: "250px" }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 3rem" }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "1rem", lineHeight: "1.2" }}>
              See the <span className="text-gradient">Aha Moment</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.7" }}>
              Watch how NORTHSTAR MEDIC transforms denied claims into recovered revenue — in minutes, not months.
            </p>
          </div>

          {/* Platform Showcase — Screenshot */}
          <div style={{
            maxWidth: "960px",
            margin: "0 auto",
            borderRadius: "var(--radius-2xl)",
            overflow: "hidden",
            border: "1px solid rgba(56,189,248,0.2)",
            boxShadow: "0 0 60px rgba(56,189,248,0.15), 0 0 120px rgba(129,140,248,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
            position: "relative",
            background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))",
          }}>
            {/* Browser Chrome Bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1.25rem",
              background: "rgba(0,0,0,0.4)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
              <div style={{
                flex: 1, margin: "0 1rem",
                padding: "0.35rem 1rem", borderRadius: "var(--radius-md)",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "monospace",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                northstarmedic.com/dashboard
              </div>
            </div>

            {/* Platform Screenshot */}
            <div style={{ position: "relative", minHeight: "420px", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 2rem" }}>
              <img
                src="/data-dashboard-hero.png"
                alt="NORTHSTAR MEDIC Dashboard — AI Claim Recovery Platform"
                style={{
                  width: "100%",
                  maxWidth: "860px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                }}
              />
            </div>
          </div>

          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "1.25rem" }}>
            Your command center — real-time claim recovery intelligence at your fingertips
          </p>
        </div>
      </section>

      {/* Glow Separator */}
      <div className="glow-line" />

      {/* PRICING SECTION */}
      <section className="section-padding" style={{ position: "relative", overflow: "hidden" }}>
        {/* Data Screens & Technology Background */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "url('/data-screens-tech.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
          filter: "brightness(0.3) contrast(1.15) saturate(1.1)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(135deg, var(--bg-primary) 0%, rgba(15,23,42,0.85) 50%, var(--bg-primary) 100%)",
          zIndex: 1
        }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 4rem" }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "1.5rem", lineHeight: "1.1" }}>
              Simple, <span className="text-gradient">Transparent Pricing</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "clamp(1rem, 2.5vw, 1.1rem)", lineHeight: "1.7" }}>
              Performance-based plans designed for clinics, hospitals, and health systems of every size.
            </p>
          </div>

          {/* Pricing Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", maxWidth: "1100px", margin: "0 auto" }}>

            {/* Plan 1: Guardian Pilot */}
            <div className="glass-panel card-3d" style={{ padding: "2.5rem 2rem", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "0.5rem" }}>Guardian Pilot</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>Prove the value — risk free</p>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "2.75rem", fontWeight: "800", color: "var(--brand-primary)" }}>$2,500</span>
              </div>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.85rem" }}>One-time pilot fee + performance commission</p>
              <ul style={{ textAlign: "left", color: "var(--text-secondary)", lineHeight: "2.4", marginBottom: "2rem", flex: 1, listStyle: "none", paddingLeft: 0 }}>
                <li>✓ 500-Claim Pilot Scan</li>
                <li>✓ Full AI Denial Analysis</li>
                <li>✓ Recovery Report</li>
                <li>✓ HIPAA Compliant + BAA Included</li>
                <li>✓ 48-Hour Processing</li>
              </ul>
              <a href="https://buy.stripe.com/28E3cv9Vb57SavxfNQ0Ny00" style={{ display: "block", padding: "0.85rem", border: "1px solid var(--brand-primary)", borderRadius: "var(--radius-lg)", textAlign: "center", color: "var(--brand-primary)", textDecoration: "none", fontWeight: "600", transition: "all 0.2s" }}>
                Start Pilot
              </a>
            </div>

            {/* Plan 2: Growth Lattice — Featured */}
            <div className="glass-panel card-3d" style={{ padding: "2.5rem 2rem", display: "flex", flexDirection: "column", border: "2px solid var(--brand-primary)", boxShadow: "0 0 40px rgba(56,189,248,0.12)" }}>
              <div style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", color: "#000", padding: "0.35rem 1rem", borderRadius: "var(--radius-full)", fontSize: "0.7rem", fontWeight: "800", marginBottom: "1rem", width: "fit-content", textTransform: "uppercase", letterSpacing: "1px" }}>⭐ Recommended</div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--brand-primary)" }}>Growth Lattice</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>Maximum scale, lower commission</p>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "2.75rem", fontWeight: "800", color: "var(--brand-primary)" }}>$7,500</span>
              </div>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.85rem" }}>Setup fee + reduced commission rate</p>
              <ul style={{ textAlign: "left", color: "var(--text-secondary)", lineHeight: "2.4", marginBottom: "2rem", flex: 1, listStyle: "none", paddingLeft: 0 }}>
                <li>✓ Unlimited Claim Processing</li>
                <li>✓ Reduced Commission Rate</li>
                <li>✓ Full HIPAA/BAA Compliance</li>
                <li>✓ Multi-Level AI Engine</li>
                <li>✓ Automated Payer Submission</li>
                <li>✓ Priority 24-Hour Processing</li>
                <li>✓ Dedicated Recovery Dashboard</li>
                <li>✓ Stripe Auto-Payout Integration</li>
              </ul>
              <a href="/auth/register" style={{ display: "block", padding: "0.85rem", background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", borderRadius: "var(--radius-lg)", textAlign: "center", color: "#000", textDecoration: "none", fontWeight: "700", transition: "all 0.2s" }}>
                Get Started
              </a>
            </div>

            {/* Plan 3: Network Core */}
            <div className="glass-panel card-3d" style={{ padding: "2.5rem 2rem", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "0.5rem" }}>Network Core</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>Enterprise health systems & networks</p>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "2.75rem", fontWeight: "800", color: "#a855f7" }}>Custom</span>
              </div>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.85rem" }}>Volume pricing for high-volume providers</p>
              <ul style={{ textAlign: "left", color: "var(--text-secondary)", lineHeight: "2.4", marginBottom: "2rem", flex: 1, listStyle: "none", paddingLeft: 0 }}>
                <li>✓ Direct EHR Integration (Epic, Cerner)</li>
                <li>✓ Custom Volume Commission Rate</li>
                <li>✓ Dedicated Account Manager</li>
                <li>✓ White-Label Option Available</li>
                <li>✓ SLA Guarantees (99.9% Uptime)</li>
                <li>✓ Custom API Access</li>
              </ul>
              <a href="mailto:sales@northstarmedic.com" style={{ display: "block", padding: "0.85rem", border: "1px solid #a855f7", borderRadius: "var(--radius-lg)", textAlign: "center", color: "#a855f7", textDecoration: "none", fontWeight: "600", transition: "all 0.2s" }}>
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Glow Separator */}
      <div className="glow-line" />

      {/* Final CTA */}
      <section className="section-padding" style={{ background: "var(--bg-secondary)", color: "white", textAlign: "center", borderTop: 'none', position: "relative", overflow: "hidden" }}>
        {/* Business & AI Technology Background */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "url('/business-ai-tech.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
          filter: "brightness(0.3) contrast(1.15) saturate(1.1)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(to top, var(--bg-secondary) 0%, rgba(2,6,23,0.75) 50%, var(--bg-secondary) 100%)",
          zIndex: 1
        }} />
        {/* 3D Morphing Blob */}
        <div className="morph-blob" style={{
          width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1,
          filter: "blur(40px)",
        }} />

        {/* Floating Particles in CTA */}
        <div className="particle" style={{ top: "20%", left: "15%", ["--duration" as string]: "5s", ["--delay" as string]: "0s", zIndex: 3 } as React.CSSProperties} />
        <div className="particle" style={{ top: "60%", right: "10%", ["--duration" as string]: "4s", ["--delay" as string]: "1.5s", zIndex: 3, background: "var(--brand-accent)" } as React.CSSProperties} />
        <div className="particle" style={{ top: "30%", right: "25%", ["--duration" as string]: "6s", ["--delay" as string]: "0.8s", zIndex: 3, background: "var(--brand-secondary)" } as React.CSSProperties} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", marginBottom: "1.5rem", fontWeight: "700" }}>Ready to Get Started?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "3rem", maxWidth: "600px", margin: "0 auto 3rem" }}>
            Join healthcare providers across the country who trust NORTHSTAR MEDIC to protect their bottom line.
          </p>
          <Button href="/auth/register" size="lg" variant="primary" style={{ background: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))", color: "var(--bg-primary)", padding: "1.25rem 3rem", borderRadius: "var(--radius-full)", fontWeight: "700" }}>
            Create Your Account
          </Button>
        </div>
      </section>
    </>
  );
}
