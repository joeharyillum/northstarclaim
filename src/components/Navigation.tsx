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
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <img src="/logo.png" alt="Northstar Technologies" style={{ height: "48px", objectFit: "contain" }} />
                    <span style={{ fontSize: "1.25rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
                        Northstar <span className="text-gradient">Claim</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <Link href="/dashboard/leads" style={{ color: "white", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem" }}>Lead Machine</Link>
                    <Link href="/dashboard/settlements" style={{ color: "white", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem" }}>War Room</Link>
                    <Link href="/dashboard/wallet" style={{ color: "white", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem" }}>Wallet</Link>
                    <Link href="/dashboard" style={{ color: "white", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem" }}>Dashboard</Link>
                    <Link href="/about" style={{ color: "white", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem" }}>About</Link>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.6rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "100px" }}>
                        <div style={{ width: "6px", height: "6px", background: "#10b981", borderRadius: "50%" }}></div>
                        <span style={{ color: "#10b981", fontWeight: "900", fontSize: "0.6rem" }}>LIVE</span>
                    </div>

                    <Link href="/free-scan" style={{ background: "var(--brand-primary)", color: "white", padding: "0.6rem 1.2rem", borderRadius: "100px", fontWeight: "800", fontSize: "0.75rem", textDecoration: "none" }}>
                        Initiate Scan
                    </Link>
                </div>
            </div>

        </nav>
    );
}
