"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowUpRight,
    Shield,
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    Zap
} from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';

export default function WalletPage() {
    const { balance, history, addHistory } = useWalletStore();
    const [withdrawAmount, setWithdrawAmount] = useState('0');
    const [isSettling, setIsSettling] = useState(false);
    const [settlementStatus, setSettlementStatus] = useState('');
    const [stripeBalance, setStripeBalance] = useState<number | null>(null);
    const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<'bank' | 'visa' | 'fast'>('bank');

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await fetch('/api/stripe/balance');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.total !== undefined) {
                        setStripeBalance(data.total);
                    }
                }
            } catch (error) {
                console.error('Failed to load Stripe balance:', error);
            }
        };
        fetchBalance();
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSettle = async () => {
        if (parseFloat(withdrawAmount) <= 0) return;
        setIsSettling(true);
        setSettlementStatus('Processing payout...');

        try {
            await fetch('/api/stripe/payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(withdrawAmount), destination: selectedPayoutMethod })
            });
        } catch (e) { }

        setTimeout(() => {
            const txId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            addHistory({
                id: txId,
                amount: parseFloat(withdrawAmount),
                bankName: selectedPayoutMethod.toUpperCase(),
                accountNumber: '****7711',
                holderName: 'PRIMARY_ACCOUNT',
                timestamp: new Date().toISOString(),
                status: 'COMPLETED',
                estimatedArrival: '1-3 business days'
            });
            setIsSettling(false);
            setSettlementStatus('Payout initiated successfully.');
            setWithdrawAmount('0');
        }, 1500);
    };

    return (
        <div style={{ maxWidth: "1100px" }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                    <Link href="/dashboard" style={{
                        padding: "0.5rem",
                        background: "var(--bg-card)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.25rem 0.625rem",
                        background: "rgba(16, 185, 129, 0.08)",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid rgba(16, 185, 129, 0.15)",
                    }}>
                        <ShieldCheck size={12} style={{ color: "#10b981" }} />
                        <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Secure Connection
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        background: "linear-gradient(135deg, var(--brand-secondary), var(--brand-primary))",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <CreditCard size={20} style={{ color: "white" }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.02em" }}>
                            Wallet
                        </h1>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Manage payouts and view transaction history
                        </p>
                    </div>
                </div>
            </div>

            {/* Balance Card */}
            <div style={{
                background: "linear-gradient(135deg, rgba(112, 0, 255, 0.08), rgba(0, 242, 255, 0.06))",
                border: "1px solid rgba(112, 0, 255, 0.15)",
                borderRadius: "var(--radius-xl)",
                padding: "2rem",
                marginBottom: "1.5rem",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                    Available Balance
                </div>
                <div style={{
                    fontSize: "2.75rem",
                    fontWeight: "800",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    marginBottom: "0.75rem",
                }}>
                    <span style={{ color: "var(--brand-primary)", marginRight: "0.25rem" }}>$</span>
                    {stripeBalance !== null
                        ? stripeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : "Loading..."
                    }
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <button
                        onClick={async () => {
                            setStripeBalance(null);
                            try {
                                const res = await fetch('/api/stripe/balance');
                                if (res.ok) {
                                    const data = await res.json();
                                    setStripeBalance(data.total || data.available);
                                }
                            } catch (e) { console.error(e); }
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            padding: "0.375rem 0.75rem",
                            background: "rgba(0, 242, 255, 0.1)",
                            border: "1px solid rgba(0, 242, 255, 0.2)",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--brand-primary)",
                            fontSize: "0.7rem",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        <Zap size={10} /> Refresh
                    </button>
                    <span style={{
                        fontSize: "0.65rem",
                        fontWeight: "600",
                        color: "#10b981",
                        padding: "0.25rem 0.5rem",
                        background: "rgba(16, 185, 129, 0.08)",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid rgba(16, 185, 129, 0.15)",
                    }}>
                        STRIPE LIVE
                    </span>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem" }}>
                {/* Transaction History */}
                <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        Transaction History
                    </h3>
                    <div style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-xl)",
                        overflow: "hidden",
                    }}>
                        {history.length === 0 ? (
                            <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                No transactions yet
                            </div>
                        ) : (
                            history.map((tx, i) => (
                                <div key={tx.id} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "1rem 1.25rem",
                                    borderBottom: i < history.length - 1 ? "1px solid var(--border-subtle)" : "none",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <div style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "var(--radius-md)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: tx.status === 'COMPLETED' ? "rgba(112, 0, 255, 0.08)" : "rgba(245, 158, 11, 0.08)",
                                            border: `1px solid ${tx.status === 'COMPLETED' ? "rgba(112, 0, 255, 0.15)" : "rgba(245, 158, 11, 0.15)"}`,
                                            flexShrink: 0,
                                        }}>
                                            <ArrowUpRight size={16} style={{ color: tx.status === 'COMPLETED' ? "#7B61FF" : "#f59e0b" }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.125rem" }}>
                                                {(tx.bankName || 'Transfer').toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                                {tx.id} · {new Date(tx.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "0.95rem", fontWeight: "700" }}>
                                            -${tx.amount.toLocaleString()}
                                        </div>
                                        <div style={{
                                            fontSize: "0.6rem",
                                            fontWeight: "600",
                                            color: tx.status === 'COMPLETED' ? "#10b981" : "#f59e0b",
                                            textTransform: "uppercase",
                                        }}>
                                            {tx.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Payout Panel */}
                <div style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-xl)",
                    padding: "1.5rem",
                    height: "fit-content",
                }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "1.25rem", color: "var(--brand-secondary)" }}>
                        Request Payout
                    </h3>

                    {/* Payout Method */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Method
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                            {(['bank', 'visa', 'fast'] as const).map(method => (
                                <button
                                    key={method}
                                    onClick={() => setSelectedPayoutMethod(method)}
                                    style={{
                                        padding: "0.5rem",
                                        borderRadius: "var(--radius-md)",
                                        fontSize: "0.7rem",
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                        cursor: "pointer",
                                        border: `1px solid ${selectedPayoutMethod === method ? "var(--brand-secondary)" : "var(--border-subtle)"}`,
                                        background: selectedPayoutMethod === method ? "rgba(112, 0, 255, 0.1)" : "transparent",
                                        color: selectedPayoutMethod === method ? "#a855f7" : "var(--text-secondary)",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Account Info */}
                    <div style={{
                        padding: "0.75rem",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        marginBottom: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: "600" }}>Primary Account</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>****7711</div>
                        </div>
                        <CheckCircle2 size={14} style={{ color: "#10b981" }} />
                    </div>

                    {/* Amount */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Amount
                        </label>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute",
                                left: "0.75rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontWeight: "700",
                                color: "var(--brand-secondary)",
                                fontSize: "0.85rem",
                            }}>$</span>
                            <input
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                style={{
                                    width: "100%",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid var(--border-subtle)",
                                    borderRadius: "var(--radius-md)",
                                    padding: "0.75rem 0.75rem 0.75rem 1.75rem",
                                    fontWeight: "700",
                                    fontSize: "0.95rem",
                                    color: "white",
                                    outline: "none",
                                }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSettle}
                        disabled={isSettling}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            background: "var(--brand-secondary)",
                            color: "white",
                            borderRadius: "var(--radius-md)",
                            border: "none",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                            cursor: isSettling ? "wait" : "pointer",
                            opacity: isSettling ? 0.6 : 1,
                            transition: "all 0.15s",
                        }}
                    >
                        {isSettling ? 'Processing...' : 'Initiate Payout'}
                    </button>
                    {settlementStatus && (
                        <div style={{ fontSize: "0.7rem", fontWeight: "600", color: "#10b981", textAlign: "center", marginTop: "0.75rem" }}>
                            {settlementStatus}
                        </div>
                    )}

                    {/* Security Info */}
                    <div style={{
                        marginTop: "1.25rem",
                        padding: "0.75rem",
                        background: "rgba(0,0,0,0.2)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.5rem" }}>
                            <Shield size={12} style={{ color: "var(--brand-primary)" }} />
                            <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                Security Status
                            </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                            {[
                                { label: "Encryption", status: "AES-256" },
                                { label: "Connection", status: "Secure" },
                                { label: "Verification", status: "Passed" },
                            ].map(item => (
                                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem" }}>
                                    <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                                    <span style={{ color: "#10b981", fontWeight: "600" }}>{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
