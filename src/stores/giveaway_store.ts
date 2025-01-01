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
    // Progress data
    qualifiedCount: number;
    hasLoadedQualifiedCount: boolean;
    // Pagination data
    totalPlayers: number;
    playersByPage: Map<number, Player[]>;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
    // Actions
    fetchQualifiedCount: () => Promise<void>;
    fetchPlayerPage: (page: number) => Promise<void>;
    setCurrentPage: (page: number) => void;
}

export const useGiveawayStore = create<GiveawayStore>((set, get) => ({
    // Progress data
    qualifiedCount: 0,
    hasLoadedQualifiedCount: false,
    // Pagination data
    totalPlayers: 0,
    playersByPage: new Map(),
    currentPage: 0,
    isLoading: false,
    error: null,

    fetchQualifiedCount: async () => {
        // Only fetch if we haven't loaded it yet
        if (get().hasLoadedQualifiedCount) return;

        try {
            const data = await getGiveawayData(0);
            set({
                qualifiedCount: data.qualifiedCount,
                hasLoadedQualifiedCount: true,
            });
        } catch (error) {
            console.error('Failed to fetch qualified count:', error);
            set({ error: 'Failed to fetch qualified count' });
        }
    },

    fetchPlayerPage: async (page: number) => {
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
                    totalPlayers: data.totalPlayers,
                    playersByPage: newPlayersByPage,
                    isLoading: false,
                    // Only update qualified count if we haven't loaded it yet
                    ...(!state.hasLoadedQualifiedCount
                        ? {
                              qualifiedCount: data.qualifiedCount,
                              hasLoadedQualifiedCount: true,
                          }
                        : {}),
                };
            });
        } catch (error) {
            console.error('Failed to fetch player page:', error);
            set({ error: 'Failed to fetch player page', isLoading: false });
        }
    },

    setCurrentPage: (page: number) => {
        set({ currentPage: page });
        get().fetchPlayerPage(page);
    },
}));
