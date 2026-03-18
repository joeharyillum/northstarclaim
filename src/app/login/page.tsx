"use client";

import Button from "@/components/Button";
import { useState } from "react";
import { authenticate } from "@/app/lib/actions";
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

            const loginError = await authenticate(undefined, form);
            if (loginError) throw new Error(loginError);

            window.location.href = "/dashboard";
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Invalid credentials";
            setErrorMessage(message);
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

                    {errorMessage && (
                        <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{errorMessage}</p>
                    )}

                    <Button fullWidth style={{ marginTop: "0.5rem" }}>
                        {isProcessing ? "Signing in..." : "Sign In"}
                    </Button>
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
