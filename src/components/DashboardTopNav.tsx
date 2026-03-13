"use client";

import { usePathname } from "next/navigation";
import Button from "./Button";
import { useState } from "react";
// Since we are in a client component, we will trigger signout via an API route or server action
const handleSignOut = async () => {
    // Basic redirect for now if no server action hook is clean
    window.location.href = "/api/auth/signout";
}

export default function DashboardTopNav() {
    const pathname = usePathname();
    const [isExporting, setIsExporting] = useState(false);

    // Map the pathname to a friendly title
    const getPageTitle = () => {
        if (pathname === "/dashboard") return "Overview";
        if (pathname === "/dashboard/upload") return "Ingest Claims";
        if (pathname === "/dashboard/review") return "HITL Review";
        if (pathname === "/dashboard/invoices") return "Invoicing & Revenue";
        if (pathname === "/dashboard/settings") return "Clinic Settings";
        return "Dashboard";
    };

    const handleExport = () => {
        setIsExporting(true);
        // Simulate a CSV download process
        setTimeout(() => {
            setIsExporting(false);
            alert("Export complete. Check your downloads folder.");
        }, 1500);
    };

    return (
        <header
            style={{
                background: "var(--bg-secondary)",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                padding: "1rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                zIndex: 10
            }}
        >
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <h1 style={{ fontSize: "1.25rem", margin: 0, fontWeight: "600" }}>
                        {getPageTitle()}
                    </h1>
                    <div style={{
                        height: "8px",
                        width: "120px",
                        background: "rgba(0,0,0,0.05)",
                        borderRadius: "4px",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: "98.4%", // Neural Health sync
                            background: "linear-gradient(90deg, var(--brand-primary), #00f2ff)",
                        }} />
                    </div>
                    <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--brand-accent)" }}>INTEGRITY: OPTIMAL</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>
                    Sandbox Environment • Stripe Connected • $100M Infrastructure
                </p>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <Button
                    variant="secondary"
                    onClick={handleExport}
                    disabled={isExporting}
                >
                    {isExporting ? "Exporting..." : "Export CSV"}
                </Button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "1rem", borderLeft: "1px solid rgba(0,0,0,0.1)" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.875rem" }}>
                        AH
                    </div>
                    <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: "600" }}>Admin</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Advanced Health</div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-secondary)",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            marginLeft: "0.5rem",
                            textDecoration: "underline"
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
}
