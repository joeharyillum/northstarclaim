"use client";

import Button from "@/components/Button";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { authenticate } from "@/app/lib/actions";

export default function SignupPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [step, setStep] = useState(1);
    const [agreed, setAgreed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({ clinicName: "", email: "", password: "" });
    const [errorMessage, setErrorMessage] = useState("");
    const [refCode, setRefCode] = useState<string | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref) setRefCode(ref);

        const payment = searchParams.get("payment");
        if (payment === "success") {
            setMode("register");
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setIsProcessing(true);

        try {
            const form = new FormData();
            form.append("email", formData.email);
            form.append("password", formData.password);

            const loginError = await authenticate(undefined, form);
            
            if (loginError === '2FA_REQUIRED') {
                window.location.href = `/login?email=${encodeURIComponent(formData.email)}`;
                return;
            }
            if (loginError) throw new Error(loginError);

            window.location.href = "/dashboard";
        } catch (err: any) {
            if (err?.message === 'NEXT_REDIRECT' || (err?.digest && err.digest.startsWith('NEXT_REDIRECT'))) {
                throw err;
            }
            setErrorMessage(err.message || "Invalid credentials");
            setIsProcessing(false);
        }
    };

    // ── REGISTER step 1: collect info → step 2 BAA ──
    const handleRegisterStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setStep(2);
    };

    // ── REGISTER step 2: sign BAA → create account ──
    const handleRegisterSign = async () => {
        if (!agreed || isProcessing) return;
        setIsProcessing(true);
        setErrorMessage("");

        try {
            const regRes = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    clinicName: formData.clinicName,
                    baaAccepted: true,
                    referralCode: refCode
                })
            });
            const regData = await regRes.json();
            if (!regRes.ok) throw new Error(regData.error || "Registration failed");

            const stripeRes = await fetch("/api/stripe/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, clinicName: formData.clinicName })
            });
            const stripeData = await stripeRes.json();

            const form = new FormData();
            form.append("email", formData.email);
            form.append("password", formData.password);
            
            // Allow NextAuth to natively handle the redirect securely:
            if (stripeData.success && stripeData.onboardingUrl) {
                form.append("redirectTo", stripeData.onboardingUrl);
            } else {
                form.append("redirectTo", "/dashboard");
            }
            
            const loginError = await authenticate(undefined, form);
            if (loginError) throw new Error(loginError);
        } catch (err: any) {
            if (err?.message === 'NEXT_REDIRECT' || (err?.digest && err.digest.startsWith('NEXT_REDIRECT'))) {
                throw err;
            }
            console.error(err);
            setErrorMessage(err.message || "An unexpected error occurred");
            setIsProcessing(false);
            setStep(1);
        }
    };

    const inputStyle = { width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(0,0,0,0.1)", background: "var(--bg-secondary)" };
    const labelStyle = { display: "block" as const, fontSize: "0.875rem", fontWeight: "600" as const, marginBottom: "0.5rem" };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: "2rem" }}>

            {/* ═══════ SIGN IN ═══════ */}
            {mode === "login" && (
                <div className="glass-panel animate-fade-in" style={{ padding: "3rem", width: "100%", maxWidth: "450px" }}>
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <div style={{ display: "inline-flex", width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", color: "white", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
                            M
                        </div>
                        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Sign In</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Access your dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input required type="email" placeholder="you@clinic.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Password</label>
                            <input required type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={inputStyle} />
                        </div>

                        {errorMessage && <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>{errorMessage}</p>}

                        <Button fullWidth style={{ marginTop: "1rem" }}>{isProcessing ? "Signing in..." : "Sign In"}</Button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                        New clinic?{" "}
                        <button onClick={() => { setMode("register"); setErrorMessage(""); setIsProcessing(false); }} style={{ background: "none", border: "none", color: "var(--brand-primary)", cursor: "pointer", fontWeight: "600", fontSize: "0.875rem", textDecoration: "underline" }}>
                            Create Account
                        </button>
                    </p>
                </div>
            )}

            {/* ═══════ REGISTER — Step 1: Info ═══════ */}
            {mode === "register" && step === 1 && (
                <div className="glass-panel animate-fade-in" style={{ padding: "3rem", width: "100%", maxWidth: "450px" }}>
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <div style={{ display: "inline-flex", width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", color: "white", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
                            M
                        </div>
                        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Create Clinic Account</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Set up your clinic to start recovering denied claims</p>
                    </div>

                    <form onSubmit={handleRegisterStep1} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={labelStyle}>Clinic Name</label>
                            <input required type="text" placeholder="Advanced Health Diagnostics" value={formData.clinicName} onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Work Email</label>
                            <input required type="email" placeholder="admin@advancedhealth.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Password</label>
                            <input required type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={inputStyle} />
                        </div>

                        {errorMessage && <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>{errorMessage}</p>}

                        <Button fullWidth style={{ marginTop: "1rem" }}>Continue to BAA Agreement</Button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                        Already have an account?{" "}
                        <button onClick={() => { setMode("login"); setStep(1); setErrorMessage(""); setIsProcessing(false); }} style={{ background: "none", border: "none", color: "var(--brand-primary)", cursor: "pointer", fontWeight: "600", fontSize: "0.875rem", textDecoration: "underline" }}>
                            Sign In
                        </button>
                    </p>
                </div>
            )}

            {/* ═══════ REGISTER — Step 2: BAA ═══════ */}
            {mode === "register" && step === 2 && (
                <div className="glass-panel animate-fade-in" style={{ padding: "3rem", width: "100%", maxWidth: "600px" }}>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Legal Agreements</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.875rem" }}>
                        To comply with HIPAA and process your claims for our performance-based partnership, please review and sign electronically.
                    </p>

                    <div style={{ height: "200px", overflowY: "auto", background: "white", padding: "1rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "var(--radius-md)", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                        <h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>BUSINESS ASSOCIATE AGREEMENT (BAA)</h4>
                        This Business Associate Agreement (&quot;Agreement&quot;) is entered into by and between NorthStar Medic (&quot;Business Associate&quot;) and the Clinic (&quot;Covered Entity&quot;).<br /><br />
                        1. Permitted Uses: Business Associate may use Protected Health Information (PHI) solely to perform claim recovery logic as authorized.<br />
                        2. Performance Partnership: Covered Entity agrees to the tiered contingency payment model on successfully recovered capital...
                    </div>

                    <label style={{ display: "flex", gap: "1rem", alignItems: "flex-start", cursor: "pointer", marginBottom: "2rem" }}>
                        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: "0.25rem", width: "20px", height: "20px" }} />
                        <span style={{ fontSize: "0.875rem", fontWeight: "500", lineHeight: 1.5 }}>
                            I am an authorized representative of the Clinic. I hereby sign the HIPAA Business Associate Agreement, the Performance Partnership Contract, and the Terms of Service.
                        </span>
                    </label>

                    <Button
                        fullWidth
                        onClick={handleRegisterSign}
                        disabled={!agreed || isProcessing}
                        style={{
                            opacity: agreed ? 1 : 0.5,
                            cursor: agreed ? (isProcessing ? "wait" : "pointer") : "not-allowed",
                            background: agreed ? "var(--brand-accent)" : "var(--brand-primary)"
                        }}
                    >
                        {isProcessing ? "Provisioning Payment Account..." : "Electronically Sign & Connect Bank"}
                    </Button>
                </div>
            )}

        </div>
    );
}
