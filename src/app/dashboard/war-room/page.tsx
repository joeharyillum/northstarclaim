"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Zap, Target, Award, Clock, CheckCircle2, AlertCircle, Percent } from 'lucide-react';

export default function WarRoomDashboard() {
  const [data, setData] = useState({
    totalRecovered: 0,
    activeClaims: 0,
    clinicsOnboarded: 0,
    recoveryRate: 0,
    avgExtraction: "—",
    successfulAppeals: 0,
    avgClaimValue: 0,
    pendingClaims: 0,
  });

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/system/stats');
        if (res.ok) {
          const { data: stats } = await res.json();
          if (stats) {
            setData({
              totalRecovered: stats.totalRevenue || stats.paidRevenue || 0,
              activeClaims: stats.activeClaims || 0,
              clinicsOnboarded: stats.clinicsOnboarded || 0,
              recoveryRate: stats.recoveryRate || 0,
              avgExtraction: stats.avgProcessingTime || "45m",
              successfulAppeals: stats.successfulAppeals || 0,
              avgClaimValue: stats.avgClaimValue || 0,
              pendingClaims: stats.pendingClaims || 0,
            });
          }
        }
      } catch (e) {
        console.error('Failed to fetch war room data:', e);
      }
      setLoaded(true);
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      label: "Total Recovered",
      value: `$${(data.totalRecovered / 1000000).toFixed(1)}M`,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.06)",
      border: "rgba(16, 185, 129, 0.15)",
      icon: DollarSign,
    },
    {
      label: "Active Claims",
      value: data.activeClaims.toLocaleString(),
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.06)",
      border: "rgba(59, 130, 246, 0.15)",
      icon: Users,
    },
    {
      label: "Success Rate",
      value: `${data.recoveryRate || 0}%`,
      color: "#a855f7",
      bg: "rgba(168, 85, 247, 0.06)",
      border: "rgba(168, 85, 247, 0.15)",
      icon: Award,
    },
    {
      label: "Clinics Served",
      value: data.clinicsOnboarded.toString(),
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.06)",
      border: "rgba(245, 158, 11, 0.15)",
      icon: Zap,
    },
  ];

  const performanceRows = [
    { label: "Avg Claim Value", value: data.avgClaimValue > 0 ? `$${data.avgClaimValue.toLocaleString()}` : "—", icon: DollarSign, color: "#10b981" },
    { label: "Appeal Success Rate", value: data.recoveryRate > 0 ? `${data.recoveryRate}%` : "—", icon: Percent, color: "#a855f7" },
    { label: "Avg Processing Time", value: data.avgExtraction, icon: Clock, color: "#3b82f6" },
    { label: "Pending Reviews", value: data.pendingClaims.toString(), icon: AlertCircle, color: "#f59e0b" },
  ];

  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
          <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {loaded ? "Live Data" : "Loading..."}
          </span>
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
          War Room <span className="text-gradient">Command Center</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          Real-time recovery monitoring and performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} style={{
              background: m.bg,
              border: `1px solid ${m.border}`,
              borderRadius: "var(--radius-xl)",
              padding: "1.25rem",
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{
                  width: "32px", height: "32px",
                  borderRadius: "var(--radius-md)",
                  background: m.bg,
                  border: `1px solid ${m.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={16} style={{ color: m.color }} />
                </div>
              </div>
              <div style={{ fontSize: "0.7rem", fontWeight: "600", color: m.color, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
                {m.label}
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.02em" }}>
                {m.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Pipeline + Performance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Pipeline */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Target size={16} style={{ color: "#3b82f6" }} /> Claims Pipeline
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {[
              { stage: "New Claims", count: data.activeClaims, color: "#3b82f6" },
              { stage: "Under Review", count: data.pendingClaims, color: "#f59e0b" },
              { stage: "Appealed", count: data.successfulAppeals, color: "#a855f7" },
              { stage: "Recovered", count: Math.round(data.totalRecovered / (data.avgClaimValue || 1)), color: "#10b981" },
            ].map((item) => (
              <div key={item.stage} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.75rem", borderRadius: "var(--radius-md)",
                background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "3px", height: "20px", borderRadius: "2px", background: item.color }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: "500", color: "var(--text-secondary)" }}>{item.stage}</span>
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: "700" }}>{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={16} style={{ color: "#10b981" }} /> Performance Metrics
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {performanceRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem", borderRadius: "var(--radius-md)",
                  background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Icon size={14} style={{ color: row.color }} />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700" }}>{row.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "1.25rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "1rem" }}>System Health</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {[
            { label: "API Uptime", value: "99.98%", pct: 99.98, color: "#10b981" },
            { label: "Database", value: "Optimal", pct: 100, color: "#10b981" },
            { label: "Cache Hit", value: "87.3%", pct: 87.3, color: "#3b82f6" },
            { label: "Agents Active", value: "Active", pct: 100, color: "#a855f7" },
          ].map((item) => (
            <div key={item.label} style={{
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-subtle)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{item.label}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: "600", color: item.color }}>{item.value}</span>
              </div>
              <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                <div style={{
                  width: `${item.pct}%`,
                  height: "100%",
                  borderRadius: "2px",
                  background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
