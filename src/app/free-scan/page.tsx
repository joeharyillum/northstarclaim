"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";

export default function FreeScanPage() {
    const [step, setStep] = useState(1);
    const [progress, setProgress] = useState(0);

    // Simulate scanning progress
    useEffect(() => {
        if (step === 2) {
            const interval = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setStep(3), 600);
                        return 100;
                    }
                    return p + Math.floor(Math.random() * 15) + 5;
                });
            }, 500);
            return () => clearInterval(interval);
        }
    }, [step]);

    return (
        <section className="section-padding" style={{ minHeight: "100vh", display: "flex", alignItems: "center", background: "var(--bg-primary)" }}>
            <div className="container" style={{ maxWidth: "800px" }}>

                {/* Step 1: Upload / Connect */}
                {step === 1 && (
                    <div className="glass-panel animate-fade-in" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", background: "rgba(37,99,235,0.1)", color: "var(--brand-primary)", fontSize: "2rem", marginBottom: "2rem" }}>
                            📄
                        </div>
                        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Initiate Diagnostic Sandbox</h1>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "3rem", fontSize: "1.125rem" }}>
                            Securely upload your denied claims CSV/PDFs or connect your clearinghouse interface. We'll simulate our cross-referencing capabilities to identify hidden revenue.
                        </p>

                        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
                            <div
                                style={{ flex: 1, minWidth: "250px", border: "2px dashed var(--brand-primary)", borderRadius: "var(--radius-lg)", padding: "3rem 1.5rem", cursor: "pointer", transition: "all 0.2s" }}
                                onMouseOver={(e) => e.currentTarget.style.background = "rgba(37,99,235,0.05)"}
                                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                                onClick={() => setStep(2)}
                            >
                                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📁</div>
                                <h3 style={{ marginBottom: "0.5rem" }}>Upload Files</h3>
                                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Drop PDFs or CSVs here</p>
                            </div>

                            <div
                                style={{ flex: 1, minWidth: "250px", border: "2px solid rgba(0,0,0,0.1)", borderRadius: "var(--radius-lg)", padding: "3rem 1.5rem", cursor: "pointer", transition: "all 0.2s" }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                onClick={() => setStep(2)}
                            >
                                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚙️</div>
                                <h3 style={{ marginBottom: "0.5rem" }}>Connect System</h3>
                                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Direct API integration</p>
                            </div>
                        </div>

                        <div style={{ marginTop: "2rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                            🔒 100% HIPAA Compliant & Secure Encryption
                        </div>
                    </div>
                )}

                {/* Step 2: Scanning Simulation */}
                {step === 2 && (
                    <div className="glass-panel animate-fade-in" style={{ padding: "5rem 2rem", textAlign: "center" }}>
                        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>AI Engine Analyzing Claims...</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "3rem" }}>Cross-referencing 4,329 documents against payer policies.</p>

                        <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto", height: "8px", background: "rgba(0,0,0,0.1)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                            <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))", transition: "width 0.3s ease" }} />
                        </div>
                        <div style={{ marginTop: "1rem", fontWeight: "bold", fontSize: "1.25rem", color: "var(--brand-primary)" }}>{progress}%</div>
                    </div>
                )}

                {/* Step 3: Aha Moment / Result */}
                {step === 3 && (
                    <div className="glass-panel animate-fade-in" style={{ padding: "4rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "10px", background: "var(--brand-accent)" }} />

                        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Scan Complete!</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", marginBottom: "2rem" }}>
                            Our AI identified a significant amount of incorrectly denied or unbilled revenue in your dataset.
                        </p>

                        <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "var(--radius-lg)", padding: "3rem", margin: "0 auto 3rem", display: "inline-block" }}>
                            <div style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--brand-accent)", fontWeight: "700", marginBottom: "0.5rem" }}>Total Recoverable Amount Found</div>
                            <div style={{ fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: "800", color: "var(--text-primary)", lineHeight: 1 }}>
                                $182,450<span style={{ fontSize: "2rem" }}>.00</span>
                            </div>
                        </div>

                        <p style={{ fontSize: "1.125rem", marginBottom: "2rem", maxWidth: "500px", margin: "0 auto 2rem" }}>
                            Are you ready to recover this capital? We operate on a pure performance partnership. Deploy our infrastructure today with zero upfront capital risk.
                        </p>

                        <Button size="lg" href="/signup">
                            Authorize Recovery & Create Account
                        </Button>
                    </div>
                )}

            </div>
        </section>
    );
}
