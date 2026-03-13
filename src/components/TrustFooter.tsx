import React from 'react';

const testimonials = [
    { text: "Agent 41 recovered $142k for us in under 48 hours. The clinical precision is terrifyingly good.", stars: "⭐⭐⭐⭐⭐", author: "Dr. Aris Thorne" },
    { text: "Finally, a system that doesn't just 'ask' for money but demands it with legal authority.", stars: "⭐⭐⭐⭐⭐", author: "Director of Finance, Metro Health" }
];

export default function TrustFooter() {
    return (
        <div style={{ marginTop: "4rem", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "3rem", paddingBottom: "2rem" }}>

            {/* Mission Section */}
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>
                    Mission Orientation
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", maxWidth: "600px", margin: "0 auto", lineHeight: "1.4" }}>
                    "We are the Guardian of Healthcare Rights, ensuring no clinical effort goes uncompensated."
                </h2>
            </div>

            {/* Testimonials */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "4rem" }}>
                {testimonials.map((t, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: "1.5rem", background: "white" }}>
                        <div style={{ color: "var(--brand-accent)", marginBottom: "0.5rem" }}>{t.stars}</div>
                        <p style={{ fontSize: "0.95rem", fontStyle: "italic", marginBottom: "1rem", color: "var(--text-primary)" }}>"{t.text}"</p>
                        <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)" }}>— {t.author}</div>
                    </div>
                ))}
            </div>

            {/* Security Insignia Section */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4rem", opacity: 0.8 }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🛡️</div>
                    <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>HIPAA Hardened</div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>⚖️</div>
                    <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>Legal-Centric AI</div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🔒</div>
                    <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>256-Bit Encrypted</div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🧠</div>
                    <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>NCCO Certified</div>
                </div>
            </div>

            {/* Copyright & Rights Disclaimer */}
            <div style={{ textAlign: "center", marginTop: "3rem", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                © 2026 Northstar Claim Guardian Grid. Dedicated to the protection of human healthcare rights.
                <br />
                All neural processes are logged for legal transparency.
            </div>
        </div>
    );
}
