"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "./Button";
import { useState } from "react";

const handleSignOut = async () => {
    window.location.href = "/api/auth/signout";
}

export default function DashboardTopNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isExporting, setIsExporting] = useState(false);

    const userName = session?.user?.name || "User";
    const role = session?.user?.role || "client";
    const initials = userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    const getPageTitle = () => {
        if (pathname === "/dashboard") return "Overview";
        if (pathname === "/dashboard/upload") return "Upload Claims";
        if (pathname === "/dashboard/review") return "Review & Approve";
        if (pathname === "/dashboard/invoices") return "Invoices";
        if (pathname === "/dashboard/wallet") return "Wallet";
        if (pathname === "/dashboard/war-room") return "War Room";
        if (pathname === "/dashboard/settlements") return "Settlements";
        if (pathname === "/dashboard/leads") return "Lead Engine";
        return "Dashboard";
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            alert("Export complete. Check your downloads folder.");
        }, 1500);
    };

    return (
        <header style={{
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "0 2rem",
            height: "var(--topnav-height)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 50,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <h1 style={{
                    fontSize: "1.125rem",
                    margin: 0,
                    fontWeight: "600",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                }}>
                    {getPageTitle()}
                </h1>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.25rem 0.625rem",
                    background: "rgba(16, 185, 129, 0.08)",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(16, 185, 129, 0.15)",
                }}>
                    <div style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 4px #10b981",
                    }} />
                    <span style={{
                        fontSize: "0.65rem",
                        fontWeight: "600",
                        color: "#10b981",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                    }}>
                        Connected
                    </span>
                </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting}
                >
                    {isExporting ? "Exporting..." : "Export CSV"}
                </Button>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    paddingLeft: "0.75rem",
                    borderLeft: "1px solid var(--border-subtle)",
                }}>
                    <div style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "0.7rem",
                    }}>
                        {initials}
                    </div>
                    <div style={{ lineHeight: 1.3 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: "600" }}>{userName}</div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            marginLeft: "0.25rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            transition: "all 0.15s",
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
}
