"use client";

import { useState, useEffect, useRef } from "react";

interface LiveRevenueTickerProps {
    className?: string;
    style?: React.CSSProperties;
    label?: string;
}

export default function LiveRevenueTicker({ style, label }: LiveRevenueTickerProps) {
    const [displayValue, setDisplayValue] = useState<number | null>(null);
    const [targetValue, setTargetValue] = useState<number | null>(null);
    const [breakdown, setBreakdown] = useState<{ stripeBalance: number; paidRevenue: number; pipelineRevenue: number } | null>(null);
    const animRef = useRef<number | null>(null);

    // Fetch real data from Stripe + DB
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/system/stats");
                if (res.ok) {
                    const { data } = await res.json();
                    if (data && data.totalRevenue !== undefined) {
                        setTargetValue(data.totalRevenue);
                        setBreakdown({
                            stripeBalance: data.stripeBalance || 0,
                            paidRevenue: data.paidRevenue || 0,
                            pipelineRevenue: data.pipelineRevenue || 0
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch live revenue", error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Smooth counting animation toward target
    useEffect(() => {
        if (targetValue === null) return;

        const startVal = displayValue ?? 0;
        const diff = targetValue - startVal;
        if (Math.abs(diff) < 0.01) {
            setDisplayValue(targetValue);
            return;
        }

        const duration = 1500; // 1.5s animation
        const startTime = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(startVal + diff * eased);

            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            }
        };

        animRef.current = requestAnimationFrame(animate);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [targetValue]);

    const formatCurrency = (val: number) => {
        return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <div style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: displayValue !== null ? "#10b981" : "#f59e0b",
                    borderRadius: "50%",
                    boxShadow: displayValue !== null ? "0 0 8px rgba(16,185,129,0.4)" : "0 0 8px rgba(245,158,11,0.4)",
                }} />
                <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label || "Total Revenue Tracked"}
                </div>
            </div>
            <div style={{
                fontSize: "2rem",
                fontWeight: "800",
                color: "white",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
            }}>
                {displayValue !== null
                    ? `$${formatCurrency(displayValue)}`
                    : <span style={{ color: "var(--brand-primary)", fontSize: "1rem" }}>Loading...</span>
                }
            </div>

            {breakdown && (
                <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.625rem" }}>
                    <div>
                        <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Stripe Balance
                        </div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "rgba(255,255,255,0.8)" }}>
                            ${formatCurrency(breakdown.stripeBalance)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Recovered
                        </div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "rgba(255,255,255,0.8)" }}>
                            ${formatCurrency(breakdown.paidRevenue)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Pipeline
                        </div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "rgba(255,255,255,0.8)" }}>
                            ${formatCurrency(breakdown.pipelineRevenue)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
