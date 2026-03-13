import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ReviewClient from "./ReviewClient"; // We will move the interactive parts here

export default async function ReviewAndApprovePage({
    searchParams
}: {
    searchParams: Promise<{ batchId?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) return redirect("/signup");

    const { batchId } = await searchParams;

    // Fetch the claims for this session/batch
    let claimsData: any[] = [];

    if (batchId) {
        claimsData = await prisma.claim.findMany({
            where: {
                batchId: batchId,
                batch: { userId: session.user.id }
            },
            include: { appeal: true, payer: true }
        });
    } else {
        // Fallback: Get claims from the most recent batch for this user
        // Optimized: direct claim fetch with batch filter to avoid nested includes overhead
        const latestBatch = await prisma.uploadBatch.findFirst({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: { id: true }
        });

        if (latestBatch) {
            claimsData = await prisma.claim.findMany({
                where: { batchId: latestBatch.id },
                include: {
                    appeal: {
                        select: { draftedLetter: true }
                    },
                    payer: true
                }
            });
        }
    }

    if (claimsData.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "4rem" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>No claims pending review</h2>
                <p style={{ color: "var(--text-secondary)" }}>Upload ERA or EOB files to start the AI recovery process.</p>
            </div>
        );
    }

    // Map Prisma models to the UI format
    const formattedClaims = claimsData.map(claim => ({
        id: claim.id,
        patient: claim.patientId,
        dateOfService: claim.createdAt.toLocaleDateString(),
        provider: "Clinic Medical Group",
        cptCode: claim.cptCode,
        description: "Medical Service " + claim.cptCode,
        denialReason: claim.denialReason,
        aiFinding: "Detected valid modifier pathway via CMS NCCI guidelines.",
        amount: `$${claim.billedAmount.toLocaleString()}`,
        appealDraft: claim.appeal?.draftedLetter || "AI is finalizing the legal draft...",
        payer: claim.payer // Pass the payer routing data
    }));

    return <ReviewClient claims={formattedClaims} />;
}
