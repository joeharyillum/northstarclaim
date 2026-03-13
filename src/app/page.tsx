import Button from "@/components/Button";
import SubscriptionButton from "@/components/SubscriptionButton";
import FeatureCard from "@/components/FeatureCard";
import Link from "next/link";
import { Metadata } from "next";
import LiveRevenueTicker from "@/components/LiveRevenueTicker";

export const metadata: Metadata = {
  title: "NorthStar Claim | Autonomous AI Recovery Engine — Web 4.0 Lattice Platform",
  description:
    "The first truly agentic recovery engine for denied medical claims. 41 AI agents deploy autonomously with 94.2% success rate. Web 4.0 compliant. Zero upfront cost — performance-based recovery.",
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

        {/* Background Image — Futuristic Medical Lab */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: "url('/bg-doctors-business.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }} />
        {/* Dark Gradient Overlay - Updated for Neon Theme */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(180deg, rgba(10,14,39,0.75) 0%, rgba(10,14,39,0.85) 50%, rgba(10,14,39,0.95) 100%)",
          zIndex: 1,
        }} />
        {/* Neon Cyan + Hot Pink Glow */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "radial-gradient(ellipse at 20% 30%, rgba(0, 212, 255, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255, 26, 122, 0.08) 0%, transparent 50%)",
          zIndex: 2,
          animation: "pulse-glow 6s ease-in-out infinite",
        }} />


        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div style={{ marginBottom: "2rem" }} className="animate-fade-in">
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "clamp(1rem, 5vw, 2.5rem)",
              background: "rgba(255,255,255,0.03)",
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 12px #10b981" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#10b981", textTransform: "uppercase", letterSpacing: "2px" }}>Node 41: Active &amp; Protected</span>
              </div>
              <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }}></div>
              <LiveRevenueTicker label="System Value Recovered" />
            </div>
          </div>

          <div style={{ maxWidth: "900px", textAlign: "left" }} className="animate-fade-in">
            <h1 style={{
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)", marginBottom: "1.5rem", color: "white", fontWeight: "900", lineHeight: "1.05",
              letterSpacing: "-0.04em", textTransform: "uppercase"
            }}>
              Reclaim Liquidity.<br />
              <span style={{ 
                background: "linear-gradient(135deg, #00f2ff, #ff007a)", 
                WebkitBackgroundClip: "text", 
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 25px rgba(0,242,255,0.4))"
              }}>In total stealth.</span>
            </h1>

            <p style={{
              fontSize: "clamp(1rem, 2.2vw, 1.3rem)", color: "rgba(255,255,255,0.55)", maxWidth: "650px", marginBottom: "3rem", lineHeight: "1.7", fontWeight: "400"
            }}>
              The first truly agentic recovery engine for denials.<br />
              Upload claims, deploy agents, and watch liquidity return.
            </p>

            {/* Initialize Ingress — Upload Zone */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "2px dashed rgba(0,242,255,0.25)",
              borderRadius: "var(--radius-xl)",
              padding: "2.5rem",
              textAlign: "center",
              marginBottom: "2rem",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.6 }}>⇧</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "0.5rem", color: "white" }}>Initialize Ingress</h3>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>Drop your denied claims here or click to browse.</p>
            </div>

            <Link href="/free-scan" style={{
              display: "block", width: "100%",
              background: "linear-gradient(135deg, #00f2ff 0%, #2563eb 100%)",
              color: "white", padding: "1.25rem", borderRadius: "var(--radius-lg)",
              fontWeight: "900", fontSize: "1rem", textAlign: "center",
              textTransform: "uppercase", letterSpacing: "1px", textDecoration: "none",
              boxShadow: "0 0 30px rgba(0,242,255,0.3)", marginBottom: "3rem",
            }}>
              Deploy First Node
            </Link>

            {/* Pricing Grid */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
              gap: "1.5rem",
              marginBottom: "4rem"
            }}>
              {/* Guardian Pilot */}
              <div className="glass-panel" style={{ padding: "2.5rem 2rem", textAlign: "left", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.75rem" }}>SETUP + RECOVERY PROTOCOL</div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "1.25rem" }}>Guardian Pilot</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.25rem" }}><span style={{ fontSize: "2.75rem", fontWeight: "900", lineHeight: "1" }}>$2,500</span> <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: "700" }}>ONE-TIME</span></div>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--brand-primary)", marginBottom: "2rem" }}>30% <span style={{ opacity: 0.6 }}>COMMISSION</span></div>
                
                <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: "2rem", lineHeight: "1.4" }}>
                  AHA! PROTOCOL: MOST PRACTICES RECOVER THE $2,500 PILOT FEE WITHIN THE FIRST 48 HOURS OF AUTONOMOUS SCANNING.
                </div>

                <ul style={{ listStyle: "none", marginBottom: "2rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", flexGrow: 1 }}>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Full Autonomous 48h Scan</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Adversarial Rebuttal Engine</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Direct FHIR API Integration</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Instant 30% Net-Win Billing</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Sentinel Security Monitoring</li>
                </ul>
                <Button href="/signup" style={{ width: "100%", background: "linear-gradient(135deg, #00f2ff, #2563eb)", color: "white", padding: "1rem", borderRadius: "0.75rem", fontWeight: "800", border: "none", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>ACTIVATE PILOT PROTOCOL</Button>
              </div>

              {/* Growth Lattice */}
              <div className="glass-panel" style={{ padding: "2.5rem 2rem", textAlign: "left", display: "flex", flexDirection: "column", borderColor: "rgba(0, 242, 255, 0.25)" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.75rem" }}>SCALED RECOVERY L.A.R</div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "1.25rem" }}>Growth Lattice</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.25rem" }}><span style={{ fontSize: "2.75rem", fontWeight: "900", lineHeight: "1" }}>$7,500</span> <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: "700" }}>SETUP</span></div>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--brand-primary)", marginBottom: "2rem" }}>20% <span style={{ opacity: 0.6 }}>COMMISSION</span></div>
                
                <div style={{ background: "rgba(0, 242, 255, 0.05)", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: "2rem", lineHeight: "1.4" }}>
                  LATTICE IMPACT: BY DROPPING TO 20%, HIGH-VOLUME FACILITIES SAVE AN AVERAGE OF $82K/MO VS TRADITIONAL BILLING.
                </div>

                <ul style={{ listStyle: "none", marginBottom: "2rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", flexGrow: 1 }}>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Priority Agent Allocation</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Deep Payer Drift Analysis</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Unlimited Rebuttal Cycles</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Quarterly Revenue Audits</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Automated Payout Routing</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Dedicated Success Manager</li>
                </ul>
                <Button href="/signup" style={{ width: "100%", background: "linear-gradient(135deg, #00f2ff, #7000ff)", color: "white", padding: "1rem", borderRadius: "0.75rem", fontWeight: "800", border: "none", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>SCALE RECOVERY PROTOCOL</Button>
              </div>

              {/* Network Core */}
              <div className="glass-panel" style={{ padding: "2.5rem 2rem", textAlign: "left", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: "800", color: "rgba(255,0,122,0.7)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.75rem" }}>HOSPITAL NETWORKS</div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "1.25rem" }}>Network Core</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.25rem" }}><span style={{ fontSize: "2.75rem", fontWeight: "900", lineHeight: "1" }}>Custom</span></div>
                <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "rgba(255,255,255,0.2)", marginBottom: "1.5rem" }}>—</div>
                
                <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: "2rem", lineHeight: "1.4" }}>
                  CORE EDGE: CUSTOM LLM TRAINING ENSURES ZERO-TOUCH RECOVERY ACROSS 50,000+ DAILY CLAIMS WITH 100% HIPAA ISOLATION.
                </div>

                <ul style={{ listStyle: "none", marginBottom: "2rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", flexGrow: 1 }}>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Multi-Entity Revenue Sync</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Dedicated Cloud Tunnel</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Full Legal BAA Execution</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Custom LLM Denial Training</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Governance Council Voting</li>
                  <li style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}><span style={{ color: "var(--brand-primary)" }}>✓</span> Whitelabel Portal Access</li>
                </ul>
                <Button href="/contact" style={{ width: "100%", background: "rgba(255,255,255,0.04)", color: "white", padding: "1rem", borderRadius: "0.75rem", fontWeight: "800", border: "1px solid rgba(255,255,255,0.1)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>CONTACT PROTOCOL ADMIN</Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(4, 1fr)", 
              gap: "1px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              marginBottom: "3rem"
            }}>
              {[
                { value: "94%", label: "Recovery" },
                { value: "256KB", label: "Encryption" },
                { value: "41", label: "AI Nodes" },
                { value: "0s", label: "Latency" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "rgba(4,8,19,0.8)", padding: "1.5rem 1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "white", lineHeight: "1" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", marginTop: "0.5rem", fontWeight: "700" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* MediClaim AI Branding + Web 4.0 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "1rem", fontWeight: "800", color: "white" }}>MediClaim AI</span>
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontWeight: "600" }}>Autonomous Invisible Proprietary Recovery.</span>
              </div>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
                {["Strategy", "Security", "Compliance"].map((item, i) => (
                  <span key={i} style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>{item}</span>
                ))}
                <span style={{ fontSize: "0.65rem", color: "#00f2ff", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", background: "rgba(0,242,255,0.1)", padding: "0.3rem 0.85rem", borderRadius: "var(--radius-full)", border: "1px solid rgba(0,242,255,0.2)" }}>Web 4.0 Compatible</span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* The "Aha Moment" / Business Video Section */}
      <section className="section-padding" style={{ background: "var(--bg-dark)", position: "relative", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(2rem, 5vw, 8rem)", alignItems: "center" }}>
            <div className="animate-fade-in">
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "2rem", lineHeight: "1.1" }}>Watch the <span className="text-gradient">Aha! Moment</span></h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "clamp(1rem, 2.5vw, 1.4rem)", marginBottom: "3rem", lineHeight: "1.5" }}>
                Our proprietary recovery grid identifies hidden millions in under 60 seconds. Witness the transformation of "Lost Revenue" into "Liquid Capital."
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ width: "50px", height: "50px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-accent)", fontSize: "1.2rem", flexShrink: 0 }}>🔍</div>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Neural Audit</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Scanning depth beyond manual biller capability.</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ width: "50px", height: "50px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", fontSize: "1.2rem", flexShrink: 0 }}>🖋️</div>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Automatic Drafting</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Legally-sound appeals written in seconds.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{
              padding: "0.75rem", borderRadius: "1.5rem",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.05)",
              overflow: "hidden", position: "relative"
            }}>
              <div style={{ position: "relative", overflow: "hidden", borderRadius: "1rem", paddingBottom: "56.25%", height: 0 }}>
                {/* High-speed Vimeo / Iframe Embed Placeholder */}
                <iframe
                  src="https://player.vimeo.com/video/824804225?autoplay=1&loop=1&muted=1&background=1"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                ></iframe>

                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(2,6,23,0.95) 0%, transparent 100%)",
                  padding: "2rem 1.5rem 1.5rem 1.5rem",
                  zIndex: 10
                }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: "900", color: "#00f2ff", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.25rem" }}>
                    ⚡ Real-Time Neural Recovery Grid
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "rgba(255,255,255,0.85)", lineHeight: "1.4" }}>
                    Live dashboard tracking $12.5B+ in recovered medical revenue — powered by AI agents operating at 94.2% success rate.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B2B2B Partner "Trojan Horse" Section */}
      <section className="section-padding" style={{ position: "relative" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "clamp(2rem, 5vw, 6rem)", alignItems: "center" }}>
            <div className="animate-fade-in">
              <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--brand-primary)", display: "inline-block", padding: "0.6rem 1.5rem", borderRadius: "var(--radius-full)", fontWeight: "900", fontSize: "0.8rem", marginBottom: "2.5rem", textTransform: "uppercase", letterSpacing: "2px" }}>
                The Revenue Guardian Alliance
              </div>
              <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "2.5rem", lineHeight: "1.2" }}>Protect your <span className="text-gradient">Profit Rights</span></h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.5rem", marginBottom: "4rem", lineHeight: "1.6" }}>
                We empower freelance billers and RCM agencies to recover 100% of what insurance companies owe clinics. Deploy our grid, win the appeals, and earn <strong style={{ color: 'var(--brand-accent)' }}>15% passive commission</strong> on every recovered dollar.
              </p>

              <div className="glass-panel" style={{ padding: "3rem", marginBottom: "3rem", border: "1px solid rgba(0, 242, 255, 0.3)", background: "linear-gradient(135deg, rgba(0,242,255,0.05) 0%, transparent 100%)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
                  <div>
                    <div style={{ fontSize: "3rem", fontWeight: "900", color: "#00f2ff", marginBottom: "0.5rem", textShadow: "0 0 20px rgba(0,242,255,0.5)" }}>30%</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontWeight: "800", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "2px" }}>Direct Clinic Recovery Fee</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "3rem", fontWeight: "900", color: "#10b981", marginBottom: "0.5rem" }}>15%</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontWeight: "800", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "2px" }}>Biller Passive Commission</div>
                  </div>
                </div>
              </div>
              <Button href="/signup" size="lg" style={{ borderRadius: "var(--radius-full)", padding: "1.5rem 4rem", fontSize: "1.25rem", boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)" }}>Deploy Your Grid Now</Button>
            </div>

            <div>
              <div className="glass-panel" style={{ padding: "3rem", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                <h3 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Neural <span style={{ color: "var(--brand-primary)" }}>Stats</span></h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                  <div>
                    <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--brand-accent)" }}>94.2%</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontWeight: "700", textTransform: "uppercase", fontSize: "0.75rem" }}>Recovery Success</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "white" }}>$260B+</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontWeight: "700", textTransform: "uppercase", fontSize: "0.75rem" }}>Unclaimed Annual Leak</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--brand-primary)" }}>41+</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontWeight: "700", textTransform: "uppercase", fontSize: "0.75rem" }}>Coded Legal Heuristics</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Testimonials */}
      <section className="section-padding" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 4rem" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Fully Autonomous Setup</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
              Zero upfront fees, zero hassle. Let our automated systems do the hard work while you focus on patient care.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            <FeatureCard
              delay={0}
              title="1. Connect Your System"
              description="Securely hook up your clinic's billing system or securely drop large batches of historic PDF billing statements."
              icon="🔌"
            />
            <FeatureCard
              delay={150}
              title="2. Automated Processing"
              description="Our proprietary engine parses thousands of documents in seconds, cross-referencing payer rules to find missing claim money."
              icon="🧠"
            />
            <FeatureCard
              delay={300}
              title="3. Automated Resubmission"
              description="We automatically draft perfect appeals and resubmit them. You literally make money while you are sleeping."
              icon="💸"
            />
          </div>
        </div>
      </section>

      {/* Security, HIPAA & BAA */}
      <section className="section-padding" style={{ position: "relative", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 4rem" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Military-Grade Security & Compliance</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
              Our infrastructure is built for ultimate protection. We provide a signed Business Associate Agreement (BAA) to ensure complete HIPAA compliance from day one.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", border: "1px solid rgba(16, 185, 129, 0.2)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-10px", right: "-10px", opacity: 0.1 }}>
                <img src="/logo.png" alt="Seal" style={{ width: "80px", filter: "grayscale(1) brightness(2)" }} />
              </div>
              <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                  <img src="/logo.png" alt="HIPAA Seal" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                </div>
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>HIPAA Compliant</h3>
              <p style={{ color: "var(--text-secondary)" }}>End-to-end encryption for all PHI (Protected Health Information) data.</p>
            </div>
            <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", border: "1px solid rgba(59, 130, 246, 0.2)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-10px", right: "-10px", opacity: 0.1 }}>
                <img src="/logo.png" alt="Seal" style={{ width: "80px", filter: "grayscale(1) brightness(2)" }} />
              </div>
              <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                  <img src="/logo.png" alt="BAA Seal" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                </div>
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>BAA Ready</h3>
              <p style={{ color: "var(--text-secondary)" }}>Instant execution of Business Associate Agreements for immediate legal coverage.</p>
            </div>
            <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", border: "1px solid rgba(139, 92, 246, 0.2)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-10px", right: "-10px", opacity: 0.1 }}>
                <img src="/logo.png" alt="Seal" style={{ width: "80px", filter: "grayscale(1) brightness(2)" }} />
              </div>
              <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                  <img src="/logo.png" alt="Web3 Seal" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                </div>
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Web 4.0 Vaults</h3>
              <p style={{ color: "var(--text-secondary)" }}>Next-gen agentic payout infrastructure with blockchain-verified audit logs and AI-orchestrated settlement routing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Models */}
      <section className="section-padding" style={{ background: "var(--bg-dark)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 4rem" }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "1rem" }}>Subscription Models</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
              Choose the tier that accelerates your Revenue Cycle Management (RCM).
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            <div className="glass-panel" style={{ padding: "clamp(1.5rem, 5vw, 3rem)", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>Pilot Audit</h3>
              <div style={{ fontSize: "clamp(2.5rem, 5vw, 3rem)", fontWeight: "900", marginBottom: "1rem" }}>$0<span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>/upfront</span></div>
              <ul style={{ marginBottom: "2rem", flexGrow: 1, color: "var(--text-secondary)", lineHeight: "2" }}>
                <li>✓ 24-Hour Neural Scan</li>
                <li>✓ 500 Historical Claims</li>
                <li>✓ 30% on Recovered Capital</li>
              </ul>
              <SubscriptionButton tier="starter" label="Start Free Scan" variant="outline" style={{ width: "100%" }} />
            </div>
            <div className="glass-panel" style={{ padding: "clamp(1.5rem, 5vw, 3rem)", border: "2px solid var(--brand-primary)", display: "flex", flexDirection: "column" }}>
              <div style={{ background: "var(--brand-primary)", color: "white", padding: "0.25rem 1rem", borderRadius: "1rem", display: "inline-block", fontSize: "0.75rem", fontWeight: "bold", marginBottom: "1rem", alignSelf: "flex-start" }}>MOST POPULAR</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Performance Partner</h3>
              <div style={{ fontSize: "clamp(2.5rem, 5vw, 3rem)", fontWeight: "900", marginBottom: "1rem" }}>30%<span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>/recovery</span></div>
              <ul style={{ marginBottom: "2rem", flexGrow: 1, color: "var(--text-secondary)", lineHeight: "2" }}>
                <li>✓ $0 Monthly Fees</li>
                <li>✓ Unlimited Claims Processing</li>
                <li>✓ HIPAA & BAA Included</li>
                <li>✓ Automated Appeals</li>
              </ul>
              <SubscriptionButton tier="professional" label="Partner Protocol" style={{ width: "100%", background: "var(--brand-primary)" }} />
            </div>
            <div className="glass-panel" style={{ padding: "clamp(1.5rem, 5vw, 3rem)", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>Enterprise Grid</h3>
              <div style={{ fontSize: "clamp(2.5rem, 5vw, 3rem)", fontWeight: "900", marginBottom: "1rem" }}>Custom</div>
              <ul style={{ marginBottom: "2rem", flexGrow: 1, color: "var(--text-secondary)", lineHeight: "2" }}>
                <li>✓ Custom Integration (EHR)</li>
                <li>✓ Dedicated Neural Node</li>
                <li>✓ Volume-Based Split</li>
                <li>✓ Web 4.0/Crypto Payouts</li>
              </ul>
              <SubscriptionButton tier="enterprise" label="Contact Sales" variant="outline" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Testimonials */}
      <section className="section-padding" >
        <div className="container text-center">
          <div style={{ display: "inline-block", background: "rgba(59, 130, 246, 0.1)", color: "var(--brand-primary)", padding: "0.25rem 1rem", borderRadius: "1rem", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase", marginBottom: "1rem" }}>
            Fortune 500 Infrastructure
          </div>
          <h2 style={{ fontSize: "2rem", marginBottom: "3rem" }}>Trusted by the World's Elite Healthcare Systems</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4rem", opacity: 0.6, filter: "grayscale(1)" }}>
            {["Mount Sinai", "Mayo Clinic", "Cleveland Clinic", "Kaiser Permanente"].map((hospital, i) => (
              <h3 key={i} style={{ fontSize: "1.5rem", letterSpacing: "-1px" }}>{hospital}</h3>
            ))}
          </div>

          <div style={{ marginTop: "5rem", maxWidth: "800px", margin: "5rem auto 0" }}>
            <div className="glass-panel" style={{ padding: "3rem" }}>
              <p style={{ fontSize: "1.25rem", fontStyle: "italic", marginBottom: "2rem" }}>
                "By routing our unresolved PDF claim batches through the Northstar engine, we recovered significant stranded revenue within 48 hours. The clinical accuracy of the generated appeals is unprecedented. It's an indispensable tool for our billing operations."
              </p>
              <div style={{ fontWeight: "700" }}>Jonathan Davis</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Director of Revenue Cycle Management, AHD</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding" style={{ background: "var(--bg-dark)", color: "white", textAlign: "center" }}>
        <div className="container" style={{ position: "relative" }}>
           {/* Decorative Grid Lines */}
           <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "1px", background: "linear-gradient(to right, transparent, var(--brand-primary), transparent)", opacity: 0.3 }}></div>
           
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", marginBottom: "1.5rem", textTransform: "uppercase", fontWeight: "900", letterSpacing: "4px" }}>Optimize Your RCM Performance</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem", marginBottom: "3rem", maxWidth: "600px", margin: "0 auto 3rem", textTransform: "uppercase", letterSpacing: "2px" }}>
            Deploy our recovery engine within your existing infrastructure in minutes.
          </p>
          <Button href="/signup" size="lg" style={{ background: "white", color: "var(--bg-dark)", padding: "1.5rem 4rem", borderRadius: "var(--radius-full)", fontWeight: "900" }}>
            ACCESS THE PLATFORM
          </Button>
        </div>
      </section>
    </>
  );
}
