"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navigation() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                transition: "all var(--transition-normal)",
                background: scrolled ? "rgba(2, 6, 23, 0.8)" : "transparent",
                backdropFilter: scrolled ? "blur(24px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
                boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.5)" : "none",
                padding: scrolled ? "1.25rem 0" : "2rem 0",
            }}
        >
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.3rem", lineHeight: "1" }}>⚡</span>
                    <div>
                        <div style={{ fontSize: "1.1rem", fontWeight: "800", letterSpacing: "-0.03em", lineHeight: "1.2" }}>
                            MediClaim <span className="text-gradient">AI</span>
                        </div>
                        <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", lineHeight: "1" }}>Autonomous Lattice</div>
                    </div>
                </Link>

                {/* Nav Links */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", transition: "color 0.2s" }}>Mission</Link>
                    <Link href="/dashboard/leads" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>Nodes</Link>
                    <Link href="/dashboard/settlements" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>Protocols</Link>
                    <Link href="/dashboard/wallet" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>Vault</Link>
                    <Link href="/about" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>About</Link>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.6rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "100px" }}>
                        <div style={{ width: "6px", height: "6px", background: "#10b981", borderRadius: "50%" }}></div>
                        <span style={{ color: "#10b981", fontWeight: "900", fontSize: "0.6rem" }}>LIVE</span>
                    </div>

                    <Link href="/signup" style={{ background: "rgba(255,255,255,0.06)", color: "white", padding: "0.5rem 1rem", borderRadius: "6px", fontWeight: "700", fontSize: "0.7rem", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", textTransform: "uppercase", letterSpacing: "1px" }}>
                        LOGIN
                    </Link>
                    <Link href="/free-scan" style={{ background: "linear-gradient(135deg, #00f2ff, #2563eb)", color: "white", padding: "0.5rem 1.2rem", borderRadius: "6px", fontWeight: "800", fontSize: "0.7rem", textDecoration: "none", textTransform: "uppercase", letterSpacing: "1px", boxShadow: "0 0 20px rgba(0,242,255,0.25)" }}>
                        Register Node
                    </Link>
                </div>
            </div>

        </nav>
    );
}
