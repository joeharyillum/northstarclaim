export default function DashboardLoading() {
    return (
        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div style={{ width: "260px", height: "32px", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)" }} />
                <div style={{ width: "160px", height: "32px", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: "100px", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-subtle)" }} />
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>
                <div style={{ height: "360px", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-subtle)" }} />
                <div style={{ height: "360px", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-subtle)" }} />
            </div>

            <div style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Loading dashboard data...
            </div>
        </div>
    );
}
