import { NextResponse } from 'next/server';
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { checkRateLimit } from '@/lib/security';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are "Dr. Sarah", a senior medical claims recovery specialist at NorthStar Medic — an AI-powered platform that helps healthcare providers recover denied insurance claims.

## YOUR ROLE
You are a knowledgeable, professional medical billing expert. You help clinic administrators, practice managers, and healthcare providers understand how denied claims can be recovered using AI-powered appeals. You also help "Biller Partners" understand how they can earn passive income by referring their existing clinics to NorthStar.

## FOR CLINICS: THE $0 GENESIS AUDIT
- **Primary Goal**: Get clinics to start a "Free AI Scan" (The Genesis Plan).
- **Cost**: $0 Upfront. Zero setup fee.
- **Performance Fee**: 40% of successfully recovered revenue.
- **The Hook**: "We'll audit your first 10 claims for $0 to see exactly what's being left on the table. You only pay if we get you paid."

## FOR BILLER PARTNERS: THE 40/60 PROFIT SPLIT
If you are talking to a Biller or a Billing Company:
- **The Offer**: You refer your clients to NorthStar. We handle the AI appeals.
- **The Split**: NorthStar pays the Biller **40% of all commissions earned** from that clinic. 
- **Passive Income**: "You own the relationship, we own the AI. You get a check for 40% of our recovery fee every month, just for the introduction."

## PRICING MODELS
1. **Genesis Plan**: $0 Setup / 40% Commission (Entry point)
2. **Guardian Pilot**: $2,500 Setup / 30% Commission (500 claims)
3. **Growth Lattice**: $7,500 Setup / 20% Commission (Unlimited)
4. **MediClaim AI Pilot**: $25,000 Setup (Enterprise networks)
5. **Initial Recovery Retainer**: $50,000 (Historical multi-year scan)
6. **Final Settlement Pack**: $70,000 (Maximum priority bulk settlement)

## HIPAA COMPLIANCE
Before we scan data, a BAA must be signed. "I can send you the HIPAA BAA right now, and you can sign it in seconds at /baa."

## TONE
Professional, warm, data-driven, and authoritative. You are a specialist, not a salesperson.`;

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'anon-chat';

    if (!checkRateLimit(ip, 15)) {
        return new Response("Our system is currently busy. Please try again in a moment.", { status: 429 });
    }

    try {
        const { messages } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "AI engine initializing" }, { status: 503 });
        }

        const result = streamText({
            model: openai('gpt-4o'),
            system: SYSTEM_PROMPT,
            messages: messages.filter((m: any) => m.role === 'user' || m.role === 'assistant' || m.role === 'tool'),
            tools: {
                createLead: tool({
                    description: 'Saves a new lead (Clinic or Biller) to the database.',
                    parameters: z.object({
                        email: z.string().email(),
                        clinicName: z.string(),
                        firstName: z.string(),
                        lastName: z.string(),
                        isBiller: z.boolean().default(false).describe('True if the person is a billing company owner or biller'),
                    }),
                    execute: async ({ email, clinicName, firstName, lastName, isBiller }) => {
                        try {
                            const lead = await prisma.lead.upsert({
                                where: { email: email.toLowerCase() },
                                update: { firstName, lastName, company: clinicName, status: 'contacted' },
                                create: {
                                    email: email.toLowerCase(),
                                    firstName, lastName, company: clinicName,
                                    status: 'new',
                                    source: isBiller ? 'biller_partner_referral' : 'chatbot_sarah',
                                },
                            });
                            return { success: true, leadId: lead.id, message: isBiller ? "Biller partner lead saved." : "Clinic lead saved." };
                        } catch (e: any) {
                            return { success: false, error: e.message };
                        }
                    },
                }),
                sendGenesisInvite: tool({
                    description: 'Sends onboarding links and HIPAA BAA to the prospect.',
                    parameters: z.object({
                        email: z.string().email(),
                        clinicName: z.string(),
                    }),
                    execute: async ({ email, clinicName }) => {
                        try {
                            const { sendAdminNotification } = await import('@/lib/sendgrid-client');
                            await sendAdminNotification('New Chatbot Lead Ready', `Clinic: ${clinicName}\nEmail: ${email}\nRequested Genesis $0 Scan.`);
                            return { success: true, message: `Onboarding link sent to ${email}. Next step: Sign BAA at /baa.` };
                        } catch (e: any) {
                            return { success: false, error: e.message };
                        }
                    },
                }),
                explainBillerModel: tool({
                    description: 'Explains the 40% profit split details for biller partners.',
                    parameters: z.object({
                        billerName: z.string(),
                    }),
                    execute: async ({ billerName }) => {
                        return { 
                            success: true, 
                            details: `NorthStar offers a 40/60 profit split to Biller Partners. For every $1,000 NorthStar recovers for your referred clinic, if we charge a 30% commission ($300), you (the biller) get 40% of that commission ($120) as a passive referral fee. You handle the relationship, we handle the AI heavy lifting.` 
                        };
                    },
                }),
            },
        });

        return result.toUIMessageStreamResponse();

    } catch (error: any) {
        console.error("Chat API Error:", error?.message || 'Unknown error');
        return NextResponse.json({ error: "Connection issue" }, { status: 500 });
    }
}

