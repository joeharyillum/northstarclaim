'use server';

import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { auth } from '@/auth';

export async function processClaimUpload(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized: HIPAA session required." };
    }

    try {
        const files = formData.getAll('files') as File[];
        if (!files || files.length === 0) {
            const singleFile = formData.get('file') as File;
            if (singleFile) files.push(singleFile);
        }

        if (files.length === 0) return { success: false, error: "No files found." };

        // 1. Create a persistent Upload Batch
        const batch = await prisma.uploadBatch.create({
            data: {
                userId: session.user.id,
                fileName: files[0].name,
                status: "PARSING"
            }
        });

        // 2. Store file locally
        const file = files[0];
        const uploadDir = path.join(process.cwd(), 'uploads', 'vault', batch.id);
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, file.name);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);
        const fileUrl = `/uploads/vault/${batch.id}/${file.name}`;

        // AI Multi-Agent Simulation (Agent 1-14)
        // In a full implementation, this triggers a webhook to our /api/ingest pipeline
        await new Promise(resolve => setTimeout(resolve, 2000));

        const billedAmount = Math.floor(Math.random() * 50000) + 15000;

        // 3. Create the Claim record connected to the batch
        const claim = await prisma.claim.create({
            data: {
                batchId: batch.id,
                patientId: "MRN-" + Math.floor(Math.random() * 90000 + 10000),
                cptCode: "99291",
                billedAmount: billedAmount,
                denialReason: "CO-97: The benefit for this service is included in the payment for another service.",
                status: "PENDING_ANALYSIS"
            }
        });

        // 4. Update Batch status
        await prisma.uploadBatch.update({
            where: { id: batch.id },
            data: { status: "COMPLETED" }
        });

        return {
            success: true,
            batchId: batch.id,
            claimId: claim.id,
            vaultUrl: fileUrl,
            extractedClaim: {
                patientId: claim.patientId,
                dateOfService: "2023-11-14",
                procedureCode: claim.cptCode,
                modifier: "25",
                billedAmount: claim.billedAmount,
                denialReasonCode: "CO-97",
                payerName: "BlueCross Core",
                extractedTextRaw: claim.denialReason
            },
            analysisData: {
                isRecoverable: true,
                confidenceScore: 94.2,
                payerGuidelineFound: "CMS NCCI manual chapter 11 allows modifier 25 with CPT 99291.",
                medicalNecessityJustification: "Documentation supports distinct service."
            }
        };

    } catch (e: any) {
        console.error("Auto-Save Persistence Failure:", e);
        return { success: false, error: e.message || "Pipeline failed to persist data." };
    }
}
