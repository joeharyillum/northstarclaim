"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
    const pathname = usePathname();

    const mainLinks = [
        { name: "Overview", href: "/dashboard", icon: "📊" },
        { name: "Upload Claims", href: "/dashboard/upload", icon: "📤" },
        { name: "Review", href: "/dashboard/review", icon: "✅" },
        { name: "Settlements", href: "/dashboard/settlements", icon: "⚔️" },
    ];

    const businessLinks = [
        { name: "War Room", href: "/dashboard/war-room", icon: "🎯" },
        { name: "Lead Engine", href: "/dashboard/leads", icon: "🚀" },
        { name: "Wallet", href: "/dashboard/wallet", icon: "💰" },
    ];

    const NavLink = ({ link }: { link: typeof mainLinks[0] }) => {
        const isActive = pathname === link.href;
        return (
            <Link
                href={link.href}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "var(--radius-md)",
                    background: isActive
                        ? "linear-gradient(135deg, rgba(0, 242, 255, 0.12), rgba(112, 0, 255, 0.08))"
                        : "transparent",
                    color: isActive ? "#fff" : "var(--text-secondary)",
                    fontWeight: isActive ? "600" : "400",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease",
                    borderLeft: isActive ? "2px solid var(--brand-primary)" : "2px solid transparent",
                    textDecoration: "none",
                }}
            >
                <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>{link.icon}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.name}</span>
            </Link>
        );
    };

    return (
        <aside style={{
            width: "var(--sidebar-width)",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            background: "var(--bg-secondary)",
            borderRight: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            zIndex: 40,
            overflow: "hidden",
        }}>
            {/* Brand */}
            <div style={{ padding: "1.25rem 1.25rem 1rem" }}>
                <Link href="/" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    textDecoration: "none",
                }}>
                    <div style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "var(--radius-md)",
                        background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "800",
                        fontSize: "0.875rem",
                        flexShrink: 0,
                    }}>
                        N
                    </div>
                    <div style={{ overflow: "hidden" }}>
                        <div style={{
                            fontSize: "1rem",
                            fontWeight: "700",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                        }}>
                            Northstar <span className="text-gradient">Guardian</span>
                        </div>
                        <div style={{
                            fontSize: "0.625rem",
                            color: "var(--brand-accent)",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            lineHeight: 1.4,
                        }}>
                            Medical Claims Intelligence
                        </div>
                    </div>
                </Link>
            </div>

            {/* Status Badge */}
            <div style={{ padding: "0 1.25rem", marginBottom: "1.25rem" }}>
                <div style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(16, 185, 129, 0.06)",
                    border: "1px solid rgba(16, 185, 129, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                    <div style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 6px #10b981",
                    }} />
                    <span style={{
                        fontSize: "0.65rem",
                        fontWeight: "600",
                        color: "#10b981",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                    }}>
                        System Active
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{
                flex: 1,
                padding: "0 0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                overflowY: "auto",
            }}>
                <div style={{
                    fontSize: "0.625rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "0.5rem 0.875rem 0.375rem",
                }}>
                    Claims Pipeline
                </div>
                {mainLinks.map(link => <NavLink key={link.href} link={link} />)}

                <div style={{
                    fontSize: "0.625rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "1rem 0.875rem 0.375rem",
                }}>
                    Business Operations
                </div>
                {businessLinks.map(link => <NavLink key={link.href} link={link} />)}
            </nav>

            {/* User section */}
            <div style={{
                padding: "1rem 1.25rem",
                borderTop: "1px solid var(--border-subtle)",
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                }}>
                    <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "0.75rem",
                        flexShrink: 0,
                    }}>
                        OP
                    </div>
                    <div style={{ overflow: "hidden" }}>
                        <div style={{
                            fontWeight: "600",
                            fontSize: "0.8rem",
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}>
                            Operator
                        </div>
                        <div style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            lineHeight: 1.3,
                        }}>
                            Admin Access
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
