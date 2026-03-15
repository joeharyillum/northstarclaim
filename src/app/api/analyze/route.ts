import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOwnerSession } from '@/lib/owner-session';
import { checkRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Initialize OpenAI. It expects process.env.OPENAI_API_KEY to be set.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: Request) {
    const session = await getOwnerSession();

    // Rate Limit: 30 requests per minute per user for analysis
    if (!checkRateLimit(session.user?.id || "unknown", 30)) {
        return NextResponse.json({ error: "High-frequency analysis detected. Please wait 60 seconds." }, { status: 429 });
    }

    try {
        const body = await request.json();
        const { procedureCode, modifier, denialReasonCode, extractedTextRaw } = body;

        if (!process.env.OPENAI_API_KEY) {
            // MOCK RESPONSE IF NO API KEY IS SET (To keep the demo working)
            await new Promise(resolve => setTimeout(resolve, 2000));
            return NextResponse.json({
                isRecoverable: true,
                confidenceScore: 98,
                payerGuidelineFound: `CMS NCCI manual chapter 11 allows modifier ${modifier} with CPT ${procedureCode}.`,
                medicalNecessityJustification: "The clinical documentation supports a distinct and separate procedural service, rendering the unbundling denial invalid."
            });
        }

        // REAL OPENAI CALL WITH STRUCTURED OUTPUT (JSON MODE)
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are an elite Medical Billing Auditor and Appeals Specialist. 
          Your job is to analyze a denied insurance claim and determine legally if the claim is recoverable based on federal CMS guidelines and CPT coding rules.
          You must respond in strict JSON format with the following keys:
          - isRecoverable: boolean
          - confidenceScore: number (0-100)
          - payerGuidelineFound: string (Cite the specific CMS or AMA rule that proves the payer wrong)
          - medicalNecessityJustification: string (Briefly explain why this procedure was medically necessary)`
                },
                {
                    role: "user",
                    content: `Analyze this denied claim: 
          CPT Code: ${procedureCode}
          Modifier: ${modifier}
          Denial Code: ${denialReasonCode}
          Raw Payer Note: ${extractedTextRaw}`
                }
            ]
        });

        const analysis = JSON.parse(response.choices[0].message.content || "{}");

        return NextResponse.json(analysis);

    } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: 'Failed to analyze claim data' }, { status: 500 });
    }
}
