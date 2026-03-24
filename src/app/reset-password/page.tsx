"use client";

import Button from "@/components/Button";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const tokenFromUrl = searchParams.get("token");
    const emailFromUrl = searchParams.get("email") || "";

    const [code, setCode] = useState(tokenFromUrl || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsProcessing(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: code, password }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("Password updated successfully. You can now login.");
            } else {
                setError(data.error || "Failed to reset password. Check if code is correct.");
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
                    ↻
                </div>
                <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Update Password</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    {emailFromUrl ? `Enter the code sent to ${emailFromUrl}` : "Enter your recovery code and new password."}
                </p>
            </div>

            {!message ? (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                            6-Digit Security Code
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                            style={{...inputStyle, textAlign: "center", letterSpacing: "8px", fontSize: "1.25rem", fontWeight: "700"}}
                            autoFocus={!tokenFromUrl}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                            New Password
                        </label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                            Confirm New Password
                        </label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {error && (
                        <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{error}</p>
                    )}

                    <Button fullWidth style={{ marginTop: "0.5rem" }} disabled={isProcessing}>
                        {isProcessing ? "Resetting..." : "Update Password"}
                    </Button>
                </form>
            ) : (
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: "var(--brand-primary)", fontWeight: "500", marginBottom: "1.5rem" }}>
                        {message}
                    </p>
                    <Button href="/login" variant="outline" fullWidth>
                        Sign In Now
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-primary)",
            padding: "2rem",
        }}>
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
