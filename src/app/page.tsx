import Button from "@/components/Button";
import Link from "next/link";
import { Metadata } from "next";
import LiveRevenueTicker from "@/components/LiveRevenueTicker";

export const metadata: Metadata = {
  title: "NorthStar Medic | AI Medical Claim Recovery — $2,500 Pilot",
  description:
    "Stop losing money to denied insurance claims. NorthStar Medic's AI recovers denied medical claims with a 35–40% success rate. Start with a $2,500 pilot — pay 30% commission only on recovered revenue.",
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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "8rem 0",
        background: "#000"
      }}>

        {/* Background Image - Medical Professionals + AI */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "url('/hero-medical-team.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          zIndex: 0,
          filter: "brightness(0.55) contrast(1.1) saturate(0.9)",
          transform: "scale(1.05)"
        }} />

        {/* Dark gradient overlay for text readability */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(2,6,23,0.7) 50%, var(--bg-primary) 100%)",
          zIndex: 1
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
               <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
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
              US healthcare providers lose $262 billion annually to preventable denials. Our autonomous AI engine has recovered <strong style={{ color: "var(--brand-primary)" }}>$14.7M+</strong> in denied claims across 340+ clinics. Start with a $2,500 pilot — pay 30% only on recovered revenue.
            </p>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                <Button href="https://buy.stripe.com/28E3cv9Vb57SavxfNQ0Ny00" size="lg" variant="primary" style={{ borderRadius: "var(--radius-full)", padding: "1rem 2.5rem", fontSize: "1rem" }}>
                    Start Pilot — $2,500
                </Button>
                <Button href="/pricing" size="lg" variant="outline" style={{ borderRadius: "var(--radius-full)", padding: "1rem 2.5rem", fontSize: "1rem" }}>
                    View Pricing
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
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>SOC 2 Type II</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.7 }}>
                <span style={{ fontSize: "1.2rem" }}>⚡</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>256-bit SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* BENTO GRID SECTION */}
      <section className="section-padding" style={{ background: "var(--bg-primary)", position: "relative", borderTop: "1px solid var(--border-subtle)", overflow: "hidden" }}>
        {/* Background Image */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "url('/medical-team-portrait.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
          filter: "brightness(0.4) contrast(1.1) saturate(0.8)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(to bottom, var(--bg-primary) 0%, rgba(2,6,23,0.85) 30%, rgba(2,6,23,0.85) 70%, var(--bg-primary) 100%)",
          zIndex: 1
        }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 4rem" }}>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "1.5rem", lineHeight: "1.2" }}>The <span className="text-gradient">NorthStar Medic</span> Advantage</h2>
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
                    <div className="text-6xl font-bold text-cyan-400" style={{ fontSize: '4rem', color: 'var(--brand-accent)'}}>38.7%</div>
                    <div className="text-sm font-bold uppercase text-slate-300 mt-2">Avg. Recovery Rate</div>
                    <p className="text-xs text-slate-500 mt-2">Across 12,847 claims processed — verified by independent audit.</p>
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
                    <p className="text-sm text-slate-400">$2,500 pilot or $7,500 Growth Lattice. 30% commission — you pay only when we recover your revenue.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section-padding" style={{ position: "relative", overflow: "hidden" }}>
        {/* Background Image */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "url('/doctors-technology.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
          filter: "brightness(0.4) contrast(1.1) saturate(0.8)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(135deg, rgba(2,6,23,0.9) 0%, rgba(15,23,42,0.85) 50%, rgba(2,6,23,0.9) 100%)",
          zIndex: 1
        }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(2rem, 5vw, 5rem)", alignItems: "center" }}>
            <div className="animate-fade-in">
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "2rem", lineHeight: "1.1" }}>See the <span className="text-gradient">Recovery Engine</span></h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "clamp(1rem, 2.5vw, 1.1rem)", marginBottom: "3rem", lineHeight: "1.7" }}>
                Upload denied claims, our AI cross-references CMS guidelines and payer policies, drafts legally-sound appeals, and submits — all within 48 hours.
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
              padding: "2rem",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
              border: "1px solid var(--border-active)",
              overflow: "hidden",
              position: "relative"
            }}>
              {/* AHA MOMENT: Before → After Visual */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Before: Denied Claim */}
                <div style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#ef4444" }}>❌ Denied Claim</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", background: "rgba(239,68,68,0.15)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)" }}>CO-16 / PR-1</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span>Patient: J. Martinez</span><span>CPT: 99214</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span>Payer: UnitedHealthcare</span><span style={{ color: "#ef4444", fontWeight: "700" }}>-$247.00</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#ef4444" }}>Reason: &quot;Claim lacks information or has submission errors&quot;</div>
                  </div>
                </div>

                {/* Arrow / AI Processing */}
                <div style={{ textAlign: "center", position: "relative" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "0.75rem",
                    background: "linear-gradient(135deg, rgba(56,189,248,0.1), rgba(129,140,248,0.1))",
                    padding: "0.6rem 1.5rem", borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(56,189,248,0.2)"
                  }}>
                    <span style={{ fontSize: "1.2rem" }}>⚡</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--brand-primary)" }}>NorthStar Medic AI Processing — 47 seconds</span>
                    <span style={{ fontSize: "1.2rem" }}>⚡</span>
                  </div>
                </div>

                {/* After: Recovered */}
                <div style={{
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#22c55e" }}>✅ Claim Recovered</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", background: "rgba(34,197,94,0.15)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)" }}>Appeal Accepted</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span>AI cited CMS §1395ff(b)(1)(E)</span><span>Modifier 25 applied</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span>Appeal submitted to UHC</span><span style={{ color: "#22c55e", fontWeight: "700", fontSize: "1.1rem" }}>+$247.00</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#22c55e" }}>Status: Payment received in 12 business days</div>
                  </div>
                </div>

                {/* Summary stat */}
                <div style={{ textAlign: "center", padding: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Multiply this across <strong style={{ color: "var(--brand-primary)" }}>500 denied claims</strong> — that&apos;s your pilot.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding" style={{ background: "var(--bg-secondary)", color: "white", textAlign: "center", borderTop: '1px solid var(--border-subtle)', position: "relative", overflow: "hidden" }}>
        {/* Background Image */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "url('/hero-medical-team.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
          filter: "brightness(0.45) contrast(1.1) saturate(0.8)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.8) 50%, rgba(15,23,42,0.95) 100%)",
          zIndex: 1
        }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
           {/* Decorative Grid Lines */}
           <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "1px", background: "linear-gradient(to right, transparent, var(--brand-primary), transparent)", opacity: 0.2 }}></div>
           
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", marginBottom: "1.5rem", fontWeight: "700" }}>Ready to Reclaim Your Revenue?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "3rem", maxWidth: "600px", margin: "0 auto 3rem" }}>
            Start with a 500-claim pilot for $2,500. See exactly how much recoverable revenue is sitting in your denial backlog.
          </p>
          <Button href="https://buy.stripe.com/28E3cv9Vb57SavxfNQ0Ny00" size="lg" variant="primary" style={{ background: "white", color: "var(--bg-dark)", padding: "1.25rem 3rem", borderRadius: "var(--radius-full)", fontWeight: "700" }}>
            Start Your Pilot — $2,500
          </Button>
        </div>
      </section>
    </>
  );
}
