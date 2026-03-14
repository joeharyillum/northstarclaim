"use client";

import React, { useState } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { parseLeads, generateLeadId } from '@/lib/csv-parser';
import { generateLeads } from '@/lib/lead-generator';
import GeneratorModal from '@/components/GeneratorModal';
import { bulkPersonalize } from '@/lib/personalization';
import { runMassCampaign } from '@/lib/outreach';
import {
    Plus,
    Zap,
    Users,
    Mail,
    TrendingUp,
    Search,
    BarChart3,
    CheckCircle2,
    Filter,
    MoreVertical,
    Sparkles,
    CreditCard,
    Trash2,
} from 'lucide-react';
import LiveActivityFeed from '@/components/LiveActivityFeed';

export default function DashboardLeads() {
    const { leads, stats, addLeads, clearLeads } = useLeadStore();
    const [showGenerator, setShowGenerator] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [stripeBalance, setStripeBalance] = useState<number | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    React.useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await fetch('/api/stripe/balance');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.total !== undefined) {
                        setStripeBalance(data.total);
                    }
                }
            } catch (error) {
                console.error('Failed to load Stripe balance:', error);
            }
        };
        fetchBalance();
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleBulkPersonalize = async () => {
        setIsProcessing(true);
        await bulkPersonalize();
        setIsProcessing(false);
    };

    const handleRunCampaign = async () => {
        setIsProcessing(true);
        await runMassCampaign();
        setIsProcessing(false);
    };

    const handleQuickGenerate = async () => {
        setIsGenerating(true);
        const newLeads = generateLeads({
            industry: 'Healthcare',
            location: 'Texas',
            count: 500
        });
        addLeads(newLeads);
        setIsGenerating(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const rawLeads = parseLeads(content);

            const formattedLeads = rawLeads.map(rl => ({
                id: generateLeadId(),
                name: rl.name || rl.full_name || rl.First + ' ' + rl.Last,
                email: rl.email || rl.Email,
                company: rl.company || rl.Company,
                industry: rl.industry || rl.Industry,
                location: rl.location || rl.Location,
                metadata: rl,
                status: 'new' as const,
                createdAt: Date.now()
            }));

            addLeads(formattedLeads);
        };
        reader.readAsText(file);
    };

    const statusColors: Record<string, { bg: string; text: string }> = {
        new: { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" },
        enriching: { bg: "rgba(234,179,8,0.1)", text: "#eab308" },
        enriched: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
        personalizing: { bg: "rgba(168,85,247,0.1)", text: "#a855f7" },
        personalized: { bg: "rgba(99,102,241,0.1)", text: "#6366f1" },
        contacted: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
        failed: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
    };

    return (
        <div style={{ maxWidth: "1200px" }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Users size={20} style={{ color: "var(--brand-primary)" }} />
                    Lead <span className="text-gradient">Engine</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    Generate, personalize, and launch outreach campaigns.
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                    { label: "Total Leads", value: stats.total.toLocaleString(), icon: Users, color: "#a855f7" },
                    { label: "Contacted", value: stats.contacted.toLocaleString(), icon: CheckCircle2, color: "#f59e0b" },
                    { label: "Est. Commissions", value: `$${(stats.total * 450 * 0.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: "#3b82f6" },
                    { label: "Stripe Revenue", value: stripeBalance !== null ? `$${stripeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Syncing...", icon: CreditCard, color: "#10b981" },
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
                {/* Pipeline Table */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <BarChart3 size={16} style={{ color: "#6366f1" }} />
                            Lead Pipeline
                        </h2>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                                onClick={handleQuickGenerate}
                                disabled={isGenerating}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.375rem",
                                    padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)",
                                    background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)",
                                    color: "#10b981", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer",
                                }}
                            >
                                <Zap size={12} /> {isGenerating ? "Generating..." : "Quick Generate"}
                            </button>
                            <button
                                onClick={() => setShowGenerator(true)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.375rem",
                                    padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)",
                                    background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))",
                                    border: "1px solid rgba(99,102,241,0.2)",
                                    color: "#818cf8", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer",
                                }}
                            >
                                <Sparkles size={12} /> Generate Leads
                            </button>
                            <button
                                onClick={() => document.getElementById('csv-upload')?.click()}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.375rem",
                                    padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)",
                                    background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)",
                                    color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer",
                                }}
                            >
                                <Plus size={12} /> Import CSV
                            </button>
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                style={{ display: "none" }}
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>

                    <div style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-xl)",
                        overflow: "hidden",
                    }}>
                        {/* Search Bar */}
                        <div style={{
                            padding: "0.75rem 1rem",
                            borderBottom: "1px solid var(--border-subtle)",
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            background: "rgba(255,255,255,0.02)",
                        }}>
                            <Search size={14} style={{ color: "var(--text-muted)" }} />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                style={{
                                    flex: 1, background: "transparent", border: "none", outline: "none",
                                    fontSize: "0.8rem", color: "var(--text-primary)",
                                }}
                            />
                            <Filter size={14} style={{ color: "var(--text-muted)", cursor: "pointer" }} />
                        </div>

                        {/* Table */}
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(0,0,0,0.15)" }}>
                                    {["Lead", "Status", "Company", ""].map(h => (
                                        <th key={h} style={{
                                            padding: "0.625rem 1rem", textAlign: "left",
                                            fontSize: "0.65rem", fontWeight: "600", color: "var(--text-muted)",
                                            textTransform: "uppercase", letterSpacing: "0.04em",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leads.slice(0, 10).map((lead) => {
                                    const st = statusColors[lead.status] || statusColors.new;
                                    return (
                                        <tr key={lead.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                            <td style={{ padding: "0.625rem 1rem" }}>
                                                <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>{lead.name || 'Unknown'}</div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{lead.email}</div>
                                            </td>
                                            <td style={{ padding: "0.625rem 1rem" }}>
                                                <span style={{
                                                    fontSize: "0.6rem", fontWeight: "600", padding: "0.125rem 0.5rem",
                                                    borderRadius: "var(--radius-full)", background: st.bg, color: st.text,
                                                    textTransform: "uppercase", letterSpacing: "0.03em",
                                                }}>{lead.status}</span>
                                            </td>
                                            <td style={{ padding: "0.625rem 1rem" }}>
                                                <div style={{ fontSize: "0.85rem" }}>{lead.company}</div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{lead.industry}</div>
                                            </td>
                                            <td style={{ padding: "0.625rem 1rem" }}>
                                                <MoreVertical size={14} style={{ color: "var(--text-muted)", cursor: "pointer" }} />
                                            </td>
                                        </tr>
                                    );
                                })}
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                            No leads yet. Import a CSV or generate leads to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: "600" }}>Quick Actions</h2>

                    {[
                        { label: "Bulk Personalize", desc: "AI-research all new leads", icon: Zap, color: "#eab308", onClick: handleBulkPersonalize },
                        { label: "Launch Campaign", desc: "Send follow-up outreach", icon: Mail, color: "#6366f1", onClick: handleRunCampaign },
                        { label: "Clear Leads", desc: "Remove all local data", icon: Trash2, color: "#ef4444", onClick: clearLeads },
                    ].map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.label}
                                onClick={action.onClick}
                                disabled={isProcessing}
                                style={{
                                    width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                                    padding: "0.875rem 1rem", borderRadius: "var(--radius-xl)",
                                    background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                                    cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                                }}
                            >
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "var(--radius-md)",
                                    background: `${action.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <Icon size={16} style={{ color: action.color }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>{action.label}</div>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{action.desc}</div>
                                </div>
                            </button>
                        );
                    })}

                    {/* Revenue Card */}
                    <div style={{
                        background: "rgba(0, 242, 255, 0.04)",
                        border: "1px solid rgba(0, 242, 255, 0.12)",
                        borderRadius: "var(--radius-xl)",
                        padding: "1.25rem",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Revenue Projection</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Monthly Target</span>
                            <span style={{ fontSize: "1rem", fontWeight: "700", color: "#10b981" }}>$1,200,000+</span>
                        </div>
                        <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                            <div style={{ width: "35%", height: "100%", borderRadius: "2px", background: "#10b981" }} />
                        </div>
                    </div>

                    <LiveActivityFeed />
                </div>
            </div>
            <GeneratorModal isOpen={showGenerator} onClose={() => setShowGenerator(false)} />
        </div>
    );
}
