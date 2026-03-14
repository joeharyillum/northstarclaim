"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <footer style={{
            background: "#010413",
            color: "var(--text-secondary)",
            padding: "10rem 0 6rem",
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

            <div className="container" style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                gap: "5rem",
                marginBottom: "6rem",
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
                            Northstar <span className="text-gradient">Guardian</span>
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
                    <h4 style={{ color: "white", marginBottom: "2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "900" }}>Grid Node</h4>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9rem" }}>
                        <li><Link href="/dashboard/leads" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Lead Machine</Link></li>
                        <li><Link href="/dashboard/wallet" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Revenue Vault</Link></li>
                        <li><Link href="/free-scan" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Neural Simulator</Link></li>
                        <li><Link href="/pricing" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Node Participation</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: "white", marginBottom: "2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "900" }}>Protocol</h4>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9rem" }}>
                        <li><Link href="/about" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Mission Design</Link></li>
                        <li><Link href="/about" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Privacy Policy</Link></li>
                        <li><Link href="/about" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>HIPAA Compliance</Link></li>
                        <li><Link href="/about" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Security</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: "white", marginBottom: "2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "900" }}>Connect</h4>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9rem" }}>
                        <li><Link href="/signup" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Partner Login</Link></li>
                        <li><Link href="/pricing" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Agency Access</Link></li>
                        <li><a href="mailto:support@northstarclaim.com" style={{ transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Contact Support</a></li>
                    </ul>
                </div>
            </div>

            <div className="container" style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                paddingTop: "3rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "2rem",
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.85rem",
                position: "relative",
                zIndex: 1
            }}>
                <div style={{ display: "flex", gap: "2rem" }}>
                    <p>&copy; {new Date().getFullYear()} Northstar Claim Alliance. All rights reserved.</p>
                </div>
                <div style={{ display: "flex", gap: "3rem", fontWeight: "700" }}>
                    <p style={{ color: "var(--brand-accent)" }}>// GRID SECURED</p>
                    <p style={{ color: "var(--brand-primary)" }}>// PHI PROTECTED</p>
                    <p style={{ color: "rgba(255,255,255,0.6)" }}>v4.1 Autonomous</p>
                </div>
            </div>
        </footer>
    );
}
