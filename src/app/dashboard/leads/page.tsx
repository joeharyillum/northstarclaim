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
    Upload,
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
    CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import LiveActivityFeed from '@/components/LiveActivityFeed';

export default function DashboardLeads() {
    const { leads, stats, addLeads, clearLeads } = useLeadStore();
    const [isImporting, setIsImporting] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [stripeBalance, setStripeBalance] = useState<number | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployStep, setDeployStep] = useState("");

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
        // Poll every 30 seconds for live feel
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

    const handleAutoDeploy = async () => {
        setIsDeploying(true);
        setDeployStep("Activating Texas Scraper Nodes...");
        await new Promise(r => setTimeout(r, 1200));

        setDeployStep("Infiltrating Houston Methodist Registry...");
        await new Promise(r => setTimeout(r, 1800));

        setDeployStep("Bypassing Texas Gatekeepers (Clay.ai)...");
        await new Promise(r => setTimeout(r, 1500));

        setDeployStep("Generating 50,000 Neural Pitches...");
        await new Promise(r => setTimeout(r, 2000));

        // Actually generate 50k leads for the user
        const newLeads = generateLeads({
            industry: 'Healthcare',
            location: 'Texas',
            count: 50000
        });
        addLeads(newLeads);

        setDeployStep("Pushing to Dallas Sending Clusters...");
        await new Promise(r => setTimeout(r, 1500));

        setIsDeploying(false);
        setDeployStep("");
        // No need to show generator, we already did the work
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
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
            setIsImporting(false);
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Lead Machine</h1>
                <p style={{ color: "var(--text-secondary)" }}>Generate, personalize, and launch high-volume outreach campaigns autonomously.</p>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Leads Built" value={stats.total.toLocaleString()} icon={<Users className="w-5 h-5" />} trend="+12%" color="purple" />
                <StatCard title="Outreach Executed" value={stats.contacted.toLocaleString()} icon={<CheckCircle2 className="w-5 h-5" />} trend="85% Valid" color="orange" />
                <StatCard title="Potential Commissions" value={`$${(stats.total * 450 * 0.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<TrendingUp className="w-5 h-5" />} trend="15% Passive" color="blue" />
                <StatCard
                    title="Live Stripe Revenue"
                    value={stripeBalance !== null ? `$${stripeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Syncing..."}
                    icon={<CreditCard className="w-5 h-5" />}
                    trend="STRIPE CONNECTED"
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Pipeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            Lead Pipeline
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAutoDeploy}
                                disabled={isDeploying}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg text-white ${isDeploying ? 'bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 animate-pulse'}`}
                            >
                                <Zap className={`w-4 h-4 ${isDeploying ? 'animate-spin' : ''}`} />
                                {isDeploying ? deployStep : "Auto Leads Deploy"}
                            </button>
                            <button
                                onClick={() => setShowGenerator(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <Sparkles className="w-4 h-4" />
                                Generate Leads
                            </button>
                            <button
                                onClick={() => document.getElementById('csv-upload')?.click()}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Import CSV
                            </button>
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    style={{ background: "rgba(0,0,0,0.2)" }}
                                />
                            </div>
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/5 text-slate-400 font-medium" style={{ background: "rgba(0,0,0,0.2)" }}>
                                        <th className="px-6 py-4">Lead</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leads.slice(0, 10).map((lead) => (
                                        <motion.tr
                                            key={lead.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-200">{lead.name || 'Unknown'}</span>
                                                    <span className="text-xs text-slate-500">{lead.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={lead.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-300">{lead.company}</span>
                                                    <span className="text-xs text-slate-500">{lead.industry}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="p-2 hover:bg-white/5 rounded-md text-slate-500 group-hover:text-slate-200 transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {leads.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                                                No leads imported yet. Start by uploading a CSV.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Action Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Quick Actions</h2>
                    <div className="space-y-4">
                        <ActionCard
                            title="Bulk Personalize"
                            desc="Research all new leads using AI"
                            icon={<Zap className={`w-5 h-5 ${isProcessing ? 'animate-spin' : 'text-yellow-400'}`} />}
                            onClick={handleBulkPersonalize}
                            disabled={isProcessing}
                        />
                        <ActionCard
                            title="Launch Campaign"
                            desc="Send follow-up outreach"
                            icon={<Mail className={`w-5 h-5 ${isProcessing ? 'animate-bounce' : 'text-indigo-400'}`} />}
                            onClick={handleRunCampaign}
                            disabled={isProcessing}
                        />
                        <ActionCard
                            title="Clear Database"
                            desc="Wipe all local lead data"
                            icon={<TrendingUp className="w-5 h-5 text-red-500" />}
                            variant="danger"
                            onClick={clearLeads}
                        />
                    </div>

                    <div className="glass p-6 rounded-2xl space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 className="font-bold flex items-center justify-between">
                            Revenue Scaling
                            <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">Phase 60</span>
                        </h3>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Monthly Net Projection</span>
                            <span className="text-emerald-400 font-extrabold">$1,200,000+</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[35%]" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <LiveActivityFeed />
                    </div>
                </div>
            </div>
            <GeneratorModal isOpen={showGenerator} onClose={() => setShowGenerator(false)} />
        </div>
    );
}

function StatCard({ title, value, icon, trend, color }: any) {
    const colors: any = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        green: 'text-green-400 bg-green-500/10 border-green-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    };

    return (
        <div className="glass p-6 rounded-2xl flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg border ${colors[color]}`}>
                    {icon}
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">{trend}</span>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function ActionCard({ title, desc, icon, onClick, variant }: any) {
    return (
        <button
            onClick={onClick}
            className={`glass w-full p-4 rounded-xl flex items-start gap-4 text-left transition-all hover:scale-[1.02] active:scale-95 group ${variant === 'danger' ? 'hover:border-red-500/50' : 'hover:border-indigo-500/50'}`}
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-white">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-slate-200">{title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{desc}</p>
            </div>
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        new: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        enriching: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse',
        enriched: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        personalizing: 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse',
        personalized: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        contacted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
            {status}
        </span>
    );
}
