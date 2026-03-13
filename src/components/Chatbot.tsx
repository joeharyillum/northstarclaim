"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

function getMessageText(m: { parts?: Array<{ type: string; text?: string }> }): string {
    if (!m.parts) return '';
    return m.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && typeof p.text === 'string')
        .map(p => p.text)
        .join('');
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
        messages: [
            {
                id: "welcome",
                role: "assistant",
                content: "",
                parts: [{ type: 'text' as const, text: "Hi! Did you know clinics lose out on $260 Billion in unclaimed money every year? I'm Dr. Sarah — how can I help you recover yours today?" }],
            }
        ]
    });

    const isLoading = status === 'streaming' || status === 'submitted';

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!isOpen) {
        return (
            <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }} className="animate-fade-in">
                {/* Attention Bubble pointing at the nurse */}
                <div
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: "#0f172a", padding: "0.75rem 1.25rem", borderRadius: "var(--radius-lg)",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(255,255,255,0.1)", position: "relative",
                        animation: "bounce 2s infinite", cursor: "pointer", marginRight: "0.5rem"
                    }}
                >
                    <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ display: "inline-block", width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", animation: "pulse-glow 2s infinite", boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }} />
                        Live Chat with <span style={{ color: "var(--brand-accent)" }}>Dr. Sarah</span>
                    </p>
                    {/* Triangle pointer */}
                    <div style={{
                        position: "absolute", bottom: "-6px", right: "2rem", width: "12px", height: "12px",
                        background: "#0f172a", transform: "rotate(45deg)", borderRight: "1px solid rgba(255,255,255,0.1)",
                        borderBottom: "1px solid rgba(255,255,255,0.1)"
                    }} />
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        height: "6rem", width: "6rem", borderRadius: "9999px",
                        boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.4), 0 8px 10px -6px rgba(37, 99, 235, 0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", border: "4px solid var(--brand-primary)", overflow: "hidden",
                        padding: 0, transition: "transform 0.2s ease", position: "relative",
                        outline: "none", background: "var(--bg-dark)"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    aria-label="Open AI Assistant"
                >
                    <img
                        src="/dr_sarah_vintage.png"
                        alt="Dr. Sarah"
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transform: "scale(1.15)" }}
                    />
                    {/* Status Dot */}
                    <div style={{ position: "absolute", top: "4px", right: "8px", width: "14px", height: "14px", background: "#10b981", borderRadius: "50%", border: "2px solid var(--bg-dark)", boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)", animation: "pulse-glow 2s infinite" }} />
                </button>
            </div>
        );
    }

    return (
        <div style={{
            position: "fixed", bottom: "1.5rem", right: "1.5rem", width: "400px", height: "700px",
            display: "flex", flexDirection: "column", borderRadius: "var(--radius-xl)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", zIndex: 999, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)"
        }} className="animate-fade-in">
            {/* Live 3D Header */}
            <div style={{ position: "relative", height: "220px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.25rem", overflow: "hidden" }}>
                <img
                    src="/dr_sarah_vintage.png"
                    alt="Dr. Sarah"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center top",
                        zIndex: 0,
                        transform: "scale(1.05)",
                        filter: "brightness(0.9)"
                    }}
                />
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 60%, rgba(15,23,42,1) 100%)", zIndex: 1 }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(16, 185, 129, 0.2)", padding: "0.35rem 0.75rem", borderRadius: "var(--radius-full)", backdropFilter: "blur(8px)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                        <div style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", animation: "pulse-glow 2s infinite" }} />
                        <span style={{ color: "white", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>LIVE 3D NURSE</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} style={{ fontSize: "1.5rem", cursor: "pointer", background: "rgba(255,255,255,0.1)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(4px)", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                        &times;
                    </button>
                </div>

                <div style={{ position: "relative", zIndex: 2, color: "white" }}>
                    <h3 style={{ fontWeight: "800", fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                        Dr. Sarah <span style={{ fontSize: "1rem" }}>🩺</span>
                    </h3>
                    <p style={{ fontSize: "0.875rem", opacity: 0.9, margin: 0, color: "var(--brand-accent)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Proprietary Neural Intake</p>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--bg-secondary)" }}>
                {messages?.map((m) => {
                    const isUser = (m.role as string) === 'user';
                    const text = getMessageText(m as any);
                    return (
                    <div
                        key={m.id}
                        style={{
                            maxWidth: "85%", padding: "0.875rem", borderRadius: "var(--radius-lg)", fontSize: "0.9rem", lineHeight: "1.5",
                            alignSelf: isUser ? 'flex-end' : 'flex-start',
                            borderTopRightRadius: isUser ? 0 : "var(--radius-lg)",
                            borderTopLeftRadius: isUser ? "var(--radius-lg)" : 0,
                            background: isUser ? "var(--brand-primary)" : "white",
                            color: isUser ? "white" : "var(--text-primary)",
                            border: isUser ? 'none' : "1px solid rgba(0,0,0,0.05)",
                            boxShadow: "var(--shadow-sm)"
                        }}
                    >
                        {!isUser && m.id !== 'welcome' && (
                            <div style={{ fontSize: "0.75rem", color: "var(--brand-primary)", fontWeight: "700", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>MediClaim Agent</div>
                        )}
                        {text}
                    </div>
                    );
                })}
                {isLoading && (
                    <div style={{ alignSelf: "flex-start", padding: "0.75rem 1rem", background: "white", borderRadius: "var(--radius-lg)", borderTopLeftRadius: 0, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "6px", height: "6px", background: "var(--brand-primary)", borderRadius: "50%", animation: "pulse 1s infinite" }} />
                        <div style={{ width: "6px", height: "6px", background: "var(--brand-primary)", borderRadius: "50%", animation: "pulse 1s infinite 0.2s" }} />
                        <div style={{ width: "6px", height: "6px", background: "var(--brand-primary)", borderRadius: "50%", animation: "pulse 1s infinite 0.4s" }} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { sendMessage({ text: input }); setInput(""); } }} style={{ padding: "1rem", background: "white", borderTop: "1px solid rgba(0,0,0,0.1)", display: "flex", gap: "0.5rem" }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Dr. Sarah about claims..."
                    style={{ flex: 1, padding: "0.75rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "var(--radius-md)", fontSize: "0.9rem", outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)", transition: "border-color 0.2s" }}
                    onFocus={(e) => e.target.style.borderColor = "var(--brand-primary)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.15)"}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !(input || '').trim()}
                    style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", fontWeight: "600", fontSize: "0.9rem", border: "none", cursor: isLoading || !(input || '').trim() ? "not-allowed" : "pointer", opacity: isLoading || !(input || '').trim() ? 0.5 : 1, background: "var(--brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: "3rem", transition: "background 0.2s" }}
                    onMouseOver={(e) => !isLoading && (input || '').trim() && (e.currentTarget.style.background = 'var(--brand-secondary)')}
                    onMouseOut={(e) => !isLoading && (input || '').trim() && (e.currentTarget.style.background = 'var(--brand-primary)')}
                >
                    →
                </button>
            </form>
        </div>
    );
}
