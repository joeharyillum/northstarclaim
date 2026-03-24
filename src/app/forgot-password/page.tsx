"use client";

import Button from "@/components/Button";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setIsProcessing(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
                // Redirect to reset password page with email context
                window.location.href = `/reset-password?email=${encodeURIComponent(email)}`;
            } else {
                setError(data.error || "Failed to send reset link.");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
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
                        ?
                    </div>
                    <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Forgot Password</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                {!message ? (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                                Email Address
                            </label>
                            <input
                                required
                                type="email"
                                placeholder="you@clinic.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={inputStyle}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{error}</p>
                        )}

                        <Button fullWidth style={{ marginTop: "0.5rem" }} disabled={isProcessing}>
                            {isProcessing ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>
                ) : (
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "var(--brand-primary)", fontWeight: "500", marginBottom: "1.5rem" }}>
                            {message}
                        </p>
                        <Button href="/login" variant="outline" fullWidth>
                            Return to Login
                        </Button>
                    </div>
                )}

                <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                    <Link href="/login" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none" }}>
                        ← Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
