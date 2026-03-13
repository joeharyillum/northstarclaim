"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Overview", href: "/dashboard", icon: "📊" },
        { name: "War Room", href: "/dashboard/settlements", icon: "⚔️" },
        { name: "Lead Machine", href: "/dashboard/leads", icon: "🚀" },
        { name: "Wallet Vault", href: "/dashboard/wallet", icon: "💰" },
        { name: "Upload Claims", href: "/dashboard/upload", icon: "📤" },
        { name: "Review & Approve", href: "/dashboard/review", icon: "✅" },
        { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
    ];

    return (
        <aside style={{
            width: "280px",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            background: "var(--bg-secondary)",
            borderRight: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem 0",
            zIndex: 40
        }}>
            <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-sm)",
                        background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1rem"
                    }}>
                        N
                    </div>
                    <span style={{ fontSize: "1.25rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
                        Northstar <span className="text-gradient">Guardian</span>
                    </span>
                </Link>
                <div style={{ fontSize: "0.75rem", color: "var(--brand-accent)", fontWeight: "600", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Guardian Grid Portal
                </div>
                <div style={{ marginTop: "1rem", padding: "0.5rem", borderRadius: "0.5rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--brand-accent)", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        🛡️ Rights Protection Active
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: "0 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "0.75rem 1rem",
                                borderRadius: "var(--radius-md)",
                                background: isActive ? "var(--brand-primary)" : "transparent",
                                color: isActive ? "white" : "var(--text-secondary)",
                                fontWeight: isActive ? "600" : "500",
                                transition: "all 0.2s"
                            }}
                        >
                            <span style={{ fontSize: "1.25rem" }}>{link.icon}</span>
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", textAlign: "center", lineHeight: "40px" }}>
                        OP
                    </div>
                    <div>
                        <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>Grid Operator</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Master Node // ALPHA</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
