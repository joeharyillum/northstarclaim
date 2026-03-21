"use client";

import Button from "@/components/Button";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function BAAPage() {
    const [agreed, setAgreed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.role === "admin") {
            window.location.href = "/dashboard";
        }
    }, [session]);

    if (session?.user?.role === "admin") return null;

    const handleSign = async () => {
        if (!agreed || isProcessing) return;
        setIsProcessing(true);
        setError("");

        try {
            const res = await fetch("/api/auth/sign-baa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to sign BAA");
            }

            // Force session refresh and redirect to dashboard
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(err.message);
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: "2rem" }}>
            <div className="glass-panel animate-fade-in" style={{ padding: "3rem", width: "100%", maxWidth: "650px" }}>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div style={{ display: "inline-flex", width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", color: "white", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
                        🔒
                    </div>
                    <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>HIPAA Business Associate Agreement</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        You must sign the BAA before accessing the platform. This is required by federal law for any service that handles Protected Health Information (PHI).
                    </p>
                </div>

                <div style={{ height: "280px", overflowY: "auto", background: "white", padding: "1.25rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "#333", marginBottom: "1.5rem", lineHeight: 1.7 }}>
                    <h3 style={{ color: "#000", marginBottom: "0.75rem", fontSize: "0.95rem" }}>BUSINESS ASSOCIATE AGREEMENT (BAA)</h3>
                    <p><strong>Effective Date:</strong> Upon electronic signature below.</p>
                    <p>This Business Associate Agreement (&quot;Agreement&quot;) is entered into by and between NorthStar Medic (&quot;Business Associate&quot;) and the undersigned Covered Entity (&quot;Covered Entity&quot;) pursuant to the Health Insurance Portability and Accountability Act of 1996 (&quot;HIPAA&quot;), the HITECH Act, and their implementing regulations at 45 CFR Parts 160 and 164.</p>

                    <p><strong>1. DEFINITIONS.</strong> Terms used but not otherwise defined in this Agreement shall have the same meaning as those terms in the HIPAA Rules (45 CFR Parts 160-164).</p>

                    <p><strong>2. OBLIGATIONS OF BUSINESS ASSOCIATE.</strong></p>
                    <p>(a) Business Associate shall not use or disclose Protected Health Information (&quot;PHI&quot;) other than as permitted or required by this Agreement or as Required by Law.</p>
                    <p>(b) Business Associate shall use appropriate administrative, physical, and technical safeguards to prevent unauthorized use or disclosure of PHI, including implementing requirements of the Security Rule (45 CFR Part 164, Subpart C).</p>
                    <p>(c) Business Associate shall report to Covered Entity any use or disclosure of PHI not provided for by this Agreement of which it becomes aware, including breaches of Unsecured PHI as required by 45 CFR 164.410.</p>
                    <p>(d) Business Associate shall ensure that any subcontractors that create, receive, maintain, or transmit PHI agree to the same restrictions and conditions (45 CFR 164.502(e)(1)(ii)).</p>
                    <p>(e) Business Associate shall make available PHI in accordance with 45 CFR 164.524 to satisfy Covered Entity&apos;s obligations regarding individual access rights.</p>

                    <p><strong>3. PERMITTED USES AND DISCLOSURES.</strong></p>
                    <p>(a) Business Associate may use and disclose PHI solely for: (i) performing AI-powered claim recovery analysis and appeal generation; (ii) automated dispatch of appeal letters via fax, mail, or electronic submission; (iii) AI-assisted negotiation of settlements with payers; and (iv) data management and reporting as requested by Covered Entity.</p>
                    <p>(b) Business Associate may de-identify PHI in accordance with 45 CFR 164.514(a)-(c).</p>

                    <p><strong>4. PERFORMANCE-BASED COMPENSATION.</strong></p>
                    <p>Covered Entity agrees to a 30% contingency fee on all successfully recovered claim revenue processed through the platform. Business Associate shall generate invoices automatically upon confirmed payment from payers.</p>

                    <p><strong>5. TERM AND TERMINATION.</strong></p>
                    <p>(a) This Agreement shall be effective upon electronic signature and shall remain in effect until all PHI is destroyed or returned.</p>
                    <p>(b) Either party may terminate this Agreement if the other party materially breaches any provision.</p>
                    <p>(c) Upon termination, Business Associate shall return or destroy all PHI received, or if not feasible, extend protections indefinitely.</p>

                    <p><strong>6. BREACH NOTIFICATION.</strong></p>
                    <p>Business Associate shall notify Covered Entity of a breach of Unsecured PHI without unreasonable delay and in no case later than 30 calendar days after discovery of the breach.</p>

                    <p><strong>7. MISCELLANEOUS.</strong></p>
                    <p>(a) This Agreement shall be governed by federal law where applicable, and otherwise by the laws of the State of Florida.</p>
                    <p>(b) This Agreement represents the complete agreement between the parties relating to the protection of PHI.</p>
                    <p>(c) Any ambiguity in this Agreement shall be interpreted to comply with HIPAA regulations.</p>
                </div>

                <label style={{ display: "flex", gap: "1rem", alignItems: "flex-start", cursor: "pointer", marginBottom: "1.5rem" }}>
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        style={{ marginTop: "0.25rem", width: "20px", height: "20px", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "0.875rem", fontWeight: "500", lineHeight: 1.5 }}>
                        I am an authorized representative of the Covered Entity. I have read, understood, and agree to the HIPAA Business Associate Agreement, the Performance Partnership Terms (30% contingency fee), and the Terms of Service. I understand this constitutes a legally binding electronic signature.
                    </span>
                </label>

                {error && <p style={{ color: "red", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}

                <Button
                    fullWidth
                    onClick={handleSign}
                    disabled={!agreed || isProcessing}
                    style={{
                        opacity: agreed ? 1 : 0.5,
                        cursor: agreed ? (isProcessing ? "wait" : "pointer") : "not-allowed",
                    }}
                >
                    {isProcessing ? "Processing..." : "Sign BAA & Access Platform"}
                </Button>

                <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Your signature, IP address, and timestamp are recorded for HIPAA compliance.
                </p>
            </div>
        </div>
    );
}
