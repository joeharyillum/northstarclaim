import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-session";
import Button from "@/components/Button";

export default async function InvoicesPage() {
    const session = await getOwnerSession();

    // Fetch real invoices from the database
    const invoicesData = await prisma.invoice.findMany({
        where: { claim: { batch: { userId: session.user.id } } },
        orderBy: { createdAt: 'desc' },
        include: { claim: true }
    });

    const totalBalanceDue = invoicesData
        .filter(inv => inv.status !== "PAID")
        .reduce((sum, inv) => sum + inv.amountEarned, 0);

    return (
        <div className="animate-fade-in" style={{ maxWidth: "1000px", margin: "0 auto" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Billing & Invoices</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem", fontSize: "0.875rem" }}>
                        Our 30% success fee is only invoiced <strong>after</strong> the funds have cleared into your bank account.
                    </p>
                </div>
                <div style={{ background: "white", padding: "1rem 2rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(0,0,0,0.1)", textAlign: "right" }}>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Current Balance Due</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--brand-alert)" }}>
                        ${totalBalanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "rgba(0,0,0,0.02)", textAlign: "left" }}>
                            <th style={{ padding: "1.5rem 1rem", borderBottom: "1px solid rgba(0,0,0,0.05)", fontWeight: "600", color: "var(--text-secondary)" }}>Invoice ID</th>
                            <th style={{ padding: "1.5rem 1rem", borderBottom: "1px solid rgba(0,0,0,0.05)", fontWeight: "600", color: "var(--text-secondary)" }}>Date Issued</th>
                            <th style={{ padding: "1.5rem 1rem", borderBottom: "1px solid rgba(0,0,0,0.05)", fontWeight: "600", color: "var(--text-secondary)" }}>Total Recovered</th>
                            <th style={{ padding: "1.5rem 1rem", borderBottom: "1px solid rgba(0,0,0,0.05)", fontWeight: "600", color: "var(--text-secondary)" }}>Amount Due (30%)</th>
                            <th style={{ padding: "1.5rem 1rem", borderBottom: "1px solid rgba(0,0,0,0.05)", fontWeight: "600", color: "var(--text-secondary)" }}>Status</th>
                            <th style={{ padding: "1.5rem 1rem", borderBottom: "1px solid rgba(0,0,0,0.05)", fontWeight: "600", color: "var(--text-secondary)" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoicesData.length > 0 ? invoicesData.map((inv, i) => (
                            <tr key={inv.id} style={{ borderBottom: i !== invoicesData.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                                <td style={{ padding: "1.5rem 1rem", fontWeight: "500" }}>{inv.id.substring(0, 8).toUpperCase()}</td>
                                <td style={{ padding: "1.5rem 1rem", color: "var(--text-secondary)" }}>{inv.createdAt.toLocaleDateString()}</td>
                                <td style={{ padding: "1.5rem 1rem", fontWeight: "600" }}>${(inv.amountEarned / 0.3).toLocaleString()}</td>
                                <td style={{ padding: "1.5rem 1rem", fontWeight: "700" }}>${inv.amountEarned.toLocaleString()}</td>
                                <td style={{ padding: "1.5rem 1rem" }}>
                                    <span style={{
                                        padding: "0.25rem 0.75rem",
                                        borderRadius: "1rem",
                                        fontSize: "0.875rem",
                                        fontWeight: "600",
                                        background: inv.status === "PAID" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                                        color: inv.status === "PAID" ? "var(--brand-accent)" : "var(--brand-alert)"
                                    }}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td style={{ padding: "1.5rem 1rem" }}>
                                    {inv.status !== "PAID" ? (
                                        <Button variant="outline" size="sm">
                                            Pay via Stripe
                                        </Button>
                                    ) : (
                                        <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Receipt Sent</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
                                    No invoices generated yet. Invoices appear once AI recoveries are confirmed.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
