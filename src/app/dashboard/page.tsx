import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Button from "@/components/Button";
import LiveBalance from "@/components/LiveBalance";

export default async function DashboardOverview() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [totalClaims, pendingClaims, recoveredInvoices, recentActivity] = await Promise.all([
        prisma.claim.count({
            where: { batch: { userId: session.user.id } }
        }),
        prisma.claim.count({
            where: {
                batch: { userId: session.user.id },
                status: { in: ["PENDING_ANALYSIS", "RECOVERABLE"] }
            }
        }),
        prisma.invoice.aggregate({
            _sum: { amountEarned: true },
            where: { claim: { batch: { userId: session.user.id } }, status: "PAID" }
        }),
        prisma.claim.findMany({
            where: { batch: { userId: session.user.id } },
            orderBy: { createdAt: 'desc' },
            take: 6
        })
    ]);

    const totalRecovered = recoveredInvoices._sum.amountEarned || 0;
    const successRate = totalClaims > 0 ? ((totalClaims - pendingClaims) / totalClaims * 100).toFixed(1) : "0.0";

    const kpis = [
        {
            label: "Total Recovered",
            value: `$${(totalRecovered / 1000000).toFixed(1)}M`,
            sub: "Revenue collected",
            color: "#10b981",
            borderColor: "rgba(16, 185, 129, 0.2)",
            bgColor: "rgba(16, 185, 129, 0.06)",
        },
        {
            label: "Active Claims",
            value: totalClaims.toLocaleString(),
            sub: "In pipeline",
            color: "#3b82f6",
            borderColor: "rgba(59, 130, 246, 0.2)",
            bgColor: "rgba(59, 130, 246, 0.06)",
        },
        {
            label: "Success Rate",
            value: `${successRate}%`,
            sub: "Recovery rate",
            color: "#a855f7",
            borderColor: "rgba(168, 85, 247, 0.2)",
            bgColor: "rgba(168, 85, 247, 0.06)",
        },
        {
            label: "Pending Review",
            value: pendingClaims.toString(),
            sub: "Needs attention",
            color: "#f59e0b",
            borderColor: "rgba(245, 158, 11, 0.2)",
            bgColor: "rgba(245, 158, 11, 0.06)",
        },
    ];

    const statusColors: Record<string, { bg: string; text: string }> = {
        PENDING_ANALYSIS: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" },
        RECOVERABLE: { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981" },
        DENIED: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" },
        APPEALED: { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" },
        SETTLED: { bg: "rgba(168, 85, 247, 0.1)", text: "#a855f7" },
    };

    return (
        <div style={{ maxWidth: "1200px" }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
            }}>
                <div>
                    <h1 style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        marginBottom: "0.25rem",
                        letterSpacing: "-0.02em",
                    }}>
                        Operations Center
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        Welcome back, {session.user.name}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button href="/dashboard/war-room" size="sm">War Room</Button>
                    <Button href="/dashboard/upload" variant="outline" size="sm">Upload</Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
                marginBottom: "1.5rem",
            }}>
                {kpis.map((kpi) => (
                    <div key={kpi.label} style={{
                        background: kpi.bgColor,
                        border: `1px solid ${kpi.borderColor}`,
                        borderRadius: "var(--radius-xl)",
                        padding: "1.25rem",
                    }}>
                        <div style={{
                            fontSize: "0.65rem",
                            fontWeight: "700",
                            color: kpi.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: "0.5rem",
                        }}>
                            {kpi.label}
                        </div>
                        <div style={{
                            fontSize: "1.75rem",
                            fontWeight: "800",
                            lineHeight: 1.1,
                            marginBottom: "0.25rem",
                            letterSpacing: "-0.02em",
                        }}>
                            {kpi.value}
                        </div>
                        <div style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                        }}>
                            {kpi.sub}
                        </div>
                    </div>
                ))}
            </div>

            {/* Stripe Wallet */}
            <div style={{
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                borderRadius: "var(--radius-xl)",
                padding: "1.25rem",
                marginBottom: "1.5rem",
            }}>
                <div style={{
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                    💳 Stripe Wallet Balance
                </div>
                <LiveBalance />
            </div>

            {/* Recent Claims */}
            <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
            }}>
                <div style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>Recent Claims</span>
                    <Button href="/dashboard/review" variant="outline" size="sm">View All</Button>
                </div>
                <div>
                    {recentActivity.length === 0 ? (
                        <div style={{
                            padding: "2.5rem",
                            textAlign: "center",
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                        }}>
                            No claims yet. Upload ERA/EOB files to get started.
                        </div>
                    ) : (
                        recentActivity.map((claim, i) => (
                            <div key={i} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.875rem 1.25rem",
                                borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border-subtle)" : "none",
                                transition: "background 0.15s",
                            }}>
                                <div>
                                    <div style={{
                                        fontWeight: "600",
                                        fontSize: "0.85rem",
                                        marginBottom: "0.125rem",
                                    }}>
                                        {claim.patientId}
                                    </div>
                                    <div style={{
                                        display: "inline-block",
                                        fontSize: "0.65rem",
                                        fontWeight: "600",
                                        padding: "0.125rem 0.5rem",
                                        borderRadius: "var(--radius-full)",
                                        background: (statusColors[claim.status] || statusColors.PENDING_ANALYSIS).bg,
                                        color: (statusColors[claim.status] || statusColors.PENDING_ANALYSIS).text,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                    }}>
                                        {claim.status.replace(/_/g, " ")}
                                    </div>
                                </div>
                                <div style={{
                                    fontWeight: "700",
                                    fontSize: "0.95rem",
                                }}>
                                    ${claim.billedAmount.toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
