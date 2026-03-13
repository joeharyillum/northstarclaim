export default function DashboardLoading() {
    return (
        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div style={{ width: "300px", height: "40px", background: "rgba(0,0,0,0.05)", borderRadius: "var(--radius-md)" }} />
                <div style={{ width: "200px", height: "40px", background: "rgba(0,0,0,0.05)", borderRadius: "var(--radius-md)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-panel" style={{ height: "120px", background: "rgba(0,0,0,0.02)" }} />
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
                <div className="glass-panel" style={{ height: "400px", background: "rgba(0,0,0,0.02)" }} />
                <div className="glass-panel" style={{ height: "400px", background: "rgba(0,0,0,0.02)" }} />
            </div>

            <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                Synchronizing with 41-Agent Neural Grid...
            </div>
        </div>
    );
}
