"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageSquare, X, Send } from 'lucide-react';

function getMessageText(m: { parts?: Array<{ type: string; text?: string }> }): string {
    if (!m.parts) return '';
    return m.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && typeof p.text === 'string')
        .map(p => p.text)
        .join('');
}

export default function Chatbot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isDashboard = pathname.startsWith("/dashboard");

    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
        messages: [
            {
                id: "welcome",
                role: "assistant",
                content: "",
                parts: [{ type: 'text' as const, text: "Hi! I'm Dr. Sarah, your medical claims specialist. How can I help you recover denied revenue today?" }],
            }
        ]
    });

    const isLoading = status === 'streaming' || status === 'submitted';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Hide chatbot on dashboard — dashboard has its own UI
    if (isDashboard) return null;

    if (!isOpen) {
        return (
            <div style={{
                position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 999,
                display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem",
            }} className="chatbot-fab">
                {/* Attention Bubble */}
                <div
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: "var(--bg-card)",
                        padding: "0.625rem 1rem",
                        borderRadius: "var(--radius-lg)",
                        boxShadow: "var(--shadow-lg)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        position: "relative",
                        marginRight: "0.5rem",
                    }}
                >
                    <p style={{
                        margin: 0, fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)",
                        display: "flex", alignItems: "center", gap: "0.5rem",
                    }}>
                        <span style={{
                            display: "inline-block", width: "6px", height: "6px",
                            background: "#10b981", borderRadius: "50%",
                            boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
                        }} />
                        Chat with <span style={{ color: "var(--brand-primary)" }}>Dr. Sarah</span>
                    </p>
                    <div style={{
                        position: "absolute", bottom: "-5px", right: "2rem",
                        width: "10px", height: "10px", background: "var(--bg-card)",
                        transform: "rotate(45deg)",
                        borderRight: "1px solid var(--border-subtle)",
                        borderBottom: "1px solid var(--border-subtle)",
                    }} />
                </div>

                {/* Chat Button */}
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        height: "56px", width: "56px", borderRadius: "50%",
                        boxShadow: "var(--shadow-lg), 0 0 20px rgba(0, 242, 255, 0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        border: "2px solid rgba(0, 242, 255, 0.3)",
                        overflow: "hidden", padding: 0,
                        transition: "transform 0.2s ease, box-shadow 0.2s",
                        outline: "none",
                        background: "linear-gradient(135deg, var(--bg-card), var(--bg-elevated))",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg), 0 0 30px rgba(0, 242, 255, 0.25)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg), 0 0 20px rgba(0, 242, 255, 0.15)'; }}
                    aria-label="Open AI Assistant"
                >
                    <MessageSquare size={22} style={{ color: "var(--brand-primary)" }} />
                </button>
            </div>
        );
    }

    return (
        <div className="chatbot-window" style={{
            position: "fixed", bottom: "1.5rem", right: "1.5rem",
            width: "380px", height: "560px",
            display: "flex", flexDirection: "column",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 242, 255, 0.08)",
            zIndex: 999, overflow: "hidden",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-primary)",
        }}>
            {/* Header */}
            <div style={{
                padding: "1rem 1.25rem",
                background: "var(--bg-card)",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        overflow: "hidden", border: "2px solid rgba(0, 242, 255, 0.2)",
                        flexShrink: 0,
                    }}>
                        <img
                            src="/dr_sarah_vintage.png"
                            alt="Dr. Sarah"
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            Dr. Sarah
                            <span style={{
                                width: "6px", height: "6px", borderRadius: "50%",
                                background: "#10b981", display: "inline-block",
                            }} />
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "500" }}>
                            Claims Recovery Specialist
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        cursor: "pointer", background: "rgba(255,255,255,0.05)",
                        borderRadius: "var(--radius-md)", width: "28px", height: "28px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid var(--border-subtle)", color: "var(--text-muted)",
                        transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                    <X size={14} />
                </button>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1, overflowY: "auto", padding: "1rem",
                display: "flex", flexDirection: "column", gap: "0.75rem",
                background: "var(--bg-primary)",
            }}>
                {messages?.map((m) => {
                    const isUser = (m.role as string) === 'user';
                    const text = getMessageText(m as any);
                    return (
                        <div
                            key={m.id}
                            style={{
                                maxWidth: "85%",
                                padding: "0.75rem 1rem",
                                borderRadius: "var(--radius-lg)",
                                fontSize: "0.8rem",
                                lineHeight: "1.55",
                                alignSelf: isUser ? 'flex-end' : 'flex-start',
                                borderTopRightRadius: isUser ? "4px" : "var(--radius-lg)",
                                borderTopLeftRadius: isUser ? "var(--radius-lg)" : "4px",
                                background: isUser
                                    ? "linear-gradient(135deg, rgba(0, 242, 255, 0.15), rgba(112, 0, 255, 0.1))"
                                    : "var(--bg-card)",
                                color: "var(--text-primary)",
                                border: `1px solid ${isUser ? 'rgba(0, 242, 255, 0.15)' : 'var(--border-subtle)'}`,
                            }}
                        >
                            {!isUser && m.id !== 'welcome' && (
                                <div style={{
                                    fontSize: "0.6rem", color: "var(--brand-primary)",
                                    fontWeight: "700", marginBottom: "0.25rem",
                                    textTransform: "uppercase", letterSpacing: "0.04em",
                                }}>Dr. Sarah</div>
                            )}
                            {text}
                        </div>
                    );
                })}
                {isLoading && (
                    <div style={{
                        alignSelf: "flex-start",
                        padding: "0.75rem 1rem",
                        background: "var(--bg-card)",
                        borderRadius: "var(--radius-lg)",
                        borderTopLeftRadius: "4px",
                        border: "1px solid var(--border-subtle)",
                        display: "flex", alignItems: "center", gap: "0.375rem",
                    }}>
                        {[0, 0.15, 0.3].map((delay, i) => (
                            <div key={i} style={{
                                width: "5px", height: "5px",
                                background: "var(--brand-primary)", borderRadius: "50%",
                                animation: `pulse 1s infinite ${delay}s`,
                            }} />
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (input.trim()) { sendMessage({ text: input }); setInput(""); }
                }}
                style={{
                    padding: "0.75rem 1rem",
                    background: "var(--bg-card)",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex", gap: "0.5rem",
                }}
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about claims recovery..."
                    style={{
                        flex: 1, padding: "0.625rem 0.875rem",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.8rem", outline: "none",
                        background: "rgba(0,0,0,0.2)",
                        color: "var(--text-primary)",
                        transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "rgba(0, 242, 255, 0.3)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border-subtle)"}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !(input || '').trim()}
                    style={{
                        padding: "0.625rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid rgba(0, 242, 255, 0.2)",
                        cursor: isLoading || !(input || '').trim() ? "not-allowed" : "pointer",
                        opacity: isLoading || !(input || '').trim() ? 0.4 : 1,
                        background: "rgba(0, 242, 255, 0.1)",
                        color: "var(--brand-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: "38px",
                        transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => { if (!isLoading && (input || '').trim()) { e.currentTarget.style.background = 'rgba(0, 242, 255, 0.2)'; } }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0, 242, 255, 0.1)'; }}
                >
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
}
