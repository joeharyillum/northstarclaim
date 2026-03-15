'use server';

import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { auth } from '@/auth';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['application/pdf', 'text/csv', 'text/plain'];

export async function processClaimUpload(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized: HIPAA session required." };
    }

    try {
        const rawFiles = formData.getAll('files') as File[];
        const files = rawFiles.length > 0 ? rawFiles : [];
        if (files.length === 0) {
            const single = formData.get('file') as File;
            if (single) files.push(single);
        }
        if (files.length === 0) return { success: false, error: "No files found." };

        const file = files[0];

        // Validate file size and type
        if (file.size > MAX_FILE_SIZE) {
            return { success: false, error: "File too large. Maximum 20MB." };
        }
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !['pdf', 'csv', 'txt'].includes(ext)) {
            return { success: false, error: "Unsupported file type. Upload PDF, CSV, or TXT." };
        }

        // 1. Create Upload Batch
        const batch = await prisma.uploadBatch.create({
            data: {
                userId: session.user.id,
                fileName: file.name,
                status: "PARSING",
            },
        });

        // 2. Vault the file temporarily for processing
        // Use /tmp for serverless compatibility (Vercel/Railway)
        const tmpDir = path.join('/tmp', 'vault', batch.id);
        await mkdir(tmpDir, { recursive: true });
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = path.join(tmpDir, safeFileName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // 3. Extract text from the file
        let textData = '';
        if (ext === 'pdf') {
            const pdfParse = require('pdf-parse');
            const parsed = await pdfParse(buffer);
            textData = parsed.text;
        } else {
            textData = buffer.toString('utf8');
        }

        if (!textData.trim()) {
            await prisma.uploadBatch.update({ where: { id: batch.id }, data: { status: "FAILED" } });
            return { success: false, error: "Could not extract text from file. The PDF may be image-based — try a text-based export." };
        }

        // 4. AI Validation — is this actually a medical billing document?
        const validation = await openai.chat.completions.create({
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `You are a Medical Data Security Gatekeeper. Determine if the text is from a medical billing document, EOB, 835, or clinical notes related to billing. Respond in JSON: { "isValidMedicalDocument": boolean }`,
                },
                { role: 'user', content: textData.substring(0, 1500) },
            ],
        });
        const valResult = JSON.parse(validation.choices[0].message.content || '{}');
        if (!valResult.isValidMedicalDocument) {
            await prisma.uploadBatch.update({ where: { id: batch.id }, data: { status: "FAILED" } });
            return { success: false, error: "This file does not appear to contain medical billing data. Please upload an ERA 835, EOB, or claim export." };
        }

        // 5. AI Extraction — pull structured claim data
        const isCSV = ext === 'csv';
        const extractionPrompt = isCSV
            ? `You are an elite Medical Billing AI. This is a CSV file containing denied medical claims. Extract ALL claims found (up to 50). For each claim, extract the fields listed below. Respond in JSON: { "claims": [{ "patientId": string, "dateOfService": string (YYYY-MM-DD), "procedureCode": string (CPT code), "modifier": string, "billedAmount": number, "denialReasonCode": string (e.g. CO-16, PR-1, CO-97), "denialReasonText": string, "payerName": string }] }`
            : `You are an elite Medical Billing AI. Extract claim details from this medical document. If multiple claims are found, extract all (up to 50). Respond in JSON: { "claims": [{ "patientId": string, "dateOfService": string (YYYY-MM-DD), "procedureCode": string (CPT code), "modifier": string, "billedAmount": number, "denialReasonCode": string (e.g. CO-16, PR-1, CO-97), "denialReasonText": string, "payerName": string }] }`;

        const extraction = await openai.chat.completions.create({
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: extractionPrompt },
                { role: 'user', content: textData.substring(0, 8000) },
            ],
        });
        const extracted = JSON.parse(extraction.choices[0].message.content || '{"claims":[]}');
        const claimsData = Array.isArray(extracted.claims) ? extracted.claims : [];

        if (claimsData.length === 0) {
            await prisma.uploadBatch.update({ where: { id: batch.id }, data: { status: "FAILED" } });
            return { success: false, error: "AI could not extract any claims from this file. Try a different format or check the file content." };
        }

        // 6. Persist all extracted claims
        const createdClaims = [];
        for (const c of claimsData) {
            const claim = await prisma.claim.create({
                data: {
                    batchId: batch.id,
                    patientId: c.patientId || 'UNKNOWN',
                    cptCode: c.procedureCode || 'UNKNOWN',
                    billedAmount: typeof c.billedAmount === 'number' ? c.billedAmount : 0,
                    denialReason: `${c.denialReasonCode || 'UNKNOWN'}: ${c.denialReasonText || 'No reason provided'}`,
                    status: 'PENDING_ANALYSIS',
                },
            });
            createdClaims.push(claim);
        }

        // 7. Update batch status
        await prisma.uploadBatch.update({
            where: { id: batch.id },
            data: { status: "COMPLETED" },
        });

        // 8. HIPAA audit log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'CLAIM_UPLOAD',
                details: `Uploaded ${file.name} — ${createdClaims.length} claims extracted. Batch: ${batch.id}`,
            },
        });

        return {
            success: true,
            batchId: batch.id,
            claimsCount: createdClaims.length,
            claims: createdClaims.map((cl) => ({
                id: cl.id,
                patientId: cl.patientId,
                cptCode: cl.cptCode,
                billedAmount: cl.billedAmount,
                denialReason: cl.denialReason,
                status: cl.status,
            })),
        };
    } catch (e: any) {
        console.error("Claim upload error:", e);
        return { success: false, error: e.message || "Pipeline failed." };
    }
}
