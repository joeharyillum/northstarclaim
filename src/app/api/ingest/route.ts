import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { getOwnerSession } from '@/lib/owner-session';
import { checkRateLimit } from '@/lib/security';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for large PDFs

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "mock-key",
});

export async function POST(request: Request) {
    const session = await getOwnerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate Limit: 20 ingestions per minute per user
    if (!checkRateLimit(session.user.id, 20)) {
        return NextResponse.json({ error: "High upload frequency detected. System cooling in progress." }, { status: 429 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // --- FILE SIZE VALIDATION: 20MB MAX ---
        const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
        if (fileBuffer.byteLength > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Maximum allowed size is 20MB.' },
                { status: 413 }
            );
        }

        // --- ENTERPRISE SECURITY: TEMP VAULT STORAGE ---
        // Write to /tmp for serverless compatibility (Vercel/Railway)
        const tmpDir = path.join('/tmp', 'claims');
        await mkdir(tmpDir, { recursive: true });
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const vaultPath = path.join(tmpDir, `${Date.now()}-${safeFileName}`);
        await writeFile(vaultPath, fileBuffer);
        const vaultUrl = `/tmp/claims/${path.basename(vaultPath)}`;

        console.log("🔒 Document Vaulted Securely:", vaultUrl);

        // 1. Process File based on type
        let textData = '';
        if (file.type === 'application/pdf') {
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(fileBuffer);
            textData = data.text;
        } else if (file.type === 'text/csv' || file.type === 'text/plain') {
            textData = fileBuffer.toString('utf8');
        } else {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        let extractedClaim;

        if (process.env.OPENAI_API_KEY) {

            // --- STEP 1: AI DOCUMENT VALIDATION ---
            // Ensure the uploaded file is actually a medical claim/EOB and not a random file.
            const validationResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are a strict Medical Data Security Gatekeeper. Review the provided text extract and determine if it appears to be a medical billing document, an Explanation of Benefits (EOB), an 835 file, or clinical notes related to billing. If it is random text, a resume, a recipe, or any non-medical file, you MUST reject it.
Respond in strict JSON with a single key:
- isValidMedicalDocument: boolean`
                    },
                    {
                        role: "user",
                        content: `Analyze this text extract:\n\n${textData.substring(0, 1000)}`
                    }
                ]
            });

            const validationData = JSON.parse(validationResponse.choices[0].message.content || "{}");

            if (!validationData.isValidMedicalDocument) {
                console.log("🚫 AI Rejected Upload: Document does not appear to contain medical billing data.");
                return NextResponse.json({
                    error: "Invalid Document Type. The AI engine determined this file does not contain valid medical billing or EOB data. Please upload a relevant claim file."
                }, { status: 400 });
            }

            console.log("✅ AI Validation Passed: Document identified as medical billing data.");

            // --- STEP 2: Extraction using pdf-parse & OpenAI Structured Output ---
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are an elite Medical Billing AI. Extract the claim details from the provided medical document text.
You must respond in strict JSON format with ONLY these keys:
- patientId: string
- dateOfService: string (YYYY-MM-DD)
- procedureCode: string (The CPT code)
- modifier: string (if any, otherwise "")
- billedAmount: number
- denialReasonCode: string (e.g., CO-16, PR-1)
- extractedTextRaw: string (A brief 1-2 sentence summary of the denial reason)`
                    },
                    {
                        role: "user",
                        content: `Extract from this text:\n\n${textData.substring(0, 4000)}`
                    }
                ]
            });

            const aiData = JSON.parse(response.choices[0].message.content || "{}");
            extractedClaim = {
                id: `CLM-${Math.floor(Math.random() * 100000)}`,
                ...aiData
            };
        } else {
            return NextResponse.json({ error: 'OpenAI API key is not configured. Contact support.' }, { status: 503 });
        }

        // 4. Persistence: Auto-Save to Prisma
        const userId = session.user?.id;
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }
        const batch = await prisma.uploadBatch.create({
            data: {
                userId,
                fileName: file.name || "api-upload.pdf",
                status: "COMPLETED"
            }
        });

        const claim = await prisma.claim.create({
            data: {
                batchId: batch.id,
                patientId: extractedClaim.patientId,
                cptCode: extractedClaim.procedureCode || "99291",
                billedAmount: extractedClaim.billedAmount,
                denialReason: extractedClaim.denialReasonCode || "Unknown Denial",
                status: "RECOVERABLE"
            }
        });

        return NextResponse.json({
            success: true,
            batchId: batch.id,
            claimId: claim.id,
            vaultUrl,
            analysis: extractedClaim
        });

    } catch (error) {
        console.error("Ingestion Error:", error);
        return NextResponse.json({ error: 'Failed to ingest document' }, { status: 500 });
    }
}
