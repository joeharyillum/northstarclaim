import Button from "@/components/Button";
import SubscriptionButton from "@/components/SubscriptionButton";
import FeatureCard from "@/components/FeatureCard";
import Link from "next/link";
import { Metadata } from "next";
import LiveRevenueTicker from "@/components/LiveRevenueTicker";

export const metadata: Metadata = {
  title: "NorthStar Claim | AI Medical Claim Recovery — 94% Success Rate",
  description:
    "Stop losing money to denied insurance claims. NorthStar Claim's 41-agent AI recovers denied medical claims with 94% success rate. Zero upfront cost — pay only 30% on recovered revenue. Start your free scan today.",
  alternates: {
    canonical: "https://northstarclaim.com",
  },
};

export default function Home() {
  return (
    <>
      {/* Hero Section - The Neural Guardian */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "8rem 0",
        background: "var(--bg-dark)"
      }}>

        {/* Neural Grid Background - Futuristic Command Center */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "linear-gradient(to bottom, rgba(2, 6, 23, 0) 0%, var(--bg-primary) 100%), url('/bg-grid.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
          zIndex: 0,
          filter: "brightness(0.8) contrast(1.2)",
          transform: "scale(1.1)"
        }} />

        {/* Aurora Glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "1200px", height: "1200px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle at center, hsla(198, 93%, 62%, 0.15) 0%, transparent 40%)",
          zIndex: 1,
          animation: "pulse-glow 8s ease-in-out infinite"
        }} />


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
               <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: "0 0 10px #22c55e" }}></div>
            </div>
          </div>

          <div style={{ maxWidth: "900px", textAlign: "center", margin: "0 auto" }} className="animate-fade-in">
            <h1 style={{
              fontSize: "clamp(3rem, 8vw, 5.5rem)", marginBottom: "1.5rem", color: "var(--text-primary)", fontWeight: "800", lineHeight: "1.1",
              letterSpacing: "-0.04em",
            }}>
              Autonomous AI for <br />
              <span className="text-gradient">
                Medical Revenue Recovery
              </span>
            </h1>

            <p style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.25rem)", color: "var(--text-secondary)", marginBottom: "3rem", maxWidth: "700px", margin: "0 auto 3rem", lineHeight: "1.7"
            }}>
              Our 41-agent AI recovers denied medical claims with a 94% success rate. Zero upfront cost—pay only a 30% commission on recovered revenue.
            </p>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                <Button href="/free-scan" size="lg" variant="primary" style={{ borderRadius: "var(--radius-full)", padding: "1rem 2.5rem", fontSize: "1rem" }}>
                    Start Free Scan
                </Button>
                <Button href="/about" size="lg" variant="outline" style={{ borderRadius: "var(--radius-full)", padding: "1rem 2.5rem", fontSize: "1rem" }}>
                    Learn More
                </Button>
            </div>
          </div>
        </div>

      </section>

      {/* BENTO GRID SECTION */}
      <section className="section-padding" style={{ background: "var(--bg-primary)", position: "relative", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="container">
            <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 4rem" }}>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "1.5rem", lineHeight: "1.2" }}>The <span className="text-gradient">NorthStar</span> Advantage</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
                Our platform is more than a tool—it's a fully autonomous revenue recovery engine designed for modern healthcare.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
            }}>
                {/* Main Card: Live Revenue */}
                <div className="lg:col-span-2 glass-panel p-8 flex flex-col justify-between" style={{ gridColumn: 'span 2 / span 2' }}>
                    <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem" }}>
                          Live Recovery Grid
                        </div>
                        <LiveRevenueTicker label="Total System Revenue Recovered" />
                    </div>
                    <p className="text-sm text-slate-400 mt-4">This ticker represents the total value recovered by our AI agents across the entire network, updated in real-time.</p>
                </div>

                {/* Side Card: Success Rate */}
                <div className="glass-panel p-8 flex flex-col justify-center items-center text-center">
                    <div className="text-6xl font-bold text-cyan-400" style={{ fontSize: '4rem', color: 'var(--brand-accent)'}}>94.2%</div>
                    <div className="text-sm font-bold uppercase text-slate-300 mt-2">Recovery Success Rate</div>
                    <p className="text-xs text-slate-500 mt-2">Our AI's proprietary adversarial rebuttal engine achieves industry-leading results.</p>
                </div>

                {/* Bottom Card 1: Automation */}
                <div className="glass-panel p-8">
                    <h3 className="text-xl font-bold mb-2">Zero-Touch Automation</h3>
                    <p className="text-sm text-slate-400">From claim analysis to appeal submission, our system is 100% autonomous. No manual intervention required.</p>
                </div>

                {/* Bottom Card 2: Security */}
                <div className="glass-panel p-8">
                    <h3 className="text-xl font-bold mb-2">Military-Grade Security</h3>
                    <p className="text-sm text-slate-400">Fully HIPAA compliant with end-to-end encryption and signed BAAs for every partner.</p>
                </div>

                {/* Bottom Card 3: Pricing */}
                <div className="glass-panel p-8">
                    <h3 className="text-xl font-bold mb-2">Performance-Based</h3>
                    <p className="text-sm text-slate-400">You only pay when we win. Our 30% commission model means we're fully aligned with your success.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section-padding" style={{ position: "relative" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(2rem, 5vw, 5rem)", alignItems: "center" }}>
            <div className="animate-fade-in">
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "2rem", lineHeight: "1.1" }}>Watch the <span className="text-gradient">Aha! Moment</span></h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "clamp(1rem, 2.5vw, 1.1rem)", marginBottom: "3rem", lineHeight: "1.7" }}>
                Our proprietary recovery grid identifies hidden millions in under 60 seconds. Witness the transformation of "Lost Revenue" into "Liquid Capital."
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: 'center' }}>
                  <div style={{ width: "40px", height: "40px", background: "rgba(56, 189, 248, 0.1)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", fontSize: "1.2rem", flexShrink: 0 }}>🔍</div>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: 'var(--text-primary)' }}>Neural Audit</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Scanning depth beyond manual biller capability.</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: 'center' }}>
                  <div style={{ width: "40px", height: "40px", background: "rgba(129, 140, 248, 0.1)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-secondary)", fontSize: "1.2rem", flexShrink: 0 }}>🖋️</div>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: 'var(--text-primary)' }}>Automatic Drafting</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Legally-sound appeals written in seconds.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{
              padding: "0.5rem",
              boxShadow: "var(--shadow-glow)",
              border: "1px solid var(--border-active)",
              overflow: "hidden",
              position: "relative"
            }}>
              <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius-lg)", paddingBottom: "56.25%", height: 0 }}>
                {/* High-speed Vimeo / Iframe Embed Placeholder */}
                <iframe
                  src="https://player.vimeo.com/video/824804225?autoplay=0&loop=1&muted=1&background=1"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  allow="fullscreen; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding" style={{ background: "var(--bg-secondary)", color: "white", textAlign: "center", borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ position: "relative" }}>
           {/* Decorative Grid Lines */}
           <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "1px", background: "linear-gradient(to right, transparent, var(--brand-primary), transparent)", opacity: 0.2 }}></div>
           
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", marginBottom: "1.5rem", fontWeight: "700" }}>Ready to Reclaim Your Revenue?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "3rem", maxWidth: "600px", margin: "0 auto 3rem" }}>
            Deploy our recovery engine in minutes. There's no upfront cost, no risk, and no reason to leave money on the table.
          </p>
          <Button href="/signup" size="lg" variant="primary" style={{ background: "white", color: "var(--bg-dark)", padding: "1.25rem 3rem", borderRadius: "var(--radius-full)", fontWeight: "700" }}>
            Activate Your AI Team
          </Button>
        </div>
      </section>
    </>
  );
}
