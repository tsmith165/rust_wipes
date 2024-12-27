import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { fetchUserCredits } from '@/app/gambling/serverActions';

interface SteamProfile {
    name: string;
    avatarUrl: string;
    steamId: string;
}

interface SteamUserState {
    steamInput: string;
    authCode: string;
    steamId: string;
    profile: SteamProfile | null;
    credits: number;
    isVerified: boolean;
    error: string;

    // Actions
    setSteamInput: (input: string) => void;
    setAuthCode: (code: string) => void;
    setSteamId: (id: string) => void;
    setProfile: (profile: SteamProfile | null) => void;
    setCredits: (credits: number) => void;
    setIsVerified: (verified: boolean) => void;
    setError: (error: string) => void;

    // Complex actions
    loadUserData: () => Promise<void>;
    clearUserData: () => void;
    verifyUser: (profileData: any) => void;
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
            isVerified: false,
            error: '',

            // Simple actions
            setSteamInput: (input) => set({ steamInput: input }),
            setAuthCode: (code) => set({ authCode: code }),
            setSteamId: (id) => set({ steamId: id }),
            setProfile: (profile) => set({ profile }),
            setCredits: (credits) => set({ credits }),
            setIsVerified: (verified) => set({ isVerified: verified }),
            setError: (error) => set({ error }),

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
                            profile: result.data.profile,
                            credits: result.data.credits,
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
                    get().clearUserData();
                    set({
                        isVerified: false,
                        error: 'An unexpected error occurred loading user data',
                    });
                }
            },

            clearUserData: () => {
                // Clear cookies
                Cookies.remove('steamInput');
                Cookies.remove('authCode');
                Cookies.remove('steamId');

                // Reset state
                set({
                    steamInput: '',
                    authCode: '',
                    steamId: '',
                    profile: null,
                    credits: 0,
                    isVerified: false,
                    error: '',
                });
            },

            verifyUser: (profileData) => {
                const { profile, credits } = profileData;
                set({
                    profile,
                    steamId: profile.steamId,
                    credits,
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
            }),
        },
    ),
);

// Optional: Add a subscription to sync with cookies
useSteamUser.subscribe((state, prevState) => {
    if (
        state.isVerified &&
        (state.steamInput !== prevState.steamInput || state.authCode !== prevState.authCode || state.steamId !== prevState.steamId)
    ) {
        Cookies.set('steamInput', state.steamInput, { expires: 7 });
        Cookies.set('authCode', state.authCode, { expires: 7 });
        Cookies.set('steamId', state.steamId, { expires: 7 });
    } else if (!state.isVerified && prevState.isVerified) {
        Cookies.remove('steamInput');
        Cookies.remove('authCode');
        Cookies.remove('steamId');
    }
});