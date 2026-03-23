"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";

export default function SettingsPage() {
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [code, setCode] = useState("");
    const [enabled, setEnabled] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/auth/2fa")
            .then(res => res.json())
            .then(data => {
                setEnabled(data.enabled);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const generateSetup = async () => {
        const res = await fetch("/api/auth/2fa", { method: "POST" });
        const data = await res.json();
        if (data.qrCode) {
            setQrCodeUrl(data.qrCode);
            setSecret(data.secret);
            setMessage("Scan the QR code with your authenticator app.");
        }
    };

    const verifySetup = async () => {
        const res = await fetch("/api/auth/2fa", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, secret })
        });
        const data = await res.json();
        if (data.success) {
            setEnabled(true);
            setQrCodeUrl("");
            setSecret("");
            setMessage("2FA successfully enabled!");
        } else {
            setMessage("Invalid code. Please try again.");
        }
    };

    const disable2FA = async () => {
        const res = await fetch("/api/auth/2fa", { method: "DELETE" });
        if (res.ok) {
            setEnabled(false);
            setMessage("2FA has been disabled.");
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
            
            <div className="glass-panel p-6 max-w-xl">
                <h2 className="text-xl font-bold mb-4">Two-Factor Authentication (2FA)</h2>
                
                {message && <p className="mb-4 text-brand-primary">{message}</p>}

                {enabled ? (
                    <div>
                        <p className="text-green-500 mb-4">✓ 2FA is currently enabled for your account.</p>
                        <Button onClick={disable2FA} variant="outline">Disable 2FA</Button>
                    </div>
                ) : (
                    <div>
                        <p className="text-text-secondary mb-4">
                            Protect your account with an extra layer of security. Once configured, you'll be required to enter both your password and an authentication code from your mobile app in order to sign in.
                        </p>
                        
                        {!qrCodeUrl ? (
                            <Button onClick={generateSetup}>Set Up 2FA</Button>
                        ) : (
                            <div className="mt-4 p-4 border border-border-subtle rounded-lg text-center">
                                <p className="mb-2 text-sm text-text-secondary">1. Scan this QR code with Google Authenticator or Authy</p>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`} alt="2FA QR Code" className="mx-auto mb-4 border-2 border-white rounded bg-white p-2" />
                                
                                <p className="mb-2 text-sm text-text-secondary">2. Enter the 6-digit code from the app to verify</p>
                                <input 
                                    type="text" 
                                    placeholder="000000" 
                                    value={code} 
                                    onChange={e => setCode(e.target.value)}
                                    className="w-full max-w-[200px] p-2 text-center text-xl tracking-widest bg-black/40 border border-white/20 rounded-md mb-4 text-white placeholder:text-white/30"
                                    maxLength={6}
                                />
                                <div>
                                    <Button onClick={verifySetup} disabled={code.length !== 6}>Verify & Enable</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
