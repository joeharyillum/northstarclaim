"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Zap, Shield, Search, Mail } from 'lucide-react';

interface FeedItem {
    id: string;
    type: 'SCRAPE' | 'ENRICH' | 'PERSONAL' | 'SEND' | 'SUCCESS';
    text: string;
    timestamp: Date;
    color: string;
}

export default function LiveActivityFeed() {
    const [items, setItems] = useState<FeedItem[]>([]);

    const activities = [
        { type: 'SCRAPE', text: 'AI Scraper Node 48 detected new Clinic in FL-09', color: 'text-blue-400' },
        { type: 'ENRICH', text: 'Bypassing gatekeeper at HCA Florida...', color: 'text-yellow-400' },
        { type: 'PERSONAL', text: 'GPT-4o generating pitch for Dr. Miller (Surgery)', color: 'text-purple-400' },
        { type: 'SEND', text: 'Dispatching payload to Instantly.ai node...', color: 'text-indigo-400' },
        { type: 'SUCCESS', text: 'Lead Ingested: Cleveland Clinic Florida (Guardian)', color: 'text-emerald-400' },
        { type: 'SCRAPE', text: 'Scanning Florida Medical Registry for v4.1 leads', color: 'text-blue-400' },
        { type: 'ENRICH', text: 'Clay.com API enrichment: Found CFO personal email', color: 'text-yellow-400' },
        { type: 'PERSONAL', text: 'Analyzing A/R leak pattern for Orlando Health', color: 'text-purple-400' },
        { type: 'SEND', text: 'Sending 50-batch payload to SMTP Cluster 3', color: 'text-indigo-400' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            const newItem: FeedItem = {
                id: Math.random().toString(36),
                ...randomActivity,
                type: randomActivity.type as any,
                timestamp: new Date()
            };

            setItems(prev => [newItem, ...prev].slice(0, 15));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'SCRAPE': return <Search className="w-3 h-3" />;
            case 'ENRICH': return <Shield className="w-3 h-3" />;
            case 'PERSONAL': return <Zap className="w-3 h-3" />;
            case 'SEND': return <Mail className="w-3 h-3" />;
            case 'SUCCESS': return <Activity className="w-3 h-3" />;
            default: return <Terminal className="w-3 h-3" />;
        }
    };

    return (
        <div className="glass rounded-2xl overflow-hidden flex flex-col h-[400px]" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Neural Activity Feed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Live Ops</span>
                </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-[11px]">
                <AnimatePresence initial={false}>
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-start gap-3 border-l-2 border-white/5 pl-3 py-1 hover:border-indigo-500/30 transition-colors"
                        >
                            <span className="text-slate-600 shrink-0">
                                {item.timestamp.toLocaleTimeString([], { hour12: false })}
                            </span>
                            <div className={`shrink-0 mt-0.5 ${item.color}`}>
                                {getIcon(item.type)}
                            </div>
                            <span className="text-slate-400 leading-relaxed">
                                {item.text}
                            </span>
                        </motion.div>
                    ))}
                    {items.length === 0 && (
                        <div className="h-full flex items-center justify-center text-slate-600 italic">
                            Awaiting neural synchronization...
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-3 bg-indigo-500/5 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-tighter">Throughput: 1.2k events / min</span>
                    <span className="text-[9px] text-slate-500">v4.1.0-stable</span>
                </div>
            </div>
        </div>
    );
}
