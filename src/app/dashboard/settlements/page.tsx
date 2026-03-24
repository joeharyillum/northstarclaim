"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Gavel,
    ShieldAlert,
    Target,
    TrendingUp,
    CheckCircle2,
    ShieldCheck,
    ArrowUpRight,
    ArrowDownRight,
    Scale,
} from 'lucide-react';

interface Negotiation {
    id: string;
    payer: string;
    claimValue: number;
    currentOffer: number;
    targetFloor: number;
    status: 'ACTIVE' | 'CLOSING' | 'SETTLED' | 'ESCALATED';
    agent: string;
    history: { speaker: string; text: string; time: string }[];
}

export default function SettlementWarRoom() {
    const [negotiations, setNegotiations] = useState<Negotiation[]>([
        {
            id: 'CLM-201',
            payer: 'UnitedHealthcare',
            claimValue: 245000,
            currentOffer: 165000,
            targetFloor: 196000,
            status: 'ACTIVE',
            agent: 'AI Agent',
            history: [
                { speaker: 'UHC Adjuster', text: 'We find no medical necessity for the dual spinal stabilization.', time: '12:45' },
                { speaker: 'AI Agent', text: 'Per NCCI Policy Manual Ch.4 §B, this is a primary stabilization requirement. Please re-evaluate within compliance window.', time: '12:46' },
                { speaker: 'UHC Adjuster', text: 'Hold please. Reviewing citations...', time: '12:48' }
            ]
        },
        {
            id: 'CLM-205',
            payer: 'Aetna',
            claimValue: 89000,
            currentOffer: 72000,
            targetFloor: 71200,
            status: 'CLOSING',
            agent: 'AI Agent',
            history: [
                { speaker: 'AI Agent', text: 'Settlement floor reached. Generating signature for approval.', time: '12:50' }
            ]
        },
        {
            id: 'CLM-210',
            payer: 'BlueCross BlueShield TX',
            claimValue: 1250000,
            currentOffer: 310000,
            targetFloor: 937500,
            status: 'ACTIVE',
            agent: 'AI Agent',
            history: [
                { speaker: 'BCBS Adjuster', text: 'This exceeds our quarterly threshold for out-of-network trauma.', time: '12:30' },
                { speaker: 'AI Agent', text: 'The Prompt Pay Act does not recognize quarterly thresholds as a valid delay mechanism. Proceeding to formal appeal.', time: '12:32' }
            ]
        }
    ]);

    const [liveLog, setLiveLog] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lines = [
            "[SYSTEM] Settlement Engine Active",
            "[AI] Scanning BCBS TX policy updates...",
            "[AI] Detecting stall pattern from Cigna adjuster",
            "[SYSTEM] Appeal drafted for Claim #TX-882",
            "[AI] Demand for 85% payout sent to UnitedHealthcare",
            "[SYSTEM] Settlement Reached: $142,500.00 (Aetna)",
            "[AI] Executing payout workflow...",
            "[SYSTEM] Incoming Offer: $12,000.00 (Below Floor — Rejected)",
        ];

        let i = 0;
        const interval = setInterval(() => {
            setLiveLog(prev => [...prev.slice(-20), lines[i % lines.length]]);
            i++;
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [liveLog]);

    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
        ACTIVE: { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6", label: "Active" },
        CLOSING: { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981", label: "Closing" },
        SETTLED: { bg: "rgba(168, 85, 247, 0.1)", text: "#a855f7", label: "Settled" },
        ESCALATED: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", label: "Escalated" },
    };

    return (
        <div style={{ maxWidth: "1200px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Gavel size={20} style={{ color: "var(--brand-primary)" }} />
                        Settlement <span className="text-gradient">Center</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        Claim negotiation and resolution tracking
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: "0.375rem",
                        padding: "0.25rem 0.625rem",
                        background: "rgba(16, 185, 129, 0.08)",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid rgba(16, 185, 129, 0.15)",
                    }}>
                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }} />
                        <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#10b981", textTransform: "uppercase" }}>Active</span>
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                    { label: "Active Negotiations", value: negotiations.filter(n => n.status === 'ACTIVE').length.toString(), icon: Scale, color: "#3b82f6" },
                    { label: "Settlement Rate", value: "82.4%", icon: ArrowUpRight, color: "#10b981" },
                    { label: "Daily Resolved", value: "$1.42M", icon: TrendingUp, color: "#a855f7" },
                    { label: "Avg Recovery", value: "78%", icon: CheckCircle2, color: "#f59e0b" },
                ].map((m) => {
                    const Icon = m.icon;
                    return (
                        <div key={m.label} style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-xl)",
                            padding: "1.25rem",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <Icon size={14} style={{ color: m.color }} />
                                <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.label}</span>
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.02em" }}>{m.value}</div>
                        </div>
                    );
                })}
            </div>

            {/* Main Grid */}
            <div className="dash-content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>
                {/* Negotiations */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Target size={16} style={{ color: "#6366f1" }} />
                        Active Negotiations
                    </h2>

                    {negotiations.map((neg) => {
                        const pct = Math.min((neg.currentOffer / neg.targetFloor) * 100, 100);
                        const st = statusColors[neg.status] || statusColors.ACTIVE;
                        return (
                            <div key={neg.id} style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-xl)",
                                padding: "1.25rem",
                                transition: "all 0.2s",
                            }}>
                                {/* Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "600" }}>{neg.id}</span>
                                            <span style={{
                                                fontSize: "0.6rem", fontWeight: "600", padding: "0.125rem 0.375rem",
                                                borderRadius: "var(--radius-full)", background: st.bg, color: st.text,
                                            }}>{st.label}</span>
                                        </div>
                                        <div style={{ fontSize: "0.95rem", fontWeight: "600" }}>{neg.payer}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>${neg.claimValue.toLocaleString()}</div>
                                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Claim Value</div>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div style={{ marginBottom: "0.75rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem", fontSize: "0.7rem" }}>
                                        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            <ArrowDownRight size={10} style={{ color: "#ef4444" }} /> Offer: ${neg.currentOffer.toLocaleString()}
                                        </span>
                                        <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            Floor: ${neg.targetFloor.toLocaleString()} <ShieldCheck size={10} />
                                        </span>
                                    </div>
                                    <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                                        <div style={{
                                            width: `${pct}%`,
                                            height: "100%",
                                            borderRadius: "2px",
                                            background: neg.status === 'CLOSING'
                                                ? "#10b981"
                                                : "var(--brand-primary)",
                                            transition: "width 0.5s ease",
                                        }} />
                                    </div>
                                </div>

                                {/* Transcript */}
                                <div style={{
                                    background: "rgba(0,0,0,0.2)",
                                    borderRadius: "var(--radius-md)",
                                    padding: "0.75rem",
                                    border: "1px solid var(--border-subtle)",
                                }}>
                                    {neg.history.map((h, i) => (
                                        <div key={i} style={{
                                            display: "flex",
                                            gap: "0.5rem",
                                            fontSize: "0.75rem",
                                            lineHeight: 1.5,
                                            marginBottom: i < neg.history.length - 1 ? "0.375rem" : 0,
                                        }}>
                                            <span style={{
                                                fontWeight: "700",
                                                color: h.speaker.includes('AI') ? "#6366f1" : "var(--text-muted)",
                                                whiteSpace: "nowrap",
                                                flexShrink: 0,
                                            }}>
                                                [{h.speaker}]
                                            </span>
                                            <span style={{ color: "var(--text-secondary)" }}>{h.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Side Panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Live Log */}
                    <div style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-xl)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        height: "400px",
                    }}>
                        <div style={{
                            padding: "0.75rem 1rem",
                            borderBottom: "1px solid var(--border-subtle)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "rgba(255,255,255,0.02)",
                        }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>System Log</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#3b82f6" }} />
                                <span style={{ fontSize: "0.6rem", fontWeight: "600", color: "#3b82f6" }}>LIVE</span>
                            </div>
                        </div>
                        <div style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "0.75rem",
                            fontFamily: "monospace",
                            fontSize: "0.7rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.375rem",
                            background: "rgba(0,0,0,0.2)",
                        }}>
                            {liveLog.map((line, i) => (
                                <div key={i} style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    lineHeight: 1.4,
                                }}>
                                    <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                                        [{new Date().toLocaleTimeString([], { hour12: false })}]
                                    </span>
                                    <span style={{
                                        color: line.includes('SYSTEM') ? "#6366f1" : "var(--text-secondary)",
                                        wordBreak: "break-word",
                                    }}>
                                        {line}
                                    </span>
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </div>

                    {/* Floor Control */}
                    <div style={{
                        background: "rgba(0, 242, 255, 0.04)",
                        border: "1px solid rgba(0, 242, 255, 0.12)",
                        borderRadius: "var(--radius-xl)",
                        padding: "1.25rem",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                            <ShieldAlert size={16} style={{ color: "var(--brand-primary)" }} />
                            <h3 style={{ fontSize: "0.85rem", fontWeight: "600" }}>Recovery Floor</h3>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Min. Recovery</span>
                            <span style={{ fontSize: "1rem", fontWeight: "700" }}>75.0%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="95"
                            defaultValue="75"
                            style={{
                                width: "100%",
                                height: "4px",
                                borderRadius: "2px",
                                cursor: "pointer",
                                accentColor: "var(--brand-primary)",
                            }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.375rem" }}>
                            <span>Conservative</span>
                            <span>Aggressive</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
