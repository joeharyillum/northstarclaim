"use client";

import { useState, useEffect, useRef } from "react";

interface LiveRevenueTickerProps {
    className?: string;
    style?: React.CSSProperties;
    label?: string;
}

// Demonstration ticker showing projected recovery potential based on industry averages
// $262B lost annually / ~8,300 providers = ~$31.6M avg denied per provider
// At 35% recovery rate = ~$11M recoverable per mid-size provider
const DEMO_BASE = 2_450_000.00;
const DEMO_TIMESTAMP = new Date("2026-06-01T00:00:00Z").getTime();
const DEMO_GROWTH_PER_MS = 12 / 1000; // $12 per second for demo effect

function getDemoValue(): number {
    const elapsed = Math.max(0, Date.now() - DEMO_TIMESTAMP);
    return DEMO_BASE + elapsed * DEMO_GROWTH_PER_MS;
}

export default function LiveRevenueTicker({ style, label }: LiveRevenueTickerProps) {
    const [displayValue, setDisplayValue] = useState<number>(getDemoValue());
    const animRef = useRef<number | null>(null);

    useEffect(() => {
        const tick = () => {
            setDisplayValue(getDemoValue());
            animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
        return () => {
            if (animRef.current) cancelAnimationFrame(tick);
        };
    }, []);

    const formatCurrency = (val: number) => {
        return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <div className="animate-pulse" style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#10b981",
                    borderRadius: "50%",
                    boxShadow: "0 0 8px rgba(16,185,129,0.4)",
                }} />
                <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label || "Projected Recovery Potential"} — Illustration
                </div>
            </div>
            <div style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                color: "white",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                fontVariantNumeric: "tabular-nums",
            }}>
                ${formatCurrency(displayValue)}
            </div>

            <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.625rem", flexWrap: "wrap" }}>
                <div>
                    <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Recoverable Revenue
                    </div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>
                        ${formatCurrency(displayValue * 0.62)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        In Analysis
                    </div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>
                        ${formatCurrency(displayValue * 0.28)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Pending Appeals
                    </div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>
                        ${formatCurrency(displayValue * 0.10)}
                    </div>
                </div>
            </div>
            <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", marginTop: "0.5rem", fontStyle: "italic" }}>
                * For illustration purposes only. Based on industry denial recovery benchmarks. Individual results vary.
            </p>
        </div>
    );
}
