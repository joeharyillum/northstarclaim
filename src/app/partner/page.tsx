"use client";

import { useState } from "react";
import Link from "next/link";
import { authenticate } from "@/app/lib/actions";

export default function PartnerSignupPage() {
    const [step, setStep] = useState(1);
    const [agreed, setAgreed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({ companyName: "", email: "", password: "" });
    const [errorMessage, setErrorMessage] = useState("");

    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setStep(2);
    };

    const handleRegister = async () => {
        if (!agreed || isProcessing) return;
        setIsProcessing(true);
        setErrorMessage("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    clinicName: formData.companyName,
                    baaAccepted: true,
                    role: "biller",
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            // Auto-login
            const form = new FormData();
            form.append("email", formData.email);
            form.append("password", formData.password);
            const loginError = await authenticate(undefined, form);
            if (loginError) throw new Error(loginError);

            // Redirect to Stripe onboarding
            const stripeRes = await fetch("/api/stripe/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, clinicName: formData.companyName }),
            });
            const stripeData = await stripeRes.json();

            if (stripeData.success && stripeData.onboardingUrl) {
                window.location.href = stripeData.onboardingUrl;
            } else {
                window.location.href = "/dashboard/partner";
            }
        } catch (err: any) {
            setErrorMessage(err.message || "An unexpected error occurred");
            setIsProcessing(false);
            setStep(1);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "0.75rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)",
        color: "white",
        fontSize: "0.9rem",
    };
    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "0.8rem",
        fontWeight: "600",
        marginBottom: "0.4rem",
        color: "var(--text-secondary)",
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-primary)",
            padding: "2rem",
        }}>
            {/* Step 1: Info */}
            {step === 1 && (
                <div className="glass-panel animate-fade-in" style={{ padding: "2.5rem", width: "100%", maxWidth: "480px" }}>
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <div style={{
                            display: "inline-flex", width: "48px", height: "48px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                            color: "white", alignItems: "center", justifyContent: "center",
                            fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem",
                        }}>
                            ◈
                        </div>
                        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Become a Partner</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            Earn 15% commission on every recovered claim from your referrals
                        </p>
                    </div>

                    <form onSubmit={handleStep1} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={labelStyle}>Company / Organization Name</label>
                            <input
                                required type="text"
                                placeholder="Your Billing Company LLC"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Work Email</label>
                            <input
                                required type="email"
                                placeholder="you@billingcompany.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Password</label>
                            <input
                                required type="password" minLength={8}
                                placeholder="Min. 8 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={inputStyle}
                            />
                        </div>

                        {errorMessage && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{errorMessage}</p>}

                        <button type="submit" style={{
                            padding: "0.75rem",
                            borderRadius: "var(--radius-md)",
                            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "0.9rem",
                            border: "none",
                            cursor: "pointer",
                            marginTop: "0.5rem",
                        }}>
                            Continue
                        </button>
                    </form>

                    {/* Benefits */}
                    <div style={{ marginTop: "2rem", padding: "1.25rem", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>Partner Benefits</div>
                        {[
                            "15% commission on every recovered claim",
                            "Unique referral link with permanent attribution",
                            "Real-time dashboard tracking referrals & earnings",
                            "Automatic payouts via Stripe Connect",
                        ].map((b, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                                <span style={{ color: "#10b981", fontSize: "0.75rem" }}>✓</span>
                                {b}
                            </div>
                        ))}
                    </div>

                    <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Already a partner?{" "}
                        <Link href="/signup" style={{ color: "#38bdf8", textDecoration: "underline" }}>Sign in</Link>
                    </p>
                </div>
            )}

            {/* Step 2: Biller Agreement */}
            {step === 2 && (
                <div className="glass-panel animate-fade-in" style={{ padding: "2.5rem", width: "100%", maxWidth: "600px" }}>
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>Partner Agreement</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            Review and accept the Biller Partnership Agreement
                        </p>
                    </div>

                    <div style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        padding: "1.25rem",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        marginBottom: "1.5rem",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.7,
                    }}>
                        <p><strong>BILLER PARTNERSHIP AGREEMENT</strong></p>
                        <p>This agreement is between NorthStar Medic (&quot;Company&quot;) and the undersigned partner (&quot;Partner&quot;).</p>
                        <p><strong>Revenue Sharing:</strong> The Company charges a 30% contingency fee on recovered claims. This fee is split equally — 15% to the Company and 15% to the Partner for referred clients.</p>
                        <p><strong>Referral Tracking:</strong> Partners receive a unique referral code. All clients who sign up using this code are permanently attributed to the Partner.</p>
                        <p><strong>Payment:</strong> Commission payments are processed via Stripe Connect within 30 days of confirmed recovery. Minimum payout threshold: $100.</p>
                        <p><strong>Compliance:</strong> Partner agrees to comply with HIPAA, the Anti-Kickback Statute, and the Stark Law. Compensation is based solely on recovered claim value, not referral volume.</p>
                        <p><strong>Termination:</strong> Either party may terminate with 30 days written notice. Earned but unpaid commissions remain payable after termination.</p>
                        <p>Full terms available at <Link href="/biller-agreement" target="_blank" style={{ color: "#38bdf8" }}>/biller-agreement</Link>.</p>
                    </div>

                    <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer", marginBottom: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            style={{ marginTop: "3px", accentColor: "#38bdf8" }}
                        />
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                            I have read and agree to the <Link href="/biller-agreement" target="_blank" style={{ color: "#38bdf8" }}>Biller Partnership Agreement</Link> and the <Link href="/baa" target="_blank" style={{ color: "#38bdf8" }}>Business Associate Agreement (BAA)</Link>.
                        </span>
                    </label>

                    {errorMessage && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>{errorMessage}</p>}

                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                            onClick={() => { setStep(1); setAgreed(false); }}
                            style={{
                                flex: 1,
                                padding: "0.75rem",
                                borderRadius: "var(--radius-md)",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "var(--text-secondary)",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                            }}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleRegister}
                            disabled={!agreed || isProcessing}
                            style={{
                                flex: 2,
                                padding: "0.75rem",
                                borderRadius: "var(--radius-md)",
                                background: agreed ? "linear-gradient(135deg, #38bdf8, #818cf8)" : "rgba(255,255,255,0.06)",
                                color: agreed ? "white" : "var(--text-muted)",
                                fontWeight: "700",
                                fontSize: "0.9rem",
                                border: "none",
                                cursor: agreed ? "pointer" : "not-allowed",
                                opacity: isProcessing ? 0.6 : 1,
                            }}
                        >
                            {isProcessing ? "Creating account..." : "Accept & Create Partner Account"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
