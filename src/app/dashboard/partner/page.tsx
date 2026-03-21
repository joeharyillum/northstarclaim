"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PartnerStats {
    referralCode: string;
    referralLink: string;
    stripeConnected: boolean;
    stats: {
        totalReferrals: number;
        totalClaims: number;
        totalEarned: number;
        pendingCommission: number;
    };
    clients: Array<{
        id: string;
        clinicName: string;
        email: string;
        joinedAt: string;
        claimsCount: number;
    }>;
    recentPayouts: Array<{
        id: string;
        details: string;
        date: string;
    }>;
}

export default function PartnerDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<PartnerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch("/api/partner/stats");
            if (res.status === 403) {
                router.push("/dashboard");
                return;
            }
            if (!res.ok) throw new Error("Failed to load");
            const json = await res.json();
            setData(json);
        } catch {
            setError("Failed to load partner data");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (status === "authenticated") fetchStats();
    }, [status, fetchStats]);

    const copyLink = async () => {
        if (!data) return;
        await navigator.clipboard.writeText(data.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (status === "loading" || loading) {
        return (
            <div style={{ maxWidth: "1200px", width: "100%", padding: "2rem 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #38bdf8, #818cf8)", animation: "pulse 2s infinite" }} />
                    <div>
                        <div style={{ height: "24px", width: "200px", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }} />
                        <div style={{ height: "14px", width: "140px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", marginTop: "6px" }} />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: "1200px", padding: "3rem 0", textAlign: "center" }}>
                <p style={{ color: "#ef4444" }}>{error}</p>
            </div>
        );
    }

    if (!data) return null;

    const kpis = [
        {
            label: "Total Earned",
            value: `$${data.stats.totalEarned.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            sub: "Commission earned",
            color: "#10b981",
            borderColor: "rgba(16, 185, 129, 0.2)",
            bgColor: "rgba(16, 185, 129, 0.06)",
        },
        {
            label: "Pending",
            value: `$${data.stats.pendingCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            sub: "Awaiting payout",
            color: "#f59e0b",
            borderColor: "rgba(245, 158, 11, 0.2)",
            bgColor: "rgba(245, 158, 11, 0.06)",
        },
        {
            label: "Referred Clients",
            value: data.stats.totalReferrals.toString(),
            sub: "Active referrals",
            color: "#3b82f6",
            borderColor: "rgba(59, 130, 246, 0.2)",
            bgColor: "rgba(59, 130, 246, 0.06)",
        },
        {
            label: "Total Claims",
            value: data.stats.totalClaims.toString(),
            sub: "From your referrals",
            color: "#a855f7",
            borderColor: "rgba(168, 85, 247, 0.2)",
            bgColor: "rgba(168, 85, 247, 0.06)",
        },
    ];

    return (
        <div style={{ maxWidth: "1200px", width: "100%", overflowX: "hidden" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{
                        width: "44px", height: "44px", borderRadius: "12px",
                        background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: "800", fontSize: "1.2rem",
                        boxShadow: "0 4px 16px rgba(56, 189, 248, 0.25)",
                    }}>
                        ◈
                    </div>
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0 }}>Partner Dashboard</h1>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                            Track referrals, commissions & payouts
                        </p>
                    </div>
                </div>
            </div>

            {/* Referral Link Card */}
            <div style={{
                padding: "1.25rem 1.5rem",
                borderRadius: "var(--radius-lg)",
                background: "linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(129, 140, 248, 0.06))",
                border: "1px solid rgba(56, 189, 248, 0.15)",
                marginBottom: "1.5rem",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "1rem",
            }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
                        Your Referral Link
                    </div>
                    <div style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "#38bdf8", wordBreak: "break-all" }}>
                        {data.referralLink}
                    </div>
                </div>
                <button
                    onClick={copyLink}
                    style={{
                        padding: "0.6rem 1.25rem",
                        borderRadius: "var(--radius-md)",
                        background: copied ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.12)",
                        border: `1px solid ${copied ? "rgba(16, 185, 129, 0.3)" : "rgba(56, 189, 248, 0.25)"}`,
                        color: copied ? "#10b981" : "#38bdf8",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                    }}
                >
                    {copied ? "✓ Copied!" : "Copy Link"}
                </button>
                <div style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: "0.7rem",
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                }}>
                    Code: <span style={{ fontWeight: "700", color: "white" }}>{data.referralCode}</span>
                </div>
            </div>

            {/* Stripe Connect Status */}
            {!data.stripeConnected && (
                <div style={{
                    padding: "1rem 1.5rem",
                    borderRadius: "var(--radius-lg)",
                    background: "rgba(245, 158, 11, 0.06)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                }}>
                    <span style={{ fontSize: "1.2rem" }}>⚠</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#f59e0b" }}>
                            Connect Stripe to Receive Payouts
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                            Link your Stripe account to receive commission payouts automatically.
                        </div>
                    </div>
                    <a
                        href="/dashboard"
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "var(--radius-md)",
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            color: "white",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            textDecoration: "none",
                        }}
                    >
                        Connect Stripe
                    </a>
                </div>
            )}

            {/* KPI Cards */}
            <div className="stats-grid" style={{ marginBottom: "2rem" }}>
                {kpis.map((kpi, i) => (
                    <div key={i} style={{
                        padding: "1.25rem",
                        borderRadius: "var(--radius-lg)",
                        background: kpi.bgColor,
                        border: `1px solid ${kpi.borderColor}`,
                        position: "relative",
                        overflow: "hidden",
                    }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                            {kpi.label}
                        </div>
                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: kpi.color, lineHeight: 1.2 }}>
                            {kpi.value}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                            {kpi.sub}
                        </div>
                    </div>
                ))}
            </div>

            {/* Referred Clients Table */}
            <div style={{
                borderRadius: "var(--radius-lg)",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                overflow: "hidden",
                marginBottom: "2rem",
            }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: "700", margin: 0 }}>Referred Clients</h2>
                </div>
                {data.clients.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.3 }}>◇</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            No referrals yet. Share your link to start earning commissions!
                        </div>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Clinic</th>
                                    <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</th>
                                    <th style={{ padding: "0.75rem 1.25rem", textAlign: "center", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Claims</th>
                                    <th style={{ padding: "0.75rem 1.25rem", textAlign: "right", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.clients.map((client) => (
                                    <tr key={client.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                        <td style={{ padding: "0.75rem 1.25rem", fontWeight: "600" }}>{client.clinicName}</td>
                                        <td style={{ padding: "0.75rem 1.25rem", color: "var(--text-secondary)" }}>{client.email}</td>
                                        <td style={{ padding: "0.75rem 1.25rem", textAlign: "center" }}>
                                            <span style={{
                                                padding: "0.2rem 0.6rem",
                                                borderRadius: "999px",
                                                background: "rgba(59, 130, 246, 0.1)",
                                                color: "#3b82f6",
                                                fontSize: "0.75rem",
                                                fontWeight: "600",
                                            }}>
                                                {client.claimsCount}
                                            </span>
                                        </td>
                                        <td style={{ padding: "0.75rem 1.25rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                            {new Date(client.joinedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Payouts */}
            <div style={{
                borderRadius: "var(--radius-lg)",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                overflow: "hidden",
            }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: "700", margin: 0 }}>Recent Payouts</h2>
                </div>
                {data.recentPayouts.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.3 }}>◇</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            No payouts yet. Commissions are paid when referred clients&apos; claims are recovered.
                        </div>
                    </div>
                ) : (
                    <div>
                        {data.recentPayouts.map((payout) => (
                            <div key={payout.id} style={{
                                padding: "0.875rem 1.25rem",
                                borderBottom: "1px solid rgba(255,255,255,0.03)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}>
                                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                    {payout.details}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                    {new Date(payout.date).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* How It Works */}
            <div style={{
                marginTop: "2rem",
                padding: "1.5rem",
                borderRadius: "var(--radius-lg)",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
            }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "1rem" }}>How Partner Commissions Work</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    {[
                        { step: "1", title: "Share Your Link", desc: "Send clinics your referral link" },
                        { step: "2", title: "They Sign Up", desc: "Clinic creates account & uploads claims" },
                        { step: "3", title: "AI Recovers Claims", desc: "Our AI processes & appeals denials" },
                        { step: "4", title: "You Earn 15%", desc: "Get 15% of every recovered claim amount" },
                    ].map((item) => (
                        <div key={item.step} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                            <div style={{
                                width: "28px", height: "28px", borderRadius: "50%",
                                background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", fontWeight: "700", fontSize: "0.75rem", flexShrink: 0,
                            }}>
                                {item.step}
                            </div>
                            <div>
                                <div style={{ fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.15rem" }}>{item.title}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
