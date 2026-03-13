"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/Button";

interface Message {
    speaker: 'AI' | 'ADJUSTER';
    text: string;
}

interface NegotiationDeskProps {
    claimId: string;
    patientName: string;
    billedAmount: number;
}

export default function NegotiationDesk({ claimId, patientName, billedAmount }: NegotiationDeskProps) {
    const [status, setStatus] = useState<'IDLE' | 'DIALING' | 'LIVE' | 'CLOSED'>('IDLE');
    const [transcript, setTranscript] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [currentOffer, setCurrentOffer] = useState(0);
    const [minAcceptable] = useState(billedAmount * 0.75);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    const startAutonomousCall = async () => {
        setStatus('DIALING');
        await new Promise(r => setTimeout(r, 2000));
        setStatus('LIVE');

        // Initial AI Outreach
        const initialAI = "Hello, this is the MediClaim Revenue Recovery agent calling regarding Claim ID " + claimId + " for patient " + patientName + ". We are calling to discuss the clinical justification for CPT 99214 which was recently denied.";
        setTranscript([{ speaker: 'AI', text: initialAI }]);

        // Simulate Adjuster Response
        await processExchange("This is Karen from UHC. We denied that claim because of a missing modifier. I don't see any reason to reverse it.");
    };

    const processExchange = async (adjusterText: string) => {
        setTranscript(prev => [...prev, { speaker: 'ADJUSTER', text: adjusterText }]);
        setIsThinking(true);

        try {
            const res = await fetch("/api/negotiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ claimId, billedAmount, adjusterInput: adjusterText })
            });
            const data = await res.json();

            if (data.success) {
                await new Promise(r => setTimeout(r, 1500)); // Simulate "Neural Processing"
                setTranscript(prev => [...prev, { speaker: 'AI', text: data.aiResponse }]);
                if (data.state.status === 'AUTONOMOUS_CLOSE' || data.state.status === 'CLOSED') {
                    setStatus('CLOSED');
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: "2rem", height: "600px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "1rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.25rem", color: "var(--brand-primary)" }}>Autonomous Negotiation Battle Monitor</h2>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                        Claim: {claimId} | Value: ${billedAmount.toLocaleString()}
                        <span style={{ marginLeft: "1rem", color: "var(--brand-alert)", fontWeight: "600" }}>
                            🔒 Lock: ${minAcceptable.toLocaleString()}
                        </span>
                    </p>
                </div>
                <div style={{ padding: "0.5rem 1rem", borderRadius: "2rem", background: status === 'LIVE' ? "rgba(16,185,129,0.1)" : "rgba(0,0,0,0.05)", color: status === 'LIVE' ? "var(--brand-accent)" : "inherit", fontSize: "0.75rem", fontWeight: "700" }}>
                    {status === 'IDLE' && "READY"}
                    {status === 'DIALING' && "ESTABLISHING SECURE LINE..."}
                    {status === 'LIVE' && "• LIVE BATTLE"}
                    {status === 'CLOSED' && "MISSION COMPLETE - SETTLED"}
                </div>
            </div>

            <div
                ref={scrollRef}
                style={{ flex: 1, overflowY: "auto", background: "rgba(0,0,0,0.02)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}
            >
                {transcript.length === 0 && (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontStyle: "italic" }}>
                        Waiting for autonomous engagement...
                    </div>
                )}
                {transcript.map((msg, i) => (
                    <div key={i} style={{
                        alignSelf: msg.speaker === 'AI' ? 'flex-start' : 'flex-end',
                        maxWidth: "80%",
                        background: msg.speaker === 'AI' ? 'var(--brand-primary)' : 'white',
                        color: msg.speaker === 'AI' ? 'white' : 'var(--text-primary)',
                        padding: "1rem",
                        borderRadius: msg.speaker === 'AI' ? "0 1rem 1rem 1rem" : "1rem 1rem 0 1rem",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                        fontSize: "0.9rem"
                    }}>
                        <div style={{ fontSize: "0.7rem", opacity: 0.8, marginBottom: "0.25rem", fontWeight: "700" }}>{msg.speaker}</div>
                        {msg.text}
                    </div>
                ))}
                {isThinking && (
                    <div style={{ alignSelf: 'flex-start', background: "rgba(0,0,0,0.05)", padding: "0.5rem 1rem", borderRadius: "1.5rem", fontSize: "0.8rem" }}>
                        AI is calculating counter-argument...
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {status === 'IDLE' && (
                    <Button onClick={startAutonomousCall} style={{ width: "100%", background: "var(--brand-primary)", boxShadow: "0 0 15px rgba(0, 242, 255, 0.3)" }}>🚀 Initiate Autonomous Voice Battle</Button>
                )}
                {status === 'LIVE' && (
                    <div style={{ width: "100%", display: "flex", gap: "1rem" }}>
                        <div style={{ flex: 1, fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span className="animate-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--brand-accent)" }}></span>
                            Agent 41 is handling the negotiation...
                        </div>
                        <Button variant="outline" size="sm" onClick={() => processExchange("Our final offer is $850. Take it or leave it.")}>Simulate 'Final Offer'</Button>
                        <Button variant="outline" size="sm" onClick={() => processExchange("I'm looking at the policy now, it says this is bundled.")}>Simulate 'Bundling'</Button>
                    </div>
                )}
                {status === 'CLOSED' && (
                    <div style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--brand-accent)", textAlign: "center", color: "var(--brand-accent)", fontWeight: "700" }}>
                        💰 MISSION SUCCESS: Autonomous Settlement Secured. Invoicing Triggered.
                    </div>
                )}
            </div>
        </div>
    );
}
