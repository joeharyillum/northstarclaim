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
                background: scrolled ? "rgba(2, 6, 17, 0.7)" : "transparent",
                backdropFilter: scrolled ? "blur(16px)" : "none",
                borderBottom: scrolled ? "1px solid var(--border-subtle)" : "none",
                boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.1)" : "none",
                padding: scrolled ? "1rem 0" : "1.5rem 0",
            }}
        >
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: 'none' }}>
                    <img src="/logo.png" alt="NorthStar Medic" style={{ height: "36px" }} />
                    <span style={{ 
                        fontSize: "1.125rem", 
                        fontWeight: "700", 
                        letterSpacing: "-0.02em",
                        background: "linear-gradient(135deg, #38bdf8, #818cf8, #f0abfc, #38bdf8)",
                        backgroundSize: "200% 200%",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        animation: "shimmer 3s ease-in-out infinite",
                    }}>
                        NorthStar Medic ✦
                    </span>
                </Link>

                {/* Nav Links */}
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", fontSize: '0.9rem', fontWeight: '500' }}>
                    <Link href="/features" className="text-slate-300 hover:text-white transition-colors">Features</Link>
                    <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
                    <Link href="/about" className="text-slate-300 hover:text-white transition-colors">About</Link>
                    <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                </div>

                {/* CTA */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link href="/signup" style={{ color: "var(--text-primary)", fontWeight: "500", fontSize: "0.9rem" }}>Sign In</Link>
                    <Link href="/free-scan" style={{ 
                        background: "var(--brand-primary)", 
                        color: "var(--bg-primary)", 
                        padding: "0.6rem 1.2rem", 
                        borderRadius: "var(--radius-full)", 
                        fontWeight: "600", 
                        fontSize: "0.9rem", 
                        textDecoration: "none",
                        transition: 'transform 0.2s ease',
                    }}
                    className="hover:scale-105"
                    >
                        Start Free Scan
                    </Link>
                </div>
            </div>

        </nav>
    );
}
