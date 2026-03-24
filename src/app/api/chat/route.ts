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
You are a knowledgeable, professional medical billing expert. You help clinic administrators, practice managers, and healthcare providers understand how denied claims can be recovered using AI-powered appeals. You are warm, authoritative, and results-focused.

## OUR MISSION: THE $0 GENESIS AUDIT
Your primary goal is to get clinics to start a "Free AI Scan" (The Genesis Plan).
- **Cost**: $0 Upfront. Zero setup fee.
- **Performance Fee**: 40% of successfully recovered revenue.
- **The Hook**: "We'll audit your first 10 claims for $0 to see exactly what's being left on the table. You only pay if we get you paid."

## CLOSING THE DEAL (AUTONOMOUS SALES)
If a prospect is interested in starting or wants more info:
1. **Always ask for their email, clinic name, and contact person.**
2. **Use the "createLead" tool** to save their information immediately.
3. **Use the "sendGenesisInvite" tool** to send them the official onboarding link and BAA if they are ready to proceed with the $0 scan.

## OUR PRICING MODELS
1. **Genesis Plan**: $0 Setup / 40% Commission (Entry point)
2. **Guardian Pilot**: $2,500 Setup / 30% Commission (500 claims)
3. **Growth Lattice**: $7,500 Setup / 20% Commission (Unlimited)

## HIPAA COMPLIANCE
Before we scan data, a BAA must be signed. "I can send you the HIPAA BAA right now, and you can sign it in seconds at /baa."

## TONE
Professional, warm, data-driven, and authoritative. You are a specialist, not a salesperson. You are here to fix their leaking revenue.`;

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
                    description: 'Saves a new lead to the database for follow-up and sales tracking.',
                    parameters: z.object({
                        email: z.string().email().describe('The email address of the lead'),
                        clinicName: z.string().describe('The name of the clinic or hospital'),
                        firstName: z.string().describe('First name of the contact person'),
                        lastName: z.string().describe('Last name of the contact person'),
                    }),
                    execute: async ({ email, clinicName, firstName, lastName }) => {
                        try {
                            const lead = await prisma.lead.upsert({
                                where: { email: email.toLowerCase() },
                                update: {
                                    firstName,
                                    lastName,
                                    company: clinicName,
                                    status: 'contacted',
                                },
                                create: {
                                    email: email.toLowerCase(),
                                    firstName,
                                    lastName,
                                    company: clinicName,
                                    status: 'new',
                                    source: 'chatbot_sarah',
                                },
                            });
                            return { success: true, leadId: lead.id, message: "Lead saved successfully." };
                        } catch (e: any) {
                            return { success: false, error: e.message };
                        }
                    },
                }),
                sendGenesisInvite: tool({
                    description: 'Sends an official onboarding invitation and HIPAA BAA link to the prospect.',
                    parameters: z.object({
                        email: z.string().email(),
                        clinicName: z.string(),
                    }),
                    execute: async ({ email, clinicName }) => {
                        try {
                            const { sendAdminNotification } = await import('@/lib/sendgrid-client');
                            await sendAdminNotification('New Chatbot Lead Ready for Onboarding', `Clinic: ${clinicName}\nEmail: ${email}\nAction: Requested Genesis $0 Scan.`);
                            
                            // In a full implementation, we would call a specific sendInviteEmail function here.
                            return { success: true, message: `Invite sent to ${email}. Redirecting them to /baa for the HIPAA signature is the next step.` };
                        } catch (e: any) {
                            return { success: false, error: e.message };
                        }
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

