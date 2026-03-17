import React from 'react';

export default function TrustFooter() {
    return (
        <div style={{ marginTop: "3rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "2rem", paddingBottom: "1.5rem" }}>
            {/* Security Badges */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "3rem", marginBottom: "1.5rem", opacity: 0.7 }}>
                {[
                    { icon: "🛡️", label: "HIPAA Compliant" },
                    { icon: "⚖️", label: "CMS Compliant" },
                    { icon: "🔒", label: "AES-256 Encrypted" },
                    { icon: "✓", label: "SOC 2 Type II" },
                ].map((badge) => (
                    <div key={badge.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{badge.icon}</div>
                        <div style={{ fontSize: "0.6rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{badge.label}</div>
                    </div>
                ))}
            </div>

            {/* Copyright */}
            <div style={{ textAlign: "center", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                © {new Date().getFullYear()} NORTHSTAR MEDIC. Medical claims recovery intelligence.
                <br />
                All activity is logged and auditable for compliance.
            </div>
        </div>
    );
}
