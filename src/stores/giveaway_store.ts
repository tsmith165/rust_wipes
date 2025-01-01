'use client';

import { create } from 'zustand';
import { getGiveawayData } from '@/app/actions/giveaway/Giveaway.Actions';

interface Player {
    player_name: string;
    minutes_played: number;
    steam_id: string;
    profile_picture?: string | null;
}

interface GiveawayStore {
    qualifiedCount: number;
    totalPlayers: number;
    playersByPage: Map<number, Player[]>;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
    fetchData: (page: number) => Promise<void>;
    setCurrentPage: (page: number) => void;
}

export const useGiveawayStore = create<GiveawayStore>((set, get) => ({
    qualifiedCount: 0,
    totalPlayers: 0,
    playersByPage: new Map(),
    currentPage: 0,
    isLoading: false,
    error: null,
    fetchData: async (page: number) => {
        const store = get();
        // If we already have the data for this page and it's not the initial load, return
        if (store.playersByPage.has(page) && store.totalPlayers > 0) {
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const data = await getGiveawayData(page);
            set((state) => {
                const newPlayersByPage = new Map(state.playersByPage);
                newPlayersByPage.set(page, data.topPlayers);
                return {
                    qualifiedCount: data.qualifiedCount,
                    totalPlayers: data.totalPlayers,
                    playersByPage: newPlayersByPage,
                    isLoading: false,
                };
            });
        } catch (error) {
            console.error('Failed to fetch giveaway data:', error);
            set({ error: 'Failed to fetch giveaway data', isLoading: false });
        }
    },
    setCurrentPage: (page: number) => {
        set({ currentPage: page });
        get().fetchData(page);
    },
}));
