import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchUserCredits } from '@/app/games/Gambling.Actions';

interface SteamProfile {
    name: string;
    avatarUrl: string;
    steamId: string;
    code: string;
}

interface SteamUserProfile {
    profile: {
        name: string;
        avatarUrl: string;
        steamId: string;
    };
    credits?: number;
    freeSpins?: number;
}

interface SteamUserState {
    steamInput: string;
    authCode: string;
    steamId: string;
    profile: SteamProfile | null;
    credits: number;
    freeSpins: number;
    isVerified: boolean;
    error: string;

    // Actions
    setSteamInput: (input: string) => void;
    setAuthCode: (code: string) => void;
    setSteamId: (id: string) => void;
    setProfile: (profile: SteamProfile | null) => void;
    setCredits: (credits: number) => void;
    setFreeSpins: (spins: number) => void;
    setIsVerified: (verified: boolean) => void;
    setError: (error: string) => void;

    // Update credits from game action responses
    updateCreditsFromServerResponse: (credits: number, freeSpins?: number) => void;

    // Complex actions
    loadUserData: () => Promise<void>;
    clearUserData: () => void;
    verifyUser: (profileData: SteamUserProfile) => void;
}

export const useSteamUser = create<SteamUserState>()(
    persist(
        (set, get) => ({
            // Initial state
            steamInput: '',
            authCode: '',
            steamId: '',
            profile: null,
            credits: 0,
            freeSpins: 0,
            isVerified: false,
            error: '',

            // Simple actions
            setSteamInput: (input) => set({ steamInput: input }),
            setAuthCode: (code) => set({ authCode: code }),
            setSteamId: (id) => set({ steamId: id }),
            setProfile: (profile) => set({ profile }),
            setCredits: (credits) => set({ credits }),
            setFreeSpins: (spins) => set({ freeSpins: spins }),
            setIsVerified: (verified) => set({ isVerified: verified }),
            setError: (error) => set({ error }),

            // Update credits directly from server responses
            updateCreditsFromServerResponse: (credits, freeSpins) => {
                set({
                    credits,
                    freeSpins: freeSpins !== undefined ? freeSpins : get().freeSpins,
                });
            },

            // Complex actions
            loadUserData: async () => {
                const { steamId, authCode } = get();
                if (!steamId || !authCode) {
                    set({ isVerified: false });
                    return;
                }

                try {
                    const result = await fetchUserCredits(steamId, authCode);
                    if (result.success && result.data) {
                        set({
                            profile: {
                                ...result.data.profile,
                                code: authCode,
                            },
                            credits: result.data.credits,
                            freeSpins: result.data.freeSpins,
                            isVerified: true,
                            error: '',
                        });
                    } else {
                        get().clearUserData();
                        set({
                            isVerified: false,
                            error: result.error || 'Failed to load user data',
                        });
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                    get().clearUserData();
                    set({
                        isVerified: false,
                        error: 'An unexpected error occurred loading user data',
                    });
                }
            },

            clearUserData: () => {
                set({
                    steamInput: '',
                    authCode: '',
                    steamId: '',
                    profile: null,
                    credits: 0,
                    freeSpins: 0,
                    isVerified: false,
                    error: '',
                });
            },

            verifyUser: (profileData) => {
                if (!profileData || !profileData.profile || !profileData.profile.steamId) {
                    console.error('Invalid profile data:', profileData);
                    set({ error: 'Invalid profile data received' });
                    return;
                }

                const { profile, credits, freeSpins } = profileData;
                set({
                    profile: {
                        ...profile,
                        code: get().authCode,
                    },
                    steamId: profile.steamId,
                    credits: credits || 0,
                    freeSpins: freeSpins || 0,
                    isVerified: true,
                    error: '',
                });
            },
        }),
        {
            name: 'steam-user-storage',
            partialize: (state) => ({
                steamInput: state.steamInput,
                authCode: state.authCode,
                steamId: state.steamId,
                isVerified: state.isVerified,
            }),
        },
    ),
);
