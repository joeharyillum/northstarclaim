"use client";

import { useLeadStore } from "@/store/useLeadStore";

// Mock AI Personalization Service
// In a real app, this would call Gemini or another LLM
export async function personalizeLead(leadId: string) {
    const store = useLeadStore.getState();
    const lead = store.leads.find((l: any) => l.id === leadId);

    if (!lead) return;

    store.updateLead(leadId, { status: 'personalizing' });

    // Simulate AI Processing
    await new Promise(resolve => setTimeout(resolve, 10));

    const companyName = lead.company || 'your company';
    const industry = lead.industry || 'your industry';

    const personalizedLine = `Hey ${lead.name || 'there'}, I was researching ${companyName} and saw your work in ${industry}. Really impressed by your approach!`;

    store.updateLead(leadId, {
        status: 'personalized',
        metadata: {
            ...lead.metadata,
            personalizedLine
        }
    });
}

export async function bulkPersonalize() {
    const store = useLeadStore.getState();
    const pendingLeads = store.leads.filter((l: any) => l.status === 'new');

    for (const lead of pendingLeads) {
        await personalizeLead(lead.id);
    }
}
