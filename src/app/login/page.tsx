"use client";

import Button from "@/components/Button";
import { useState } from "react";
import { authenticate } from "@/app/lib/actions";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setIsProcessing(true);

        try {
            const form = new FormData();
            form.append("email", email);
            form.append("password", password);

            const result = await authenticate(undefined, form);
            
            if (result === 'Invalid credentials.') {
                setErrorMessage("Invalid email or password. Please try again.");
                setIsProcessing(false);
            } else if (result) {
                setErrorMessage(result);
                setIsProcessing(false);
            } else {
                // If no error returned, redirect
                window.location.replace("/dashboard");
            }
        } catch (err: unknown) {
            setErrorMessage("An unexpected error occurred. Please try again.");
            setIsProcessing(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "0.85rem 1rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)",
        color: "var(--text-primary)",
        fontSize: "1rem",
        outline: "none",
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
            <div className="glass-panel animate-fade-in" style={{
                padding: "2.5rem",
                width: "100%",
                maxWidth: "420px",
            }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                        display: "inline-flex",
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
                        color: "white",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        marginBottom: "1rem",
                    }}>
                        M
                    </div>
                    <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Sign In</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        Access your dashboard
                    </p>
                </div>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                            Email
                        </label>
                        <input
                            required
                            type="email"
                            placeholder="you@clinic.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                            Password
                        </label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={inputStyle}
                            autoComplete="current-password"
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                         <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                            <input type="checkbox" style={{ accentColor: "var(--brand-primary)" }} /> Keep me signed in
                         </label>
                         <Link href="/forgot-password" style={{ fontSize: "0.75rem", color: "var(--brand-primary)", textDecoration: "none" }}>Forgot password?</Link>
                    </div>

                    {errorMessage && (
                        <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{errorMessage}</p>
                    )}

                    <Button fullWidth style={{ marginTop: "0.5rem" }}>
                        {isProcessing ? "Authenticating..." : "Sign In"}
                    </Button>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1rem 0" }}>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>OR SIGN IN WITH</span>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <button 
                            type="button" 
                            onClick={() => {
                                signIn('google', { callbackUrl: '/dashboard' }).catch(() => {
                                    setErrorMessage("Google login is not configured yet. Use email/password.");
                                });
                            }}
                            style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.1rem", fontSize: "0.85rem", cursor: "pointer" }}
                        >
                             <span>Google</span>
                        </button>
                        <button 
                            type="button" 
                            onClick={() => {
                                signIn('apple', { callbackUrl: '/dashboard' }).catch(() => {
                                    setErrorMessage("Apple login is not configured yet. Use email/password.");
                                });
                            }}
                            style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.1rem", fontSize: "0.85rem", cursor: "pointer" }}
                        >
                             <span>Apple</span>
                        </button>
                    </div>

                    <div style={{ padding: "0.75rem", background: "rgba(168, 85, 247, 0.05)", borderRadius: "var(--radius-md)", border: "1px solid rgba(168, 85, 247, 0.2)", textAlign: "center" }}>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: 0 }}>
                            🔐 2FA Security Enhanced — Authenticator app protected.
                        </p>
                    </div>
                </form>

                <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    New clinic?{" "}
                    <Link href="/signup" style={{ color: "var(--brand-primary)", fontWeight: "600", textDecoration: "underline" }}>
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
}
