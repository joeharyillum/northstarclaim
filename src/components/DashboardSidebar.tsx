"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role || "client";
    const isAdmin = role === "admin";
    const isBiller = role === "biller";
    const userName = session?.user?.name || "User";
    const initials = userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const toggle = () => setSidebarOpen(prev => !prev);
        window.addEventListener("toggle-dashboard-sidebar", toggle);
        return () => window.removeEventListener("toggle-dashboard-sidebar", toggle);
    }, []);

    useEffect(() => {
        if (sidebarOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);

    const closeSidebar = () => setSidebarOpen(false);

    const mainLinks = [
        { name: "Overview", href: "/dashboard", icon: "◎" },
        ...(!isAdmin && !isBiller ? [
            { name: "My Claims", href: "/dashboard/claims", icon: "◈" },
        ] : []),
        ...(isBiller ? [
            { name: "Client Claims", href: "/dashboard/claims", icon: "◈" },
        ] : []),
        ...(isAdmin ? [
            { name: "Upload Claims", href: "/dashboard/upload", icon: "⬆" },
            { name: "Review", href: "/dashboard/review", icon: "◉" },
            { name: "Settlements", href: "/dashboard/settlements", icon: "⚖" },
        ] : []),
    ];

    const businessLinks = [
        ...(isAdmin ? [
            { name: "War Room", href: "/dashboard/war-room", icon: "⌘" },
            { name: "Lead Engine", href: "/dashboard/leads", icon: "◆" },
        ] : []),
        { name: "Wallet", href: "/dashboard/wallet", icon: "◇" },
        { name: "Invoices", href: "/dashboard/invoices", icon: "▤" },
        { name: "Settings (2FA)", href: "/dashboard/settings", icon: "⚙" },
    ];

    return (
        <>
        {sidebarOpen && (
            <div
                className="dash-sidebar-backdrop"
                onClick={closeSidebar}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    zIndex: 199,
                    backdropFilter: "blur(4px)",
                }}
            />
        )}
        <aside className={`dash-sidebar${sidebarOpen ? " sidebar-open" : ""}`} style={{
            width: "var(--sidebar-width)",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            background: "linear-gradient(180deg, rgba(8, 12, 30, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)",
            borderRight: "1px solid rgba(255, 255, 255, 0.04)",
            display: "flex",
            flexDirection: "column",
            zIndex: 40,
            overflow: "hidden",
            backdropFilter: "blur(20px)",
        }}>
            {/* Brand */}
            <div style={{ padding: "1.5rem 1.25rem 1.25rem" }}>
                <Link href="/" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    textDecoration: "none",
                }}>
                    <div style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "var(--radius-lg)",
                        background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "800",
                        fontSize: "1rem",
                        flexShrink: 0,
                        position: "relative",
                        boxShadow: "0 4px 16px rgba(56, 189, 248, 0.25)",
                    }}>
                        <span style={{ position: "relative", zIndex: 1 }}>N</span>
                        <div style={{
                            position: "absolute",
                            inset: "-3px",
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid rgba(56, 189, 248, 0.3)",
                            animation: "pulse-ring 3s ease-in-out infinite",
                        }} />
                    </div>
                    <div style={{ overflow: "hidden" }}>
                        <div style={{
                            fontSize: "1.05rem",
                            fontWeight: "700",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                        }}>
                            NORTHSTAR <span className="text-gradient">MEDIC</span>
                        </div>
                        <div style={{
                            fontSize: "0.6rem",
                            color: "var(--text-muted)",
                            fontWeight: "500",
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            lineHeight: 1.4,
                        }}>
                            AI Recovery Platform
                        </div>
                    </div>
                </Link>
            </div>

            {/* Live Indicator */}
            <div style={{ padding: "0 1.25rem", marginBottom: "1.5rem" }}>
                <div style={{
                    padding: "0.6rem 0.875rem",
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(16, 185, 129, 0.02))",
                    border: "1px solid rgba(16, 185, 129, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: "#10b981",
                            boxShadow: "0 0 8px #10b981, 0 0 16px rgba(16, 185, 129, 0.4)",
                            animation: "breath 3s ease-in-out infinite",
                        }} />
                        <span style={{
                            fontSize: "0.65rem",
                            fontWeight: "600",
                            color: "#10b981",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                        }}>
                            System Live
                        </span>
                    </div>
                    <span style={{
                        fontSize: "0.55rem",
                        color: "var(--text-muted)",
                        fontFamily: "monospace",
                    }}>
                        v2.0
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{
                flex: 1,
                padding: "0 0.875rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.125rem",
                overflowY: "auto",
            }}>
                <div style={{
                    fontSize: "0.6rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "0.625rem 1rem 0.5rem",
                }}>
                    Claims Pipeline
                </div>
                {mainLinks.map(link => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeSidebar}
                            className={`sidebar-nav-link${isActive ? " active" : ""}`}
                        >
                            <span style={{
                                fontSize: "0.95rem",
                                lineHeight: 1,
                                flexShrink: 0,
                                width: "20px",
                                textAlign: "center",
                                opacity: isActive ? 1 : 0.6,
                            }}>{link.icon}</span>
                            <span>{link.name}</span>
                        </Link>
                    );
                })}

                <div style={{
                    fontSize: "0.6rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "1.25rem 1rem 0.5rem",
                }}>
                    Business
                </div>
                {businessLinks.map(link => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeSidebar}
                            className={`sidebar-nav-link${isActive ? " active" : ""}`}
                        >
                            <span style={{
                                fontSize: "0.95rem",
                                lineHeight: 1,
                                flexShrink: 0,
                                width: "20px",
                                textAlign: "center",
                                opacity: isActive ? 1 : 0.6,
                            }}>{link.icon}</span>
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div style={{
                padding: "1rem 1.25rem 1.5rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                marginTop: "auto",
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-lg)",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                }}>
                    <div style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "var(--radius-md)",
                        background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "0.75rem",
                        flexShrink: 0,
                    }}>
                        {initials}
                    </div>
                    <div style={{ overflow: "hidden", flex: 1 }}>
                        <div style={{
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}>
                            {userName}
                        </div>
                        <div style={{
                            fontSize: "0.6rem",
                            color: isAdmin ? "#a78bfa" : isBiller ? "#38bdf8" : "var(--text-muted)",
                            fontWeight: "500",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                        }}>
                            {isAdmin ? "Administrator" : isBiller ? "Biller Partner" : "Client"}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
        </>
    );
}
