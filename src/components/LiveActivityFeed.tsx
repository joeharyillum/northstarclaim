"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Search, Mail, CheckCircle2, FileText } from 'lucide-react';

interface FeedItem {
    id: string;
    type: string;
    text: string;
    timestamp: Date;
    color: string;
}

export default function LiveActivityFeed() {
    const [items, setItems] = useState<FeedItem[]>([]);

    const activities = [
        { type: 'SCAN', text: 'New claim batch uploaded for analysis', color: '#3b82f6' },
        { type: 'REVIEW', text: 'Appeal draft generated for denied claim', color: '#eab308' },
        { type: 'AI', text: 'CMS guideline match found for CPT 99213', color: '#a855f7' },
        { type: 'SEND', text: 'Appeal submitted to UnitedHealthcare', color: '#6366f1' },
        { type: 'SUCCESS', text: 'Claim recovery approved — $12,450.00', color: '#10b981' },
        { type: 'SCAN', text: 'EOB document parsed successfully', color: '#3b82f6' },
        { type: 'REVIEW', text: 'Modifier pathway identified for billing correction', color: '#eab308' },
        { type: 'AI', text: 'Payer rule analysis complete for Aetna', color: '#a855f7' },
        { type: 'SEND', text: 'Follow-up appeal queued for BCBS TX', color: '#6366f1' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            const newItem: FeedItem = {
                id: Math.random().toString(36),
                ...randomActivity,
                timestamp: new Date()
            };

            setItems(prev => [newItem, ...prev].slice(0, 15));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'SCAN': return <Search size={10} />;
            case 'REVIEW': return <FileText size={10} />;
            case 'AI': return <Activity size={10} />;
            case 'SEND': return <Mail size={10} />;
            case 'SUCCESS': return <CheckCircle2 size={10} />;
            default: return <Activity size={10} />;
        }
    };

    return (
        <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "320px",
        }}>
            <div style={{
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "rgba(255,255,255,0.02)",
            }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>Activity Feed</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: "0.6rem", fontWeight: "600", color: "#10b981" }}>LIVE</span>
                </div>
            </div>

            <div style={{
                flex: 1, overflowY: "auto", padding: "0.625rem 0.75rem",
                display: "flex", flexDirection: "column", gap: "0.375rem",
                fontFamily: "monospace", fontSize: "0.65rem",
            }}>
                {items.map((item) => (
                    <div key={item.id} style={{
                        display: "flex", alignItems: "flex-start", gap: "0.5rem",
                        borderLeft: "2px solid var(--border-subtle)",
                        paddingLeft: "0.5rem", paddingTop: "0.125rem", paddingBottom: "0.125rem",
                        lineHeight: 1.4,
                    }}>
                        <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                            {item.timestamp.toLocaleTimeString([], { hour12: false })}
                        </span>
                        <span style={{ color: item.color, flexShrink: 0, marginTop: "1px" }}>
                            {getIcon(item.type)}
                        </span>
                        <span style={{ color: "var(--text-secondary)" }}>
                            {item.text}
                        </span>
                    </div>
                ))}
                {items.length === 0 && (
                    <div style={{
                        height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--text-muted)", fontStyle: "italic",
                    }}>
                        Waiting for activity...
                    </div>
                )}
            </div>
        </div>
    );
}
