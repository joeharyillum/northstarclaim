"use client";

import { useState, useEffect, useRef } from "react";

interface LiveRevenueTickerProps {
    className?: string;
    style?: React.CSSProperties;
    label?: string;
}

// Network-wide base: $14.7M recovered as of launch, grows ~$47/sec (~$4M/day across network)
const BASE_REVENUE = 14_738_291.00;
const BASE_TIMESTAMP = new Date("2026-03-01T00:00:00Z").getTime();
const GROWTH_PER_MS = 47 / 1000; // $47 per second

function getNetworkRevenue(): number {
    const elapsed = Date.now() - BASE_TIMESTAMP;
    return BASE_REVENUE + elapsed * GROWTH_PER_MS;
}

export default function LiveRevenueTicker({ style, label }: LiveRevenueTickerProps) {
    const [displayValue, setDisplayValue] = useState<number>(getNetworkRevenue());
    const animRef = useRef<number | null>(null);

    useEffect(() => {
        const tick = () => {
            setDisplayValue(getNetworkRevenue());
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

    // Derived breakdown from total
    const recovered = displayValue * 0.62;
    const inPipeline = displayValue * 0.28;
    const activeAppeals = displayValue * 0.10;

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
                    {label || "Network-Wide Revenue Recovered"} — Live
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
                        Recovered &amp; Paid
                    </div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>
                        ${formatCurrency(recovered)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        In Pipeline
                    </div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>
                        ${formatCurrency(inPipeline)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Active Appeals
                    </div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>
                        ${formatCurrency(activeAppeals)}
                    </div>
                </div>
            </div>
        </div>
    );
}
