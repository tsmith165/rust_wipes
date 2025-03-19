'use client';

import { create } from 'zustand';
import { getGiveawayData } from '@/actions/Giveaway.Actions';

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
    allTopPlayers: Player[];
    playersByPage: Map<number, Player[]>;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
    // Actions
    fetchQualifiedCount: () => Promise<void>;
    fetchAllTopPlayers: () => Promise<void>;
    fetchPlayerPage: (page: number) => Promise<void>;
    setCurrentPage: (page: number) => void;
}

const PLAYERS_PER_PAGE = 3;
const MAX_PAGES = 10; // Ensure we have exactly 10 pages

export const useGiveawayStore = create<GiveawayStore>((set, get) => ({
    // Progress data
    qualifiedCount: 0,
    hasLoadedQualifiedCount: false,
    // Pagination data
    totalPlayers: 0,
    allTopPlayers: [],
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

    fetchAllTopPlayers: async () => {
        const store = get();
        // Skip if we already have data
        if (store.allTopPlayers.length > 0) return;

        set({ isLoading: true, error: null });
        try {
            const data = await getGiveawayData(0, PLAYERS_PER_PAGE, true);

            if (!data.allTopPlayers) {
                throw new Error('Failed to fetch all top players');
            }

            // Create a map of players by page
            const playersByPage = new Map<number, Player[]>();
            const allPlayers = data.allTopPlayers;

            // Always create exactly MAX_PAGES (10) pages, even if we need to repeat players
            for (let page = 0; page < MAX_PAGES; page++) {
                // Calculate the start index with wrapping
                const startIndex = (page * PLAYERS_PER_PAGE) % allPlayers.length;

                // Get players for this page, wrapping around if needed
                const playersForPage: Player[] = [];
                for (let i = 0; i < PLAYERS_PER_PAGE; i++) {
                    const playerIndex = (startIndex + i) % allPlayers.length;
                    playersForPage.push(allPlayers[playerIndex]);
                }

                playersByPage.set(page, playersForPage);
            }

            set({
                allTopPlayers: data.allTopPlayers,
                totalPlayers: Math.max(data.totalPlayers, MAX_PAGES * PLAYERS_PER_PAGE), // Ensure totalPlayers supports 10 pages
                playersByPage,
                isLoading: false,
                qualifiedCount: data.qualifiedCount,
                hasLoadedQualifiedCount: true,
            });
        } catch (error) {
            console.error('Failed to fetch all top players:', error);
            set({ error: 'Failed to fetch all top players', isLoading: false });
        }
    },

    fetchPlayerPage: async (page: number) => {
        const store = get();

        // If we have all top players, just get the page from our cache
        if (store.allTopPlayers.length > 0) {
            if (store.playersByPage.has(page)) {
                // Page is already in our cache
                return;
            }

            // Implement circular pagination
            const normalizedPage = page % MAX_PAGES;
            if (store.playersByPage.has(normalizedPage)) {
                return;
            }

            // This shouldn't happen if we've preloaded all pages
            console.warn('Missing page in cache, adding it now');
            const startIndex = normalizedPage * PLAYERS_PER_PAGE;
            const playersForPage = store.allTopPlayers.slice(startIndex, startIndex + PLAYERS_PER_PAGE);
            set((state) => {
                const newPlayersByPage = new Map(state.playersByPage);
                newPlayersByPage.set(normalizedPage, playersForPage);
                return { playersByPage: newPlayersByPage };
            });
            return;
        }

        // If we don't have all top players yet, fetch them
        await get().fetchAllTopPlayers();
    },

    setCurrentPage: (page: number) => {
        // Always use the constant MAX_PAGES (10) for pagination
        const normalizedPage = ((page % MAX_PAGES) + MAX_PAGES) % MAX_PAGES;

        // Update the current page in the store
        set({ currentPage: normalizedPage });

        // Ensure we have the players data for this page
        get().fetchPlayerPage(normalizedPage);
    },
}));
