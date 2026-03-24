import CommandCenter from "./CommandCenter";

export const metadata = {
    title: "Global Command Center | MediClaim AI",
    description: "Phase 40: Zero-Human Revenue Clearinghouse",
};

export default function CommandPage() {
    return (
        <div style={{ padding: "1rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>Global Command Center</h1>
                <p style={{ color: "var(--text-secondary)" }}>Phase 40: Continuous Revenue Velocity & Neural Grid Orchestration.</p>
            </div>

            <CommandCenter />

            <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Infinite Scale Protocol</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                        The 41-agent grid is now operating in **Parallel Execution Mode**. Every second, the system identifies thousands of denied claims,
                        drafts legally aggressive appeals, and initiates autonomous voice negotiations without human intervention.
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Revenue Liquidity</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                        Recovery sessions are currently processing at a velocity of **$412.50 per minute**. Your 50/50 revenue split is
                        being routed in real-time to your dashboard vault.
                    </p>
                </div>
            </div>
        </div>
    );
}
