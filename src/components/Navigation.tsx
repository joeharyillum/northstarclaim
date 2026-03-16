"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navigation() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // Hide global nav on dashboard — dashboard has its own sidebar/topnav
    if (pathname.startsWith("/dashboard")) return null;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    const navLinkItems = [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/about", label: "About" },
        { href: "/dashboard", label: "Dashboard" },
    ];

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
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>

                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: 'none', flexShrink: 0 }}>
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

                {/* Nav Links — hidden on mobile via CSS */}
                <div className="nav-links" style={{ display: "flex", gap: "1.5rem", alignItems: "center", fontSize: '0.9rem', fontWeight: '500' }}>
                    {navLinkItems.map(item => (
                        <Link key={item.href} href={item.href} className="text-slate-300 hover:text-white transition-colors">{item.label}</Link>
                    ))}
                </div>

                {/* CTA + Hamburger */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link href="/signup" className="nav-links" style={{ color: "var(--text-primary)", fontWeight: "500", fontSize: "0.9rem", whiteSpace: "nowrap" }}>Sign In</Link>
                    <Link href="/free-scan" className="nav-links hover:scale-105" style={{ 
                        background: "var(--brand-primary)", 
                        color: "var(--bg-primary)", 
                        padding: "0.6rem 1.2rem", 
                        borderRadius: "var(--radius-full)", 
                        fontWeight: "600", 
                        fontSize: "0.9rem", 
                        textDecoration: "none",
                        transition: 'transform 0.2s ease',
                        whiteSpace: "nowrap",
                    }}
                    >
                        Start Free Scan
                    </Link>

                    {/* Hamburger — visible only on mobile via CSS */}
                    <button
                        className="nav-mobile-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle navigation menu"
                        style={{
                            display: "none",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0.5rem",
                            color: "var(--text-primary)",
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {menuOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <div className="nav-mobile-menu">
                    <button
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                        style={{
                            position: "absolute", top: "1.5rem", right: "1.5rem",
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--text-primary)", padding: "0.5rem",
                        }}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    {navLinkItems.map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>
                    ))}
                    <Link href="/signup" onClick={() => setMenuOpen(false)}>Sign In</Link>
                    <Link
                        href="/free-scan"
                        onClick={() => setMenuOpen(false)}
                        style={{
                            background: "var(--brand-primary)",
                            color: "var(--bg-primary)",
                            padding: "0.75rem 2rem",
                            borderRadius: "var(--radius-full)",
                            fontWeight: "600",
                            textDecoration: "none",
                        }}
                    >
                        Start Free Scan
                    </Link>
                </div>
            )}
        </nav>
    );
}
