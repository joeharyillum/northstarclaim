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
        const interval = setInterval(fetchStats, 10000); // Poll every 10s for live feel
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                {/* Visual heartbeat synced with system loaded state */}
                <div style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: displayValue !== null ? "#10b981" : "#f59e0b",
                    borderRadius: "50%",
                    boxShadow: displayValue !== null ? "0 0 10px #10b981, 0 0 20px rgba(16,185,129,0.4)" : "0 0 10px #f59e0b, 0 0 20px rgba(245,158,11,0.4)",
                    animation: displayValue !== null ? "pulseBlinkGreen 1.5s ease-in-out infinite" : "pulseBlinkAmber 1s ease-in-out infinite"
                }} />
                <div style={{ fontSize: "0.8rem", fontWeight: "900", color: "#00f2ff", textTransform: "uppercase", letterSpacing: "3px" }}>
                    {label || "System-Wide Revenue Tracked"}
                </div>
            </div>
            <div style={{
                fontSize: "3.5rem",
                fontWeight: "900",
                color: "white",
                fontFamily: "var(--font-mono), 'Courier New', monospace",
                fontStyle: "italic",
                lineHeight: 1,
                textShadow: "0 4px 15px rgba(0,0,0,0.9)"
            }}>
                {displayValue !== null
                    ? `$${formatCurrency(displayValue)}`
                    : <span style={{ animation: "pulseBlink 1s infinite", color: "#00f2ff" }}>$LOADING LIVE DATA...</span>
                }
            </div>

            {/* Live breakdown sub-indicators */}
            {breakdown && (
                <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem" }}>
                    <div>
                        <div style={{ fontSize: "0.6rem", fontWeight: "900", color: "#10b981", textTransform: "uppercase", letterSpacing: "2px" }}>
                            Stripe Live
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: "800", color: "rgba(255,255,255,0.8)", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                            ${formatCurrency(breakdown.stripeBalance)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.6rem", fontWeight: "900", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "2px" }}>
                            Recovered
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: "800", color: "rgba(255,255,255,0.8)", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                            ${formatCurrency(breakdown.paidRevenue)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.6rem", fontWeight: "900", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "2px" }}>
                            Pipeline
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: "800", color: "rgba(255,255,255,0.8)", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                            ${formatCurrency(breakdown.pipelineRevenue)}
                        </div>
                    </div>
                </div>
            )}

            {/* Neural Heartbeat Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulseBlinkGreen {
                    0% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px #10b981, 0 0 20px rgba(16,185,129,0.4); }
                    50% { opacity: 0.3; transform: scale(1.2); box-shadow: 0 0 20px #10b981, 0 0 40px rgba(16,185,129,0.6); }
                    100% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px #10b981, 0 0 20px rgba(16,185,129,0.4); }
                }
                @keyframes pulseBlinkAmber {
                    0% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px #f59e0b, 0 0 20px rgba(245,158,11,0.4); }
                    50% { opacity: 0.3; transform: scale(1.2); box-shadow: 0 0 20px #f59e0b, 0 0 40px rgba(245,158,11,0.6); }
                    100% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px #f59e0b, 0 0 20px rgba(245,158,11,0.4); }
                }
            ` }} />
        </div>
    );
}
