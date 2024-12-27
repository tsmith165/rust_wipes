'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { fetchUserCredits } from '../serverActions';

interface SteamProfile {
    name: string;
    avatarUrl: string;
    steamId: string;
}

interface SteamUserContextType {
    steamInput: string;
    setSteamInput: (input: string) => void;
    authCode: string;
    setAuthCode: (code: string) => void;
    steamId: string;
    setSteamId: (id: string) => void;
    profile: SteamProfile | null;
    setProfile: (profile: SteamProfile | null) => void;
    credits: number;
    setCredits: (credits: number) => void;
    freeSpins: number;
    setFreeSpins: (spins: number) => void;
    isVerified: boolean;
    setIsVerified: (verified: boolean) => void;
    error: string;
    setError: (error: string) => void;
}

const SteamUserContext = createContext<SteamUserContextType | undefined>(undefined);

export function SteamUserProvider({ children }: { children: ReactNode }) {
    const [steamInput, setSteamInput] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [steamId, setSteamId] = useState('');
    const [profile, setProfile] = useState<SteamProfile | null>(null);
    const [credits, setCredits] = useState(0);
    const [freeSpins, setFreeSpins] = useState(0);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('useEffect triggered - Loading cookies');
        // Load from cookies on mount
        const savedSteamInput = Cookies.get('steamInput');
        const savedAuthCode = Cookies.get('authCode');
        const savedSteamId = Cookies.get('steamId');

        if (savedSteamInput && savedAuthCode && savedSteamId) {
            setSteamInput(savedSteamInput);
            setAuthCode(savedAuthCode);
            setSteamId(savedSteamId);

            // Fetch user data using server action with steamId
            const loadUserData = async () => {
                console.log('Loading user data with steamId:', savedSteamId, 'and authCode:', savedAuthCode);
                const result = await fetchUserCredits(savedSteamId, savedAuthCode);
                if (result.success && result.data) {
                    console.log('User data loaded successfully:', result.data);
                    setProfile(result.data.profile);
                    setCredits(result.data.credits);
                    setFreeSpins(result.data.freeSpins);
                    setIsVerified(true);
                    setError('');
                } else {
                    console.log('Error loading user data:', result.error);
                    // Clear all cookies and state on error
                    Cookies.remove('steamInput');
                    Cookies.remove('authCode');
                    Cookies.remove('steamId');
                    setProfile(null);
                    setCredits(0);
                    setFreeSpins(0);
                    setIsVerified(false);
                    setError(result.error || 'Failed to load user data');
                }
            };
            loadUserData();
        }
    }, []);

    useEffect(() => {
        // Save to cookies whenever values change
        if (steamInput && authCode && steamId && isVerified) {
            Cookies.set('steamInput', steamInput, { expires: 7 });
            Cookies.set('authCode', authCode, { expires: 7 });
            Cookies.set('steamId', steamId, { expires: 7 });
        } else if (!isVerified) {
            Cookies.remove('steamInput');
            Cookies.remove('authCode');
            Cookies.remove('steamId');
        }
    }, [steamInput, authCode, steamId, isVerified]);

    const contextValue = {
        steamInput,
        setSteamInput,
        authCode,
        setAuthCode,
        steamId,
        setSteamId,
        profile,
        setProfile,
        credits,
        setCredits,
        freeSpins,
        setFreeSpins,
        isVerified,
        setIsVerified,
        error,
        setError,
    };

    return <SteamUserContext.Provider value={contextValue}>{children}</SteamUserContext.Provider>;
}

export function useSteamUser() {
    const context = useContext(SteamUserContext);
    if (context === undefined) {
        throw new Error('useSteamUser must be used within a SteamUserProvider');
    }
    return context;
}
