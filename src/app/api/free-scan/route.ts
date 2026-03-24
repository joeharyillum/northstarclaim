import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit, getClientIp } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export async function POST(req: Request) {
    const ip = getClientIp(req);

    // Rate limit: 3 scans per minute per IP (public endpoint)
    if (!checkRateLimit(`free-scan:${ip}`, 3)) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        const { email, clinicName, fileCount, fileNames } = await req.json();

        if (!email || !clinicName || typeof email !== 'string' || typeof clinicName !== 'string') {
            return NextResponse.json({ error: 'Email and clinic name required' }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'AI engine not configured' }, { status: 503 });
        }

        // Use GPT-4o to generate a realistic recovery estimate for the clinic
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `You are a medical billing recovery analyst. Given a clinic name and the number of claim files uploaded, estimate the recoverable denied claim revenue. Use realistic US healthcare industry averages:

- Average denial rate: 10-15% of all claims
- Average claim value: $5,000-$12,000
- Recovery success rate with AI: 35-42%
- Common denial reasons: Medical Necessity (CO-50), Prior Auth (CO-15), Timely Filing (CO-29), Bundling (CO-97), Duplicate (CO-18)

Respond in JSON with:
{
  "totalClaims": number (estimated total denials per year),
  "recoverableClaims": number,
  "estimatedRecovery": number (annual dollars),
  "avgConfidence": number (0-100),
  "topDenialReasons": string[] (4 most common)
}`
                },
                {
                    role: 'user',
                    content: `Clinic: ${clinicName}\nFiles uploaded: ${fileCount || 0}\nFile names: ${(fileNames || []).join(', ') || 'none'}\n\nEstimate their annual recoverable denied claim revenue.`
                }
            ],
            max_tokens: 500,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No AI response');

        const result = JSON.parse(content);

        return NextResponse.json({
            totalClaims: result.totalClaims || 200,
            recoverableClaims: result.recoverableClaims || 76,
            estimatedRecovery: result.estimatedRecovery || 646000,
            avgConfidence: result.avgConfidence || 82,
            topDenialReasons: result.topDenialReasons || [
                'Medical Necessity (CO-50)',
                'Prior Authorization Missing (CO-15)',
                'Timely Filing (CO-29)',
                'Bundling/Unbundling (CO-97)',
            ],
        });
    } catch (error: any) {
        console.error('[FREE-SCAN] Error:', error.message);
        return NextResponse.json({ error: 'Scan analysis failed' }, { status: 500 });
    }
}
