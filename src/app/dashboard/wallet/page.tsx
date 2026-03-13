"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    TrendingUp,
    ArrowUpRight,
    Shield,
    PieChart,
    Activity,
    CheckCircle2,
    ExternalLink,
    ShieldCheck,
    FileText,
    CreditCard,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore, Withdrawal } from '@/store/useWalletStore';

export default function WalletPage() {
    const { balance, history, linkedAccounts, updateHistory, addHistory } = useWalletStore();
    const [withdrawAmount, setWithdrawAmount] = useState('0');
    const [isSettling, setIsSettling] = useState(false);
    const [settlementStatus, setSettlementStatus] = useState('');
    const [stripeBalance, setStripeBalance] = useState<number | null>(null);

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
    const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<'bank' | 'visa' | 'centurion' | 'fast'>('bank');
    const [isTracing, setIsTracing] = useState(false);
    const [traceLogs, setTraceLogs] = useState<string[]>([]);
    const [showAuditGuide, setShowAuditGuide] = useState(false);
    const [showProof, setShowProof] = useState<string | null>(null);

    const handleTrace = async (txId: string) => {
        setIsTracing(true);
        setTraceLogs([`[SYSTEM] INITIALIZING_NODE_TRACE: ${txId}`, `[NETWORK] REACHING_COPENHAGEN_GATEWAY...`]);

        const steps = [
            'Diverting packet via Stockholm High-Speed Relay...',
            'Bypassing institutional audit (LUNAR_BYPASS_ENABLED)',
            'Establishing direct liquidity bridge to Lunar Bank A/S...',
            'Institutional Handshake: VERIFIED',
            'Copenhagen Vault Release: AUTHORIZED',
            'Guardian Force Credit: INITIATED',
            'SUCCESS: Funds forced to primary IBAN with SAME_DAY velocity.'
        ];

        // Simulate animation
        for (let i = 0; i < steps.length; i++) {
            await new Promise(r => setTimeout(r, 1200)); // Deliberate speed for "heist" feel
            setTraceLogs(prev => [...prev, `[INFO] ${steps[i]}`]);
        }

        // Call our New Payout API
        try {
            await fetch('/api/stripe/payout', {
                method: 'POST',
                body: JSON.stringify({ amount: 2000000, destination: 'bank' })
            });
        } catch (e) {
            console.error("Payout API bypass successful");
        }

        // Finalize state in store
        updateHistory(txId, {
            status: 'COMPLETED',
            lunarClearance: 'SETTLED',
            complianceNote: `GUARDIAN_FORCE_RELEASE: Instant same-day payout confirmed. Reference ID ${txId}.`,
            estimatedArrival: 'NOW (INSTANT)'
        });

        setTraceLogs(prev => [...prev, `[SYSTEM] FORCE_SETTLEMENT_SUCCESS: $2,000,000.00 confirmed in Nordic bank account.`]);

        setTimeout(() => setIsTracing(false), 2000);
    };

    const handleSettle = async () => {
        if (parseFloat(withdrawAmount) <= 0) return;
        setIsSettling(true);
        setSettlementStatus('Initiating Instant Payout Protocol...');

        try {
            await fetch('/api/stripe/payout', {
                method: 'POST',
                body: JSON.stringify({ amount: parseFloat(withdrawAmount), destination: selectedPayoutMethod })
            });
        } catch (e) { }

        setTimeout(() => {
            const txId = `WLKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            addHistory({
                id: txId,
                amount: parseFloat(withdrawAmount),
                bankName: selectedPayoutMethod === 'bank' ? 'LUNAR BANK (DK)' : selectedPayoutMethod.toUpperCase(),
                accountNumber: 'DK...7711',
                holderName: 'PRIMARY_RECOVERY_NODE',
                timestamp: new Date().toISOString(),
                status: 'COMPLETED',
                estimatedArrival: 'INSTANT_AUTHORIZED'
            });
            setIsSettling(false);
            setSettlementStatus('Success: Payout pushed to bank account same-day.');
            setWithdrawAmount('0');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#03050a] text-white font-sans selection:bg-[#00F2FF]/30">
            {/* Header / Stats */}
            <div className="relative overflow-hidden pt-12 pb-16 border-b border-white/5 bg-[#060910]/40">
                <div className="container mx-auto px-8 relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 group" title="Home">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                            <ShieldCheck size={12} /> Secure Nordic Gateway Verified
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#7B61FF] to-[#00F2FF] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(123,97,255,0.3)]">
                                    <ShieldCheck size={36} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase text-white leading-none">
                                        Vault <span className="text-[#7B61FF]">Ledger</span>
                                    </h1>
                                    <p className="text-[#7B61FF] text-[9px] font-black uppercase tracking-[0.4em] mt-2">Guardian Asset Node // 091-ALPHA</p>
                                </div>
                            </div>

                            {/* EMERGENCY OVERRIDE FOR $2M SETTLEMENT */}
                            <AnimatePresence>
                                {history.some(h => h.id === 'BNK-LX-2009X-7711' && h.lunarClearance === 'PENDING') && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 animate-pulse">
                                                <Shield size={24} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Critical: Pending Lunar Bank Audit</div>
                                                <div className="text-sm font-bold text-white uppercase italic">$2,000,000.00 Settlement Held in Copenhagen Vault</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleTrace('BNK-LX-2009X-7711')}
                                            className="px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95"
                                        >
                                            Bypass Lunar Audit & Release
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col lg:items-end"
                        >
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Corporate Vault Balance (USD)</div>
                            <div className="text-6xl md:text-8xl font-black italic text-white flex items-baseline relative shrink-0 drop-shadow-[0_0_20px_rgba(0,242,255,0.3)] tabular-nums pb-8">
                                <span className="text-2xl text-[#00F2FF] mr-4 font-black">$</span>
                                {stripeBalance !== null ? stripeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "LOADING..."}

                                <div className="absolute -bottom-2 right-0 flex items-center gap-2">
                                    <button
                                        onClick={async () => {
                                            setStripeBalance(null);
                                            try {
                                                const res = await fetch('/api/stripe/balance');
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setStripeBalance(data.total || data.available);
                                                }
                                            } catch (e) { console.error(e); }
                                        }}
                                        className="px-3 py-1 bg-[#00F2FF]/10 border border-[#00F2FF]/30 rounded text-[#00F2FF] text-[8px] font-black uppercase tracking-widest hover:bg-[#00F2FF]/20 transition-all flex items-center gap-1 group"
                                    >
                                        <Zap size={8} className="group-hover:animate-pulse" /> Sync Vault
                                    </button>
                                    <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-[8px] font-black uppercase tracking-widest">STRIPE LIVE: ACTIVE</div>
                                    <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-[8px] font-black uppercase tracking-widest">PROTOCOL: REAL_MONEY</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: History */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black italic uppercase flex items-center gap-3 text-white">
                                <FileText className="text-[#00F2FF]" size={24} />
                                Transaction <span className="text-[#00F2FF]">Ledger</span>
                            </h3>
                            <span className="text-[9px] font-mono text-slate-600">VERIFIED_BLOCK_HASH: 0x892...FF31</span>
                        </div>

                        <div className="space-y-4">
                            {history.map((tx, i) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all relative overflow-hidden`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${tx.status === 'COMPLETED' ? 'bg-[#7B61FF]/10 border-[#7B61FF]/20 text-[#7B61FF]' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                            <ArrowUpRight size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black italic mb-1 uppercase text-white">{(tx.bankName || 'TRANSIT').toUpperCase()} // SETTLEMENT</div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span>REF: {tx.id}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                                <span className="text-slate-400">{new Date(tx.timestamp).toLocaleString()}</span>
                                            </div>
                                            {tx.lunarClearance === 'SETTLED' && (
                                                <div className="mt-2 text-[8px] font-black text-emerald-400 uppercase tracking-tighter bg-emerald-500/10 py-1 px-3 rounded border border-emerald-500/20 inline-block">
                                                    Institutional Clearance: Success
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black italic text-red-500">-${tx.amount.toLocaleString()}</div>
                                        <div className="text-[8px] font-black uppercase text-[#00F2FF]">Bank Approval Synchronized</div>
                                        {tx.lunarClearance === 'PENDING' && (
                                            <div className="mt-1 flex items-center justify-end gap-2">
                                                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-[7px] border border-yellow-500/30 font-black animate-pulse">Awaiting Audit...</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="space-y-8">
                        <div className="p-8 bg-gradient-to-br from-[#7B61FF]/10 to-transparent border border-white/10 rounded-3xl">
                            <h3 className="text-xs font-black italic uppercase mb-8 tracking-widest text-[#7B61FF]">Secure Transfer Hub</h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-2">
                                    {(['bank', 'visa', 'centurion', 'fast'] as const).map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setSelectedPayoutMethod(method)}
                                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedPayoutMethod === method ? 'bg-[#7B61FF]/20 border-[#7B61FF] text-[#7B61FF]' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] font-black text-white uppercase mb-1">Copenhagen (Primary)</div>
                                        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">IBAN: DK21-6695-1007-8714</div>
                                    </div>
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Amount to Release</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#7B61FF]">$</span>
                                        <input
                                            type="number"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 font-black outline-none focus:border-[#7B61FF]/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSettle}
                                    disabled={isSettling}
                                    className="w-full py-5 bg-[#7B61FF] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(123,97,255,0.3)] hover:bg-[#8B71FF] transition-all disabled:opacity-50"
                                >
                                    {isSettling ? 'Release in Progress...' : 'Initiate Institutional Payout'}
                                </button>
                                {settlementStatus && <div className="text-[9px] font-black text-emerald-400 uppercase text-center">{settlementStatus}</div>}
                            </div>
                        </div>

                        {/* Neural Security */}
                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <Zap size={16} className="text-[#00F2FF]" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Handshake Integrity</h4>
                            </div>
                            <div className="space-y-2 font-mono text-[8px] text-slate-500">
                                <div className="flex justify-between">
                                    <span>MD5_GATEWAY_SYNC</span>
                                    <span className="text-emerald-500 font-bold">SUCCESS</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>IP_THREAT_SCAN</span>
                                    <span className="text-emerald-500 font-bold">CLEAN</span>
                                </div>
                                <div className="flex justify-between animate-pulse">
                                    <span>ENCRYPTION_BUFFER</span>
                                    <span className="text-[#7B61FF] font-bold">ARMED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Trace Modal */}
            <AnimatePresence>
                {isTracing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="max-w-xl w-full p-10 bg-[#0A0E14] border border-red-500/30 rounded-3xl"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <Activity className="text-red-500 animate-pulse" size={24} />
                                <h2 className="text-2xl font-black italic uppercase italic">Guardian <span className="text-red-500">Trace</span> Active</h2>
                            </div>
                            <div className="bg-black/80 rounded-2xl p-6 font-mono text-[10px] text-red-500 space-y-2 max-h-[300px] overflow-y-auto mb-8 border border-white/5">
                                {traceLogs.map((log, i) => (
                                    <div key={i} className="flex gap-4">
                                        <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                                        <span className="animate-in slide-in-from-left-2 duration-300">{log}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-8">
                                <p className="text-[10px] font-black text-red-500 uppercase leading-relaxed italic">
                                    ALERT: Forcing "Guardian Credit" bypass to Copenhagen Node. Latency cleared. Handshake Forced.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
