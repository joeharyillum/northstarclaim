"use client";

import React, { useState, useEffect } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { parseLeads, generateLeadId } from '@/lib/csv-parser';
import { runMassCampaign } from '@/lib/outreach';
import {
    Plus,
    Users,
    Mail,
    TrendingUp,
    Search,
    BarChart3,
    CheckCircle2,
    Filter,
    MoreVertical,
    CreditCard,
    Trash2,
    Upload,
    Send,
    Database,
} from 'lucide-react';

interface DbLead {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    title: string;
    city: string;
    state: string;
    source: string;
    status: string;
    createdAt: string;
}

interface DbStats {
    total: number;
    contacted: number;
    pending: number;
}

export default function DashboardLeads() {
    const { leads, stats, addLeads, clearLeads } = useLeadStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [stripeBalance, setStripeBalance] = useState<number | null>(null);
    const [dbLeads, setDbLeads] = useState<DbLead[]>([]);
    const [dbStats, setDbStats] = useState<DbStats>({ total: 0, contacted: 0, pending: 0 });
    const [pushStatus, setPushStatus] = useState<string | null>(null);

    // Fetch DB leads on mount
    useEffect(() => {
        const fetchDbLeads = async () => {
            try {
                const res = await fetch('/api/leads/ingest');
                if (res.ok) {
                    const data = await res.json();
                    setDbLeads(data.leads || []);
                    setDbStats(data.stats || { total: 0, contacted: 0, pending: 0 });
                }
            } catch {}
        };
        fetchDbLeads();
        const interval = setInterval(fetchDbLeads, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
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

    const handleRunCampaign = async () => {
        setIsProcessing(true);
        await runMassCampaign();
        setIsProcessing(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            const rawLeads = parseLeads(content);

            // Save to DB via API
            try {
                const apiLeads = rawLeads.map(rl => ({
                    email: rl.Email || rl.email,
                    firstName: rl.FirstName || rl.firstName || rl.first_name || rl.First || '',
                    lastName: rl.LastName || rl.lastName || rl.last_name || rl.Last || '',
                    company: rl.CompanyName || rl.Company || rl.company || rl.company_name || '',
                    title: rl.Title || rl.title || '',
                    city: rl.City || rl.city || '',
                    state: rl.State || rl.state || '',
                    source: 'csv',
                }));

                const res = await fetch('/api/leads/ingest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leads: apiLeads }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setPushStatus(`✅ Imported ${data.inserted} leads (${data.skipped} skipped)`);
                    // Refresh DB leads
                    const refreshRes = await fetch('/api/leads/ingest');
                    if (refreshRes.ok) {
                        const refreshData = await refreshRes.json();
                        setDbLeads(refreshData.leads || []);
                        setDbStats(refreshData.stats || { total: 0, contacted: 0, pending: 0 });
                    }
                } else {
                    setPushStatus('❌ Import failed — check auth');
                }
            } catch {
                setPushStatus('❌ Import failed — network error');
            }

            // Also add to local store for immediate display
            const formattedLeads = rawLeads.map(rl => ({
                id: generateLeadId(),
                name: rl.name || rl.full_name || (rl.FirstName || rl.First || '') + ' ' + (rl.LastName || rl.Last || ''),
                email: rl.email || rl.Email,
                company: rl.company || rl.Company || rl.CompanyName,
                industry: rl.industry || rl.Industry || 'Healthcare',
                location: rl.location || rl.Location || ((rl.City || rl.city || '') + ', ' + (rl.State || rl.state || '')),
                metadata: rl,
                status: 'new' as const,
                createdAt: Date.now()
            }));
            addLeads(formattedLeads);
            setIsProcessing(false);
        };
        reader.readAsText(file);
    };

    const handlePushToCampaign = async () => {
        setIsProcessing(true);
        setPushStatus('Pushing leads to Instantly.ai campaign...');
        try {
            const res = await fetch('/api/leads/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 500 }),
            });
            if (res.ok) {
                const data = await res.json();
                setPushStatus(`✅ Pushed ${data.pushed} leads to campaign! (${data.skipped} skipped)`);
                // Refresh
                const refreshRes = await fetch('/api/leads/ingest');
                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    setDbLeads(refreshData.leads || []);
                    setDbStats(refreshData.stats || { total: 0, contacted: 0, pending: 0 });
                }
            } else {
                setPushStatus('❌ Push failed — check Instantly.ai config');
            }
        } catch {
            setPushStatus('❌ Push failed — network error');
        }
        setIsProcessing(false);
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

    const totalLeads = dbStats.total || stats.total;
    const totalContacted = dbStats.contacted || stats.contacted;

    return (
        <div style={{ maxWidth: "1200px", width: "100%", overflowX: "hidden" }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Users size={20} style={{ color: "var(--brand-primary)" }} />
                    Lead <span className="text-gradient">Engine</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    Generate, personalize, and launch outreach campaigns.
                </p>
                {pushStatus && (
                    <p style={{ color: pushStatus.startsWith('✅') ? '#10b981' : pushStatus.startsWith('❌') ? '#ef4444' : '#eab308', fontSize: "0.85rem", fontWeight: "600", marginTop: "0.5rem" }}>
                        {pushStatus}
                    </p>
                )}
            </div>

            {/* Stat Cards */}
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                    { label: "Total Leads", value: totalLeads.toLocaleString(), icon: Users, color: "#a855f7" },
                    { label: "Contacted", value: totalContacted.toLocaleString(), icon: CheckCircle2, color: "#f59e0b" },
                    { label: "Est. Commissions", value: `$${(totalLeads * 450 * 0.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: "#3b82f6" },
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
            <div className="dash-content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
                {/* Pipeline Table */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <BarChart3 size={16} style={{ color: "#6366f1" }} />
                            Lead Pipeline
                        </h2>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
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
                        <div className="dash-table-wrap">
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
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
                                {(dbLeads.length > 0 ? dbLeads.slice(0, 20) : leads.slice(0, 10)).map((lead: any) => {
                                    const isDb = 'firstName' in lead;
                                    const name = isDb ? `${lead.firstName} ${lead.lastName}` : (lead.name || 'Unknown');
                                    const email = lead.email || '';
                                    const company = isDb ? lead.company : (lead.company || '');
                                    const industry = isDb ? (lead.title || lead.industry) : (lead.industry || '');
                                    const status = lead.status || 'new';
                                    const st = statusColors[status] || statusColors.new;
                                    return (
                                        <tr key={lead.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                            <td style={{ padding: "0.625rem 1rem" }}>
                                                <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>{name}</div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{email}</div>
                                            </td>
                                            <td style={{ padding: "0.625rem 1rem" }}>
                                                <span style={{
                                                    fontSize: "0.6rem", fontWeight: "600", padding: "0.125rem 0.5rem",
                                                    borderRadius: "var(--radius-full)", background: st.bg, color: st.text,
                                                    textTransform: "uppercase", letterSpacing: "0.03em",
                                                }}>{status}</span>
                                            </td>
                                            <td style={{ padding: "0.625rem 1rem" }}>
                                                <div style={{ fontSize: "0.85rem" }}>{company}</div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{industry}</div>
                                            </td>
                                            <td style={{ padding: "0.625rem 1rem" }}>
                                                <MoreVertical size={14} style={{ color: "var(--text-muted)", cursor: "pointer" }} />
                                            </td>
                                        </tr>
                                    );
                                })}
                                {leads.length === 0 && dbLeads.length === 0 && (
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
                </div>

                {/* Sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: "600" }}>Quick Actions</h2>

                    {[
                        { label: "Push to Campaign", desc: `Send ${dbStats.pending || 0} leads to Instantly.ai`, icon: Send, color: "#10b981", onClick: handlePushToCampaign },
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

                </div>
            </div>
        </div>
    );
}
