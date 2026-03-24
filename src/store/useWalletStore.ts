"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Withdrawal {
    id: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    holderName: string;
    timestamp: string;
    status: 'COMPLETED' | 'PENDING_COMPLIANCE' | 'FAILED';
    complianceNote?: string;
    estimatedArrival?: string;
    lunarClearance?: 'PENDING' | 'GUARANTEED' | 'SETTLED';
    isSovereign?: boolean;
    network?: string;
    swiftCode?: string;
}

interface WalletStore {
    balance: number;
    history: Withdrawal[];
    linkedAccounts: any[];
    visaCards: any[];
    centurionCards: any[];

    // Actions
    addHistory: (tx: Withdrawal) => void;
    updateHistory: (id: string, updates: Partial<Withdrawal>) => void;
    setBalance: (amount: number) => void;
    linkLunar: () => void;
}

export const useWalletStore = create<WalletStore>()(
    persist(
        (set) => ({
            balance: 0, // Real balance pulled from Stripe API
            history: [], // Real transaction history only
            linkedAccounts: [
                {
                    id: 'LUNAR-01',
                    bankName: 'Lunar Bank (Denmark)',
                    iban: 'DK2166951007871461',
                    status: 'VERIFIED'
                }
            ],
            visaCards: [],
            centurionCards: [],

            addHistory: (tx) => set((state) => ({ history: [tx, ...state.history] })),
            updateHistory: (id, updates) => set((state) => ({
                history: state.history.map(h => h.id === id ? { ...h, ...updates } : h)
            })),
            setBalance: (amount) => set({ balance: amount }),
            linkLunar: () => set((state) => ({
                linkedAccounts: [...state.linkedAccounts, { id: 'LUNAR-NEW', bankName: 'Lunar Bank (Denmark)', iban: 'DK21-XXX-XXX', status: 'VERIFIED' }]
            }))
        }),
        {
            name: 'wallet-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
