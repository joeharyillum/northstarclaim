"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/Button";

interface BattleLog {
    id: string;
    agent: number;
    clinic: string;
    value: number;
    status: string;
    action: string;
}

export default function CommandCenter() {
    const [revenue, setRevenue] = useState(112450.00);
    const [activeAgents, setActiveAgents] = useState(41);
    const [claimsInFlight, setClaimsInFlight] = useState(128);
    const [logs, setLogs] = useState<BattleLog[]>([]);
    const [gridStatus, setGridStatus] = useState<number[]>(Array(41).fill(100));

    // Simulate High-Velocity Scale
    useEffect(() => {
        const interval = setInterval(() => {
            // Random Revenue Increment
            const increment = Math.random() * 50;
            setRevenue(prev => prev + increment);

            // Random Battle Log
            const clinics = ["Mayo Clinic", "Cleveland Clinic", "Johns Hopkins", "Mt. Sinai", "Cedars-Sinai"];
            const actions = ["DISPUTING_MODIFIER", "CITING_ERISA", "CALCULATING_CONSENSUS", "BINDING_SETTLEMENT"];

            const newLog: BattleLog = {
                id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                agent: Math.floor(Math.random() * 41) + 1,
                clinic: clinics[Math.floor(Math.random() * clinics.length)],
                value: Math.floor(Math.random() * 50000) + 1000,
                status: "ATTACKING",
                action: actions[Math.floor(Math.random() * actions.length)]
            };

            setLogs(prev => [newLog, ...prev].slice(0, 10));

            // Random Grid Flutter
            setGridStatus(prev => prev.map(s => Math.min(100, Math.max(85, s + (Math.random() * 10 - 5)))));

            // Random Scale Shift
            setClaimsInFlight(prev => Math.max(50, Math.min(500, prev + Math.floor(Math.random() * 11 - 5))));
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="animate-fade-in" style={{ background: "#050a0f", color: "#00f2ff", padding: "2rem", minHeight: "800px", borderRadius: "1rem", border: "2px solid #004c54", fontFamily: "'Courier New', Courier, monospace" }}>

            {/* HUD HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid #004c54", paddingBottom: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "2px" }}>Neural Grid Command Center</h1>
                    <p style={{ fontSize: "0.8rem", color: "#008a94" }}>COORDINATOR: AGENT 41 | STATUS: WORLD_DOMINATION_MODE</p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "2rem", fontWeight: "700" }}>${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: "0.7rem", color: "#00ff8c", fontWeight: "900" }}>REVENUE_VELOCITY: +$412.50/min</div>
                </div>
            </div>

            {/* MAIN HUD GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>

                {/* NEURAL GRID VISUALIZER */}
                <div style={{ background: "rgba(0, 242, 255, 0.05)", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #004c54" }}>
                    <h3 style={{ fontSize: "0.9rem", marginBottom: "1.5rem", borderLeft: "4px solid #00ff8c", paddingLeft: "0.5rem" }}>41-AGENT CONSENSUS GRID</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "0.5rem" }}>
                        {gridStatus.map((s, i) => (
                            <div key={i} style={{
                                height: "40px",
                                background: s > 95 ? "rgba(0, 255, 140, 0.2)" : "rgba(255, 187, 0, 0.2)",
                                border: `1px solid ${s > 95 ? "#00ff8c" : "#ffbb00"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.6rem",
                                fontWeight: "900",
                                color: s > 95 ? "#00ff8c" : "#ffbb00"
                            }}>
                                A-{i + 1}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "0.3rem" }}>
                            <div style={{ fontSize: "0.7rem", color: "#008a94" }}>ACTIVE_THREADS</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>{activeAgents}</div>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "0.3rem" }}>
                            <div style={{ fontSize: "0.7rem", color: "#008a94" }}>CLAIMS_IN_FLIGHT</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>{claimsInFlight}</div>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "0.3rem" }}>
                            <div style={{ fontSize: "0.7rem", color: "#008a94" }}>SYSTEM_INTEGRITY</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#00ff8c" }}>99.2%</div>
                        </div>
                    </div>
                </div>

                {/* LIVE ATTACK LOG */}
                <div style={{ background: "rgba(0,0,0,0.5)", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #004c54", maxHeight: "500px", overflowY: "hidden" }}>
                    <h3 style={{ fontSize: "0.9rem", marginBottom: "1rem", color: "#ffbb00" }}>[!] LIVE_BATTLE_FEED</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {logs.map((log, i) => (
                            <div key={log.id} style={{ fontSize: "0.65rem", padding: "0.5rem", borderBottom: "1px solid rgba(0, 76, 84, 0.5)", opacity: i === 0 ? 1 : 0.6 }}>
                                <span style={{ color: "#00ff8c" }}>[{log.id}]</span> AGENT_{log.agent} targeting {log.clinic} <br />
                                VALUE: ${log.value.toLocaleString()} | <span style={{ color: "#ffbb00" }}>{log.action}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ACTION FOOTER */}
            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                <Button style={{ background: "#ff3e3e", color: "white", border: "none", flex: 1, fontWeight: "900" }}>SCORCHED_EARTH_SETTLEMENT_PROTOCOL</Button>
                <Button variant="outline" style={{ flex: 1, borderColor: "#00f2ff", color: "#00f2ff" }}>INITIATE_GLOBAL_RECOVERY_SCAN</Button>
            </div>

            <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.6rem", color: "#004c54", letterSpacing: "5px" }}>
                PHASE_40_ACTIVE_100M_VISION_ENGAGED
            </div>
        </div>
    );
}
