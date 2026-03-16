import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-session";
import { redirect } from "next/navigation";

export default async function MyClaimsPage() {
    const session = await getOwnerSession();
    if (!session) redirect("/signup");

    const claims = await prisma.claim.findMany({
        where: { batch: { userId: session.user.id } },
        include: {
            appeal: { select: { approvedByClinic: true, generatedAt: true } },
            payer: { select: { name: true } },
            batch: { select: { fileName: true, createdAt: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const stats = {
        total: claims.length,
        pending: claims.filter(c => c.status === "PENDING_ANALYSIS").length,
        recoverable: claims.filter(c => c.status === "RECOVERABLE").length,
        appealed: claims.filter(c => c.status === "APPEALED").length,
        settled: claims.filter(c => c.status === "SETTLED").length,
        totalBilled: claims.reduce((s, c) => s + (c.billedAmount || 0), 0),
    };

    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        PENDING_ANALYSIS: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", label: "Pending" },
        RECOVERABLE: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", label: "Recoverable" },
        APPEALED: { bg: "rgba(168,85,247,0.1)", text: "#a855f7", label: "Appealed" },
        DENIED: { bg: "rgba(239,68,68,0.1)", text: "#ef4444", label: "Denied" },
        SETTLED: { bg: "rgba(16,185,129,0.1)", text: "#10b981", label: "Settled" },
    };

    return (
        <div style={{ maxWidth: "1000px" }}>
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
                    My <span className="text-gradient">Claims</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    Track the status of all your claims in the recovery pipeline.
                </p>
            </div>

            {/* Stats Bar */}
            <div className="stats-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "0.75rem",
                marginBottom: "1.5rem",
            }}>
                {[
                    { label: "Total Claims", value: stats.total, color: "#fff" },
                    { label: "Pending", value: stats.pending, color: "#f59e0b" },
                    { label: "Recoverable", value: stats.recoverable, color: "#3b82f6" },
                    { label: "Appealed", value: stats.appealed, color: "#a855f7" },
                    { label: "Settled", value: stats.settled, color: "#10b981" },
                ].map(s => (
                    <div key={s.label} style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-lg)",
                        padding: "1rem",
                        textAlign: "center",
                    }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Total Billed */}
            <div style={{
                background: "rgba(59,130,246,0.05)",
                border: "1px solid rgba(59,130,246,0.15)",
                borderRadius: "var(--radius-lg)",
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Total Billed Amount in Pipeline</span>
                <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#3b82f6" }}>
                    ${stats.totalBilled.toLocaleString()}
                </span>
            </div>

            {/* Claims Table */}
            <div className="dash-table-wrap" style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
            }}>
                <div style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid var(--border-subtle)",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                }}>
                    All Claims ({claims.length})
                </div>

                {/* Header */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 120px 100px 120px",
                    padding: "0.625rem 1.25rem",
                    borderBottom: "1px solid var(--border-subtle)",
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    minWidth: "600px",
                }>
                    <span>CPT / Denial</span>
                    <span>Payer</span>
                    <span>Billed</span>
                    <span>Status</span>
                    <span>Date</span>
                </div>

                {claims.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        No claims yet. Your provider will upload claim files to begin recovery.
                    </div>
                ) : (
                    claims.map((claim, i) => {
                        const st = statusConfig[claim.status] || statusConfig.PENDING_ANALYSIS;
                        return (
                            <div key={claim.id} style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 100px 120px 100px 120px",
                                padding: "0.75rem 1.25rem",
                                borderBottom: i < claims.length - 1 ? "1px solid var(--border-subtle)" : "none",
                                alignItems: "center",
                                fontSize: "0.85rem",
                                minWidth: "600px",
                            }}>
                                <div>
                                    <div style={{ fontWeight: "600" }}>{claim.cptCode}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
                                        {claim.denialReason ? claim.denialReason.slice(0, 50) : "—"}
                                    </div>
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                    {claim.payer?.name || "—"}
                                </div>
                                <div style={{ fontWeight: "700" }}>
                                    ${(claim.billedAmount || 0).toLocaleString()}
                                </div>
                                <div>
                                    <span style={{
                                        display: "inline-block",
                                        fontSize: "0.6rem",
                                        fontWeight: "700",
                                        padding: "0.125rem 0.5rem",
                                        borderRadius: "var(--radius-full)",
                                        background: st.bg,
                                        color: st.text,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.03em",
                                    }}>
                                        {st.label}
                                    </span>
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                    {claim.createdAt.toLocaleDateString()}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
