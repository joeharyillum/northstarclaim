"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    if (pathname.startsWith("/dashboard")) return null;

    return (
        <footer style={{
            background: "#010413",
            color: "var(--text-secondary)",
            padding: "clamp(3rem, 8vw, 10rem) 0 clamp(2rem, 4vw, 6rem)",
            marginTop: "auto",
            borderTop: "1px solid rgba(255,255,255,0.03)",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Ambient Background Glow */}
            <div style={{
                position: "absolute", bottom: "-10%", left: "50%", transform: "translateX(-50%)",
                width: "80%", height: "40%", background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)",
                pointerEvents: "none", zIndex: 0
            }} />

            <div className="container footer-grid" style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                gap: "clamp(1.5rem, 4vw, 5rem)",
                marginBottom: "clamp(2rem, 4vw, 6rem)",
                position: "relative",
                zIndex: 1
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            background: "var(--brand-primary)",
                            borderRadius: "var(--radius-md)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
                        }}>
                            <img src="/logo.png" alt="N" style={{ width: "24px" }} />
                        </div>
                        <span style={{ fontSize: "1.5rem", fontWeight: "900", color: "white", letterSpacing: "-0.04em" }}>
                            NORTHSTAR <span className="text-gradient">MEDIC</span>
                        </span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: "1.7", marginBottom: "2.5rem", fontSize: "0.95rem", maxWidth: "400px" }}>
                        The global guardian in medical-legal AI. We deploy an autonomous neural army to protect and recover your revenue rights at an infinite scale.
                    </p>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1.25rem",
                        background: "rgba(16, 185, 129, 0.05)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid rgba(16, 185, 129, 0.1)"
                    }}>
                        <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">Guardian Compliance</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--brand-accent)", textTransform: "uppercase", letterSpacing: "1px" }}>Grid Status: Optimal</span>
                    </div>
                </div>

                <div>
                    <h4 style={{ color: "white", marginBottom: "2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "900" }}>Explore</h4>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9rem" }}>
                        <li><Link href="/features" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>How It Works</Link></li>
                        <li><Link href="/free-scan" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Free Claim Scan</Link></li>
                        <li><Link href="/pricing" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Pricing Plans</Link></li>
                        <li><Link href="/login" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Client Dashboard</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: "white", marginBottom: "2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "900" }}>Protocol</h4>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9rem" }}>
                        <li><Link href="/about" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Mission Design</Link></li>
                        <li><Link href="/privacy" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Privacy Policy</Link></li>
                        <li><Link href="/baa" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>HIPAA Compliance</Link></li>
                        <li><Link href="/terms" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Terms &amp; Security</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: "white", marginBottom: "2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "900" }}>Connect</h4>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9rem" }}>
                        <li><Link href="/login" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Partner Login</Link></li>
                        <li><Link href="/pricing" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Agency Access</Link></li>
                        <li><a href="mailto:support@northstarmedic.com" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Contact Support</a></li>
                    </ul>
                </div>
            </div>

            <div className="container footer-bottom" style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                paddingTop: "clamp(1.5rem, 2vw, 3rem)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.85rem",
                position: "relative",
                zIndex: 1
            }}>
                <div style={{ display: "flex", gap: "2rem" }}>
                    <p>&copy; {new Date().getFullYear()} NORTHSTAR MEDIC Alliance. All rights reserved.</p>
                </div>
                <div style={{ display: "flex", gap: "clamp(1rem, 2vw, 3rem)", fontWeight: "700", flexWrap: "wrap" }}>
                    <p style={{ color: "var(--brand-accent)" }}>// GRID SECURED</p>
                    <p style={{ color: "var(--brand-primary)" }}>// PHI PROTECTED</p>
                    <p style={{ color: "rgba(255,255,255,0.6)" }}>v4.1 Autonomous</p>
                </div>
            </div>
        </footer>
    );
}
