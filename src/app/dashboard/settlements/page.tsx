"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gavel,
    ShieldAlert,
    Target,
    TrendingUp,
    MessageSquare,
    CheckCircle2,
    Timer,
    ShieldCheck,
    Cpu,
    ArrowUpRight,
    ArrowDownRight,
    Scale,
    AlertCircle
} from 'lucide-react';

interface Negotiation {
    id: string;
    payer: string;
    claimValue: number;
    currentOffer: number;
    targetFloor: number;
    status: 'ACTIVE' | 'CLOSING' | 'SETTLED' | 'ESCALATED';
    agent: string;
    history: { speaker: string, text: string, time: string }[];
}

export default function SettlementWarRoom() {
    const [negotiations, setNegotiations] = useState<Negotiation[]>([
        {
            id: 'WHALE-201',
            payer: 'UnitedHealthcare (TMC)',
            claimValue: 245000,
            currentOffer: 165000,
            targetFloor: 196000,
            status: 'ACTIVE',
            agent: 'Agent 41 (Orchestrator)',
            history: [
                { speaker: 'UHC Adjuster', text: 'We find no medical necessity for the dual spinal stabilization.', time: '12:45' },
                { speaker: 'Agent 41', text: 'Citing NCCI Policy Manual Chapter 4, Section B. This is a primary stabilization requirement. Re-evaluate or we file a State Grievance in 10 minutes.', time: '12:46' },
                { speaker: 'UHC Adjuster', text: 'Hold please. Reviewing NCCI citations...', time: '12:48' }
            ]
        },
        {
            id: 'WHALE-205',
            payer: 'Aetna Global',
            claimValue: 89000,
            currentOffer: 72000,
            targetFloor: 71200,
            status: 'CLOSING',
            agent: 'Agent 38 (Negotiator)',
            history: [
                { speaker: 'Agent 38', text: 'Settlement floor reached. Generating digital signature vault.', time: '12:50' }
            ]
        },
        {
            id: 'WHALE-210',
            payer: 'BlueCross BlueShield TX',
            claimValue: 1250000,
            currentOffer: 310000,
            targetFloor: 937500,
            status: 'ACTIVE',
            agent: 'Agent 41 (Orchestrator)',
            history: [
                { speaker: 'BCBS Adjuster', text: 'This exceeds our quarterly threshold for out-of-network trauma.', time: '12:30' },
                { speaker: 'Agent 41', text: 'The Prompt Pay Act does not recognize "quarterly thresholds" as a valid delay mechanism. Proceed to settlement or prepare for ERISA audit.', time: '12:32' }
            ]
        }
    ]);

    const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lines = [
            "[SYSTEM] Phase 50: Settlement War Room Active",
            "[AGENT 41] Scanning BCBS TX policy updates...",
            "[AGENT 32] Detecting stall tactic from Cigna adjuster (Node 401)",
            "[SYSTEM] State Grievance drafted for Claim #TX-882",
            "[AGENT 41] Pivot initiated. Demand for 85% payout sent to UnitedHealthcare.",
            "[SYSTEM] Settlement Reached: $142,500.00 (Aetna)",
            "[AGENT 38] Executing Payout Vault protocol...",
            "[SYSTEM] Incoming Offer: $12,000.00 (Denied - Below Floor)",
            "[AGENT 41] Warning: Adjuster 'Sarah K' attempting to cite outdated 2021 codes. Correcting..."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < lines.length) {
                setLiveTranscript(prev => [...prev, lines[i]]);
                i++;
            } else {
                i = 0;
                setLiveTranscript(prev => [lines[0]]); // Loop it for "live" feel
            }
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [liveTranscript]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <Gavel className="w-8 h-8 text-[#00f2ff]" />
                        Settlement <span className="text-gradient">War Room</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-sm">Autonomous Neural Negotiation Grid • Web 4.0 Compliant • Real-Time Payer Resolution</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Grid Sync: 99.8%</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg border border-[#00f2ff]/20 bg-[#00f2ff]/5 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-[#00f2ff]" />
                        <span className="text-[10px] font-black text-[#00f2ff] tracking-widest uppercase">HIPAA Compliant</span>
                    </div>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Active Negotiations" value="14" sub="High-Value Targets" icon={<Scale className="w-5 h-5" />} color="blue" />
                <MetricCard title="Settlement Floor" value="82.4%" sub="Capture Rate" icon={<ArrowUpRight className="w-5 h-5" />} color="green" />
                <MetricCard title="Daily Resolved" value="$1.42M" sub="+12% from YTD" icon={<TrendingUp className="w-5 h-5" />} color="purple" />
                <MetricCard title="Neural Aggression" value="MAX" sub="Active Pivot Mode" icon={<Activity className="w-5 h-5" />} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Haggling View */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-400" />
                            Live Strategic Engagements
                        </h2>
                        <span className="text-xs text-slate-500 font-mono">Agent Performance: OPTIMAL</span>
                    </div>

                    <div className="space-y-4">
                        {negotiations.map((neg) => (
                            <motion.div
                                key={neg.id}
                                layoutId={neg.id}
                                className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all p-6 bg-white/[0.02]"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{neg.id}</span>
                                            <h3 className="text-lg font-bold text-white">{neg.payer}</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{neg.agent} • {neg.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-white">${neg.claimValue.toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Claim Value</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-slate-400 flex items-center gap-1">
                                            <ArrowDownRight className="w-3 h-3 text-red-400" />
                                            Offer: ${neg.currentOffer.toLocaleString()}
                                        </span>
                                        <span className="text-emerald-400 flex items-center gap-1">
                                            Floor: ${neg.targetFloor.toLocaleString()}
                                            <ShieldCheck className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(neg.currentOffer / neg.targetFloor) * 100}%` }}
                                            className={`h-full ${neg.status === 'CLOSING' ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-brand-primary'}`}
                                        />
                                    </div>
                                </div>

                                {/* Mini Transcript */}
                                <div className="bg-black/40 rounded-xl p-4 space-y-3 border border-white/5">
                                    {neg.history.map((h, i) => (
                                        <div key={i} className="flex gap-3 text-[11px] leading-relaxed">
                                            <span className={`font-black uppercase shrink-0 ${h.speaker.includes('Agent') ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                [{h.speaker}]
                                            </span>
                                            <span className="text-slate-400">{h.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Override Floor
                                    </button>
                                    <button className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${neg.status === 'CLOSING' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                                        {neg.status === 'CLOSING' ? 'EXECUTING SETTLEMENT...' : 'Pivoting Strategy'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Tactical Side Panel */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Tactical Control</h2>

                    {/* Live Transcript */}
                    <div className="glass rounded-2xl overflow-hidden flex flex-col h-[500px]" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,242,255,0.1)" }}>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/10">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-[#00f2ff]" />
                                <span className="text-xs font-black uppercase tracking-widest text-white">Live Tactical Transceiver</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-[#00f2ff] uppercase">Negotiating</span>
                            </div>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-4 font-mono text-[10px] bg-black/60 scrollbar-hide">
                            <AnimatePresence initial={false}>
                                {liveTranscript.map((line, i) => (
                                    <motion.div
                                        key={i + line}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex gap-2"
                                    >
                                        <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                        <span className={`${line.includes('SYSTEM') ? 'text-[#00f2ff]' : line.includes('AGENT') ? 'text-white' : 'text-slate-400'}`}>
                                            {line}
                                        </span>
                                    </motion.div>
                                ))}
                                <div ref={transcriptEndRef} />
                            </AnimatePresence>
                        </div>

                        <div className="p-4 bg-white/5 border-t border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Settlement Agression</span>
                                <span className="text-[10px] font-black text-[#00f2ff] uppercase">Alpha-Strike</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-primary w-[85%] animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Global Floor Control */}
                    <div className="glass p-6 rounded-2xl space-y-6 border border-[#00f2ff]/20 bg-[#00f2ff]/5">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-[#00f2ff]" />
                            <h3 className="font-bold">Global Floor Lockdown</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Min. Recovery Floor</span>
                                <span className="text-lg font-black text-white">75.0%</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="95"
                                defaultValue="75"
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                <span>Risk: High</span>
                                <span>Profit: Optimized</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            *Setting the floor above 85% automatically triggers Agent 41 to prioritize formal grievances over standard negotiation loops.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, sub, icon, color }: any) {
    const colors: any = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };

    return (
        <div className="glass p-6 rounded-2xl flex flex-col gap-4 bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg border ${colors[color]}`}>
                    {icon}
                </div>
                <div className="flex items-center gap-1">
                    <Timer className="w-3 h-3 text-slate-600" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Real-Time</span>
                </div>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black mt-1 tracking-tighter">{value}</p>
                    <span className="text-[10px] font-bold text-emerald-400">{sub}</span>
                </div>
            </div>
        </div>
    );
}

function Activity({ className }: { className?: string }) {
    return (
        <div className={`${className} flex gap-1 items-end`}>
            <div className="w-1 h-3 bg-current opacity-40 animate-[pulse_1s_infinite_0s]"></div>
            <div className="w-1 h-5 bg-current opacity-60 animate-[pulse_1s_infinite_0.1s]"></div>
            <div className="w-1 h-4 bg-current opacity-100 animate-[pulse_1s_infinite_0.2s]"></div>
        </div>
    );
}
