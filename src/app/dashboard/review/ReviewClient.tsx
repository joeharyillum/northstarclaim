"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { approveAppeal, dispatchPhysical, triggerGrievance } from "./actions";

interface ReviewClientProps {
    claims: Array<any & { payer?: any }>;
}

export default function ReviewClient({ claims }: ReviewClientProps) {
    const [activeClaim, setActiveClaim] = useState(0);
    const [approvedClaims, setApprovedClaims] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

    const handleApprove = async () => {
        setIsProcessing(true);
        const claimId = claims[activeClaim].id;

        const result = await approveAppeal(claimId);

        if (result.success) {
            if (!approvedClaims.includes(activeClaim)) {
                setApprovedClaims([...approvedClaims, activeClaim]);
            }
        } else {
            alert("Auto-Save Error: " + (result as any).error);
        }
        setIsProcessing(false);
    };

    const handlePhysicalDispatch = async (method: 'FAX' | 'MAIL') => {
        setIsProcessing(true);
        const claim = claims[activeClaim];
        const payer = claim.payer;

        let address = "";
        if (method === 'FAX') {
            address = payer?.faxNumber || "1-800-PAYER-FAX";
        } else {
            address = payer ? `${payer.streetAddress}, ${payer.city}, ${payer.state} ${payer.zip}` : "123 Payer Way, NJ 07450";
        }

        const result = await dispatchPhysical(claim.id, method, address);

        if (result.success) {
            setDispatchStatus(`Successfully ${method === 'FAX' ? 'Faxed' : 'Mailed'} to ${payer?.name || 'Payer'} (ID: ${result.trackingId})`);
        } else {
            alert("Dispatch Error: " + (result as any).error);
        }
        setIsProcessing(false);
    };

    const handleGrievance = async () => {
        setIsProcessing(true);
        const claim = claims[activeClaim];
        const result = await triggerGrievance(claim.id);
        if (result.success) {
            setDispatchStatus(`Grievance filed (ID: ${result.grievance})`);
        } else {
            alert("Grievance Error: " + (result as any).error);
        }
        setIsProcessing(false);
    };

    return (
        <div className="animate-fade-in" style={{ display: "flex", gap: "2rem", height: "calc(100vh - 120px)" }}>

            {/* Sidebar List */}
            <div style={{ width: "350px", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", paddingRight: "1rem" }}>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Pending Approvals (HITL)</h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    Review the AI-generated appeals for medical accuracy before submission.
                </p>

                {claims.map((claim, idx) => (
                    <div
                        key={claim.id}
                        onClick={() => setActiveClaim(idx)}
                        className="glass-panel"
                        style={{
                            padding: "1rem",
                            cursor: "pointer",
                            border: activeClaim === idx ? "2px solid var(--brand-primary)" : "1px solid rgba(0,0,0,0.05)",
                            background: activeClaim === idx ? "white" : "var(--bg-primary)",
                            opacity: approvedClaims.includes(idx) ? 0.6 : 1,
                            transition: "all 0.2s"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span style={{ fontWeight: "700", color: activeClaim === idx ? "var(--brand-primary)" : "var(--text-primary)" }}>
                                {claim.amount}
                            </span>
                            {approvedClaims.includes(idx) ? (
                                <span style={{ fontSize: "0.75rem", background: "rgba(16,185,129,0.1)", color: "var(--brand-accent)", padding: "0.25rem 0.5rem", borderRadius: "1rem" }}>
                                    Approved
                                </span>
                            ) : (
                                <span style={{ fontSize: "0.75rem", background: "rgba(244,63,94,0.1)", color: "var(--brand-alert)", padding: "0.25rem 0.5rem", borderRadius: "1rem" }}>
                                    Needs Review
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: "0.875rem", fontWeight: "600" }}>{claim.patient}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                            CPT: {claim.cptCode} • {claim.dateOfService}
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail View */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div className="glass-panel" style={{ flex: 1, padding: "2rem", display: "flex", flexDirection: "column", overflowY: "auto" }}>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "1.5rem" }}>
                        <div>
                            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Claim Review: {claims[activeClaim].id}</h1>
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                                Provider: {claims[activeClaim].provider} | Service: {claims[activeClaim].description}
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.875rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: "600" }}>Value</div>
                            <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--brand-primary)" }}>{claims[activeClaim].amount}</div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
                        <div>
                            <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Original Denial</h3>
                            <div style={{ background: "rgba(244,63,94,0.05)", borderLeft: "4px solid var(--brand-alert)", padding: "1rem", borderRadius: "0 0.5rem 0.5rem 0" }}>
                                <p style={{ fontWeight: "500", color: "var(--brand-alert)" }}>{claims[activeClaim].denialReason}</p>
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>AI Cross-Reference Finding</h3>
                            <div style={{ background: "rgba(16,185,129,0.05)", borderLeft: "4px solid var(--brand-accent)", padding: "1rem", borderRadius: "0 0.5rem 0.5rem 0" }}>
                                <p style={{ fontWeight: "500", color: "var(--brand-accent)" }}>{claims[activeClaim].aiFinding}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>AI-Drafted Appeal Letter</h3>
                        <div style={{
                            flex: 1,
                            background: "white",
                            border: "1px solid rgba(0,0,0,0.1)",
                            borderRadius: "var(--radius-md)",
                            padding: "2rem",
                            fontFamily: "var(--font-geist-mono), monospace",
                            fontSize: "0.875rem",
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                            color: "var(--text-primary)"
                        }}>
                            {claims[activeClaim].appealDraft}
                        </div>
                    </div>

                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "1.5rem" }}>
                        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                            {dispatchStatus ? (
                                <span style={{ color: "var(--brand-accent)", fontWeight: "600" }}>✓ {dispatchStatus}</span>
                            ) : (
                                "By approving, you confirm medical accuracy under False Claims Act guidelines."
                            )}
                        </div>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <Button variant="outline" onClick={() => handlePhysicalDispatch('FAX')} disabled={isProcessing}>
                                {isProcessing ? "..." : "Dispatch via Fax"}
                            </Button>
                            <Button variant="outline" onClick={() => handlePhysicalDispatch('MAIL')} disabled={isProcessing}>
                                {isProcessing ? "..." : "Snail-Mail Appeal"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = `/dashboard/negotiate?claimId=${claims[activeClaim].id}`}
                                style={{ border: "2px solid var(--brand-primary)", color: "var(--brand-primary)" }}
                            >
                                Enter War Room
                            </Button>
                            {parseFloat(claims[activeClaim].amount.replace(/[^0-9.-]+/g, "")) >= 100000 && (
                                <Button
                                    variant="outline"
                                    onClick={handleGrievance}
                                    disabled={isProcessing}
                                    style={{ border: "2px solid var(--brand-alert)", color: "var(--brand-alert)" }}
                                >
                                    {isProcessing ? "Escalating..." : "🔥 Escalate to Regulator"}
                                </Button>
                            )}
                            <Button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                style={{
                                    background: approvedClaims.includes(activeClaim) ? "var(--brand-accent)" : "var(--brand-primary)",
                                    boxShadow: approvedClaims.includes(activeClaim) ? "0 0 15px rgba(16,185,129,0.3)" : "none",
                                    opacity: isProcessing ? 0.7 : 1
                                }}
                            >
                                {isProcessing ? "Saving to Vault..." : approvedClaims.includes(activeClaim) ? "✓ Approved for Submission" : "Approve & Submit"}
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
