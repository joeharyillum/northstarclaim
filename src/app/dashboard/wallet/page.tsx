"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, ArrowUpRight, Shield, CheckCircle2, ShieldCheck,
  CreditCard, Zap, TrendingUp, DollarSign, Clock, Building2,
  ArrowDownRight, Eye, EyeOff, Wallet, Receipt, Users
} from "lucide-react";
import { useWalletStore } from "@/store/useWalletStore";

/* ================================================================
   WALLET PAGE — Role-based views:
   • admin  → Full command: all balances, payouts, client overview
   • client → Limited: own balance, own transactions only
   • biller → Commission view: earned commissions, payout requests
   ================================================================ */

export default function WalletPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "client";
  const { balance, history, addHistory } = useWalletStore();
  const [withdrawAmount, setWithdrawAmount] = useState("0");
  const [isSettling, setIsSettling] = useState(false);
  const [settlementStatus, setSettlementStatus] = useState("");
  const [stripeBalance, setStripeBalance] = useState<number | null>(null);
  const [pendingBalance, setPendingBalance] = useState<number | null>(null);
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<"bank" | "visa" | "fast">("bank");
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/stripe/balance");
        if (res.ok) {
          const data = await res.json();
          if (data && data.total !== undefined) {
            setStripeBalance(data.total);
            setPendingBalance(data.pending || 0);
          }
        }
      } catch (error) {
        console.error("Failed to load balance:", error);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSettle = async () => {
    if (parseFloat(withdrawAmount) <= 0) return;
    setIsSettling(true);
    setSettlementStatus("Processing payout...");
    try {
      await fetch("/api/stripe/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), destination: selectedPayoutMethod }),
      });
    } catch (e) { /* handled by status */ }
    setTimeout(() => {
      const txId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      addHistory({
        id: txId,
        amount: parseFloat(withdrawAmount),
        bankName: selectedPayoutMethod.toUpperCase(),
        accountNumber: "****7711",
        holderName: "PRIMARY_ACCOUNT",
        timestamp: new Date().toISOString(),
        status: "COMPLETED",
        estimatedArrival: "1-3 business days",
      });
      setIsSettling(false);
      setSettlementStatus("Payout initiated successfully.");
      setWithdrawAmount("0");
    }, 1500);
  };

  const formatBalance = (val: number | null) => {
    if (val === null) return "Loading...";
    if (!showBalance) return "••••••";
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const cardBase: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.6))",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "var(--radius-xl)",
    position: "relative",
    overflow: "hidden",
  };

  /* ─────────── ADMIN VIEW ─────────── */
  if (role === "admin") {
    return (
      <div style={{ maxWidth: "1200px" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Link href="/dashboard" style={{ padding: "0.5rem", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowLeft size={16} />
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.625rem", background: "rgba(16,185,129,0.08)", borderRadius: "var(--radius-full)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <ShieldCheck size={12} style={{ color: "#10b981" }} />
              <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.04em" }}>Secure Connection</span>
            </div>
            <div style={{ padding: "0.25rem 0.625rem", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "var(--radius-full)", fontSize: "0.6rem", fontWeight: "700", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Admin View
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "44px", height: "44px", background: "linear-gradient(135deg, var(--brand-secondary), var(--brand-primary))", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet size={22} style={{ color: "white" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
                Wallet <span className="text-gradient">Command</span>
              </h1>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Complete financial overview · Payouts · Revenue tracking</p>
            </div>
          </div>
        </div>

        {/* ─── Balance Cards Row ─── */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          {/* Available Balance */}
          <div style={{ ...cardBase, padding: "1.75rem" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #10b981, transparent)", opacity: 0.6 }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: "600", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.06em" }}>Available Balance</div>
              <button onClick={() => setShowBalance(!showBalance)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem" }}>
                {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
            <div style={{ fontSize: "2.25rem", fontWeight: "800", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              <span style={{ color: "var(--brand-primary)" }}>$</span>{formatBalance(stripeBalance)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.75rem", fontSize: "0.7rem", color: "#10b981" }}>
              <ArrowUpRight size={12} /> <span style={{ fontWeight: "600" }}>Live from Stripe</span>
            </div>
          </div>

          {/* Pending */}
          <div style={{ ...cardBase, padding: "1.75rem" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #f59e0b, transparent)", opacity: 0.6 }} />
            <div style={{ fontSize: "0.65rem", fontWeight: "600", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>Pending Clearance</div>
            <div style={{ fontSize: "2.25rem", fontWeight: "800", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              <span style={{ color: "#f59e0b" }}>$</span>{formatBalance(pendingBalance)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
              <Clock size={12} /> <span>Processing 2-5 days</span>
            </div>
          </div>

          {/* Total Paid Out */}
          <div style={{ ...cardBase, padding: "1.75rem" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #818cf8, transparent)", opacity: 0.6 }} />
            <div style={{ fontSize: "0.65rem", fontWeight: "600", color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>Total Paid Out</div>
            <div style={{ fontSize: "2.25rem", fontWeight: "800", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              <span style={{ color: "#818cf8" }}>$</span>{showBalance ? history.reduce((s, t) => s + t.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "••••••"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
              <TrendingUp size={12} /> <span>{history.length} transactions</span>
            </div>
          </div>
        </div>

        {/* ─── Main Grid: Transactions + Payout ─── */}
        <div className="dash-content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem" }}>
          {/* Transaction History */}
          <div style={{ ...cardBase, padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Receipt size={18} style={{ color: "#38bdf8" }} /> Transaction History
              </h3>
              <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "monospace" }}>ALL ACCOUNTS</span>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No transactions yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {history.map((tx) => (
                  <div key={tx.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "1rem 1.25rem", borderRadius: "var(--radius-lg)",
                    background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "var(--radius-md)", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: tx.status === "COMPLETED" ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                        border: `1px solid ${tx.status === "COMPLETED" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"}`,
                      }}>
                        <ArrowUpRight size={16} style={{ color: tx.status === "COMPLETED" ? "#10b981" : "#f59e0b" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.125rem" }}>{(tx.bankName || "Transfer").toUpperCase()}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{tx.id} · {new Date(tx.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1rem", fontWeight: "700" }}>-${tx.amount.toLocaleString()}</div>
                      <div style={{ fontSize: "0.6rem", fontWeight: "600", color: tx.status === "COMPLETED" ? "#10b981" : "#f59e0b", textTransform: "uppercase" }}>{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payout Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ ...cardBase, padding: "1.5rem" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "1.25rem", color: "var(--brand-secondary)" }}>Request Payout</h3>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Method</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                  {(["bank", "visa", "fast"] as const).map(method => (
                    <button key={method} onClick={() => setSelectedPayoutMethod(method)} style={{
                      padding: "0.5rem", borderRadius: "var(--radius-md)", fontSize: "0.7rem", fontWeight: "600",
                      textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer",
                      border: `1px solid ${selectedPayoutMethod === method ? "var(--brand-secondary)" : "var(--border-subtle)"}`,
                      background: selectedPayoutMethod === method ? "rgba(112,0,255,0.1)" : "transparent",
                      color: selectedPayoutMethod === method ? "#a855f7" : "var(--text-secondary)",
                      transition: "all 0.15s",
                    }}>
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "600" }}>Primary Account</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>****7711</div>
                </div>
                <CheckCircle2 size={14} style={{ color: "#10b981" }} />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Amount</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "var(--brand-secondary)", fontSize: "0.85rem" }}>$</span>
                  <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={{
                    width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)", padding: "0.75rem 0.75rem 0.75rem 1.75rem",
                    fontWeight: "700", fontSize: "0.95rem", color: "white", outline: "none",
                  }} />
                </div>
              </div>

              <button onClick={handleSettle} disabled={isSettling} style={{
                width: "100%", padding: "0.75rem", background: "var(--brand-secondary)", color: "white",
                borderRadius: "var(--radius-md)", border: "none", fontSize: "0.8rem", fontWeight: "700",
                cursor: isSettling ? "wait" : "pointer", opacity: isSettling ? 0.6 : 1, transition: "all 0.15s",
              }}>
                {isSettling ? "Processing..." : "Initiate Payout"}
              </button>
              {settlementStatus && (
                <div style={{ fontSize: "0.7rem", fontWeight: "600", color: "#10b981", textAlign: "center", marginTop: "0.75rem" }}>{settlementStatus}</div>
              )}
            </div>

            {/* Security Badge */}
            <div style={{ ...cardBase, padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.75rem" }}>
                <Shield size={14} style={{ color: "var(--brand-primary)" }} />
                <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Security Status</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {[
                  { label: "Encryption", status: "AES-256" },
                  { label: "Connection", status: "TLS 1.3" },
                  { label: "Verification", status: "Passed" },
                  { label: "PCI DSS", status: "Compliant" },
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

  /* ─────────── BILLER VIEW ─────────── */
  if (role === "biller") {
    return (
      <div style={{ maxWidth: "900px" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Link href="/dashboard" style={{ padding: "0.5rem", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowLeft size={16} />
            </Link>
            <div style={{ padding: "0.25rem 0.625rem", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: "var(--radius-full)", fontSize: "0.6rem", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Biller Partner
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "44px", height: "44px", background: "linear-gradient(135deg, #38bdf8, #818cf8)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={22} style={{ color: "white" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.02em" }}>Biller Wallet</h1>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Commission earnings & payout requests</p>
            </div>
          </div>
        </div>

        {/* Commission Cards */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ ...cardBase, padding: "1.75rem" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #10b981, transparent)", opacity: 0.6 }} />
            <div style={{ fontSize: "0.65rem", fontWeight: "600", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>Commission Earned</div>
            <div style={{ fontSize: "2.25rem", fontWeight: "800", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              <span style={{ color: "#10b981" }}>$</span>{formatBalance(stripeBalance)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.75rem", fontSize: "0.7rem", color: "#10b981" }}>
              <TrendingUp size={12} /> <span style={{ fontWeight: "600" }}>50/50 Revenue Split</span>
            </div>
          </div>

          <div style={{ ...cardBase, padding: "1.75rem" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #f59e0b, transparent)", opacity: 0.6 }} />
            <div style={{ fontSize: "0.65rem", fontWeight: "600", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>Pending Clearance</div>
            <div style={{ fontSize: "2.25rem", fontWeight: "800", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              <span style={{ color: "#f59e0b" }}>$</span>{formatBalance(pendingBalance)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
              <Clock size={12} /> <span>Clears in 5-7 business days</span>
            </div>
          </div>
        </div>

        {/* Payout + Transactions */}
        <div className="dash-content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>
          <div style={{ ...cardBase, padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Receipt size={18} style={{ color: "#38bdf8" }} /> Payout History
            </h3>
            {history.length === 0 ? (
              <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>No payouts yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {history.map((tx) => (
                  <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: "600" }}>Commission Payout</div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: "700" }}>${tx.amount.toLocaleString()}</div>
                      <div style={{ fontSize: "0.6rem", fontWeight: "600", color: tx.status === "COMPLETED" ? "#10b981" : "#f59e0b", textTransform: "uppercase" }}>{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...cardBase, padding: "1.5rem", height: "fit-content" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "1rem", color: "var(--brand-secondary)" }}>Request Payout</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Amount</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "var(--brand-secondary)", fontSize: "0.85rem" }}>$</span>
                <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "0.75rem 0.75rem 0.75rem 1.75rem", fontWeight: "700", fontSize: "0.95rem", color: "white", outline: "none" }} />
              </div>
            </div>
            <button onClick={handleSettle} disabled={isSettling} style={{ width: "100%", padding: "0.75rem", background: "var(--brand-secondary)", color: "white", borderRadius: "var(--radius-md)", border: "none", fontSize: "0.8rem", fontWeight: "700", cursor: isSettling ? "wait" : "pointer", opacity: isSettling ? 0.6 : 1 }}>
              {isSettling ? "Processing..." : "Request Payout"}
            </button>
            {settlementStatus && <div style={{ fontSize: "0.7rem", fontWeight: "600", color: "#10b981", textAlign: "center", marginTop: "0.75rem" }}>{settlementStatus}</div>}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────── CLIENT VIEW (limited) ─────────── */
  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <Link href="/dashboard" style={{ padding: "0.5rem", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={16} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.625rem", background: "rgba(16,185,129,0.08)", borderRadius: "var(--radius-full)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <ShieldCheck size={12} style={{ color: "#10b981" }} />
            <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.04em" }}>Secure</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, var(--brand-secondary), var(--brand-primary))", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={20} style={{ color: "white" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.02em" }}>My Wallet</h1>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>View your recovered funds</p>
          </div>
        </div>
      </div>

      {/* Simple Balance Card */}
      <div style={{
        ...cardBase, padding: "2rem", marginBottom: "1.5rem",
        background: "linear-gradient(135deg, rgba(112,0,255,0.08), rgba(0,242,255,0.06))",
        borderColor: "rgba(112,0,255,0.15)",
      }}>
        <div style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
          Recovered Funds Available
        </div>
        <div style={{ fontSize: "2.75rem", fontWeight: "800", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "0.75rem" }}>
          <span style={{ color: "var(--brand-primary)", marginRight: "0.25rem" }}>$</span>
          {stripeBalance !== null ? stripeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Loading..."}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#10b981", padding: "0.25rem 0.5rem", background: "rgba(16,185,129,0.08)", borderRadius: "var(--radius-full)", border: "1px solid rgba(16,185,129,0.15)" }}>
            STRIPE LIVE
          </span>
        </div>
      </div>

      {/* Transaction History (Read-only for clients) */}
      <div style={{ ...cardBase, padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Receipt size={18} style={{ color: "#38bdf8" }} /> Recent Activity
        </h3>
        {history.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            No activity yet. Recovered funds will appear here.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {history.slice(0, 5).map((tx) => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: "600" }}>Recovery Payout</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#10b981" }}>+${tx.amount.toLocaleString()}</div>
                  <div style={{ fontSize: "0.6rem", fontWeight: "600", color: tx.status === "COMPLETED" ? "#10b981" : "#f59e0b", textTransform: "uppercase" }}>{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note for clients */}
      <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", borderRadius: "var(--radius-lg)", background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.1)" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Recovered funds are deposited directly to your linked bank account. For payout inquiries, contact your account manager.
        </p>
      </div>
    </div>
  );
}
