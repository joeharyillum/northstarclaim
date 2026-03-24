"use client";

import { useState, useEffect, useRef } from "react";

interface LiveRevenueTickerProps {
    className?: string;
    style?: React.CSSProperties;
    label?: string;
}

const REVENUE_BASE = 84_673_219.47;
const REVENUE_ANCHOR = new Date("2026-01-01T00:00:00Z").getTime();
const GROWTH_PER_MS = 47 / 1000;

function getLiveValue(): number {
    const elapsed = Math.max(0, Date.now() - REVENUE_ANCHOR);
    return REVENUE_BASE + elapsed * GROWTH_PER_MS;
}

export default function LiveRevenueTicker({ style, label }: LiveRevenueTickerProps) {
    const [displayValue, setDisplayValue] = useState<number>(getLiveValue());
    const animRef = useRef<number | null>(null);

    useEffect(() => {
        const tick = () => {
            setDisplayValue(getLiveValue());
            animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    const formatCurrency = (val: number) => {
        return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div style={{ textAlign: "center", ...style }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div className="animate-pulse" style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#10b981",
                    borderRadius: "50%",
                    boxShadow: "0 0 12px rgba(16,185,129,0.6)",
                }} />
                <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {label || "Recoverable Revenue Identified"} — Live
                </div>
            </div>
            <div style={{
                fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
                fontWeight: "800",
                color: "white",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                fontVariantNumeric: "tabular-nums",
                textShadow: "0 0 40px rgba(56, 189, 248, 0.3)",
            }}>
                $<span style={{ color: "var(--brand-primary)" }}>{formatCurrency(displayValue)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem", flexWrap: "wrap" }}>
                <div>
                    <div style={{ fontSize: "0.6rem", fontWeight: "700", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Ready to Recover
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "rgba(255,255,255,0.9)", fontVariantNumeric: "tabular-nums" }}>
                        ${formatCurrency(displayValue * 0.62)}
                    </div>
                </div>
                <div style={{ width: "1px", background: "rgba(255,255,255,0.1)", alignSelf: "stretch" }} />
                <div>
                    <div style={{ fontSize: "0.6rem", fontWeight: "700", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Under AI Analysis
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "rgba(255,255,255,0.9)", fontVariantNumeric: "tabular-nums" }}>
                        ${formatCurrency(displayValue * 0.28)}
                    </div>
                </div>
                <div style={{ width: "1px", background: "rgba(255,255,255,0.1)", alignSelf: "stretch" }} />
                <div>
                    <div style={{ fontSize: "0.6rem", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Appeals in Progress
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "rgba(255,255,255,0.9)", fontVariantNumeric: "tabular-nums" }}>
                        ${formatCurrency(displayValue * 0.10)}
                    </div>
                </div>
            </div>

        </div>
    );
}
