import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-session";
import NegotiationDesk from "./NegotiationDesk";

export default async function NegotiatePage({
    searchParams
}: {
    searchParams: Promise<{ claimId?: string }>;
}) {
    const session = await getOwnerSession();

    const { claimId } = await searchParams;

    if (!claimId) {
        return (
            <div style={{ padding: "4rem", textAlign: "center" }}>
                <h2>No Claim Selected for Negotiation</h2>
                <p>Select a claim from the Review Dashboard to initiate autonomous voice settlement.</p>
            </div>
        );
    }

    const claim = await prisma.claim.findUnique({
        where: { id: claimId },
    });

    if (!claim) return <div>Claim not found</div>;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Negotiation War Room</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                The Neural Army is authorized to negotiate and close this settlement independently.
            </p>

            <NegotiationDesk
                claimId={claim.id}
                patientName={claim.patientId}
                billedAmount={claim.billedAmount}
            />

            <div style={{ marginTop: "2rem" }} className="glass-panel p-6">
                <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Elite Tactical Strategy (Agent 41)</h3>
                <ul style={{ fontSize: "0.875rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <li>• Utilizing CMS NCCI guidelines to supersede payer bundle policy.</li>
                    <li>• Dynamic Escalation: AI will "consult a supervisor" if friction exceeds 30%.</li>
                    <li>• Legal Bind: Automated digital handshake upon verbal agreement.</li>
                </ul>
            </div>
        </div>
    );
}
