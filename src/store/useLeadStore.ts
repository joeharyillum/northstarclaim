"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Lead {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  industry?: string;
  location?: string;
  metadata: Record<string, any>;
  status: 'new' | 'enriching' | 'enriched' | 'personalizing' | 'personalized' | 'contacted' | 'failed';
  createdAt: number;
}

interface LeadStore {
  leads: Lead[];
  stats: {
    total: number;
    contacted: number;
    pending: number;
  };
  addLeads: (newLeads: Lead[]) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  clearLeads: () => void;
}

export const useLeadStore = create<LeadStore>()(
  persist(
    (set) => ({
      leads: [],
      stats: {
        total: 1582, // Hardcoded baseline for Phase 60
        contacted: 42,
        pending: 1540,
      },
      addLeads: (newLeads) => set((state) => {
        // Only keep the most recent 100 in-memory for the UI to prevent freezing
        // In a real app, this would be handled via pagination and the DB
        const updatedLeads = [...newLeads.slice(0, 100)];
        return {
          leads: updatedLeads,
          stats: {
            total: state.stats.total + newLeads.length,
            contacted: state.stats.contacted,
            pending: state.stats.pending + newLeads.length
          }
        };
      }),
      updateLead: (id, updates) => set((state) => {
        const updatedLeads = state.leads.map(l => l.id === id ? { ...l, ...updates } : l);
        return {
          leads: updatedLeads,
          stats: {
            ...state.stats,
            contacted: state.stats.contacted + (updates.status === 'contacted' ? 1 : 0),
            pending: state.stats.pending - (updates.status === 'contacted' ? 1 : 0)
          }
        };
      }),
      clearLeads: () => set({ leads: [], stats: { total: 0, contacted: 0, pending: 0 } }),
    }),
    {
      name: 'lead-storage',
      storage: createJSONStorage(() => localStorage),
      // CRITICAL: Only persist stats, not the massive leads array
      partialize: (state) => ({ stats: state.stats }),
      onRehydrateStorage: () => (state) => {
        // If we have massive legacy data, clear it to unfreeze the UI
        if (state && state.leads && state.leads.length > 500) {
          state.clearLeads();
        }
      }
    }
  )
);
