'use client';

import InputTextbox from '@/components/inputs/InputTextbox';
import { verifyAndGetCredits } from '@/app/games/Gambling.Actions';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

interface SteamSignInModalProps {
    steamInput: string;
    setSteamInput: (value: string) => void;
    code: string;
    setCode: (value: string) => void;
    onVerify: (profileData: any) => void;
    error?: string;
}

export default function SteamSignInModal({ steamInput, setSteamInput, code, setCode, onVerify, error }: SteamSignInModalProps) {
    // Load cookies on mount
    useEffect(() => {
        const savedSteamInput = Cookies.get('steamInput');
        const savedAuthCode = Cookies.get('authCode');

        if (savedSteamInput && savedAuthCode) {
            setSteamInput(savedSteamInput);
            setCode(savedAuthCode);
        }
    }, [setSteamInput, setCode]);

    // Auto-verify when we have both inputs
    useEffect(() => {
        const autoVerify = async () => {
            if (steamInput && code) {
                try {
                    const result = await verifyAndGetCredits(steamInput, code);
                    if (result.success && result.data) {
                        // Save to cookies immediately on successful verification
                        Cookies.set('steamInput', steamInput, { expires: 7 });
                        Cookies.set('authCode', code, { expires: 7 });
                        onVerify(result.data);
                    }
                } catch (error) {
                    console.error('Error auto-verifying Steam profile:', error);
                }
            }
        };

        autoVerify();
    }, [steamInput, code, onVerify]);

    const handleVerify = async () => {
        try {
            const result = await verifyAndGetCredits(steamInput, code);
            if (result.success && result.data) {
                // Save to cookies immediately on successful verification
                Cookies.set('steamInput', steamInput, { expires: 7 });
                Cookies.set('authCode', code, { expires: 7 });
                onVerify(result.data);
            }
        } catch (error) {
            console.error('Error verifying Steam profile:', error);
        }
    };

    return (
        <div className="h-fit w-fit rounded-lg bg-stone-700 p-4">
            <div className="mb-4 flex h-full w-[90vw] flex-col items-center justify-center space-y-2 sm:w-[80vw] md:w-[60vw] lg:w-[40vw]">
                <h2 className="mb-4 text-2xl font-bold text-white">Steam Profile Sign-In</h2>

                <InputTextbox
                    idName="steam_input"
                    name="Steam Profile"
                    value={steamInput}
                    onChange={(e) => setSteamInput(e.target.value)}
                    placeholder="Enter your Steam Profile URL"
                    labelWidth="lg"
                />
                <InputTextbox
                    idName="auth_code"
                    name="Auth Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your code"
                    labelWidth="lg"
                />
                <p className="text-center text-primary_light">Type '/auth' in game to get your auth code</p>
                <p className="text-center text-stone-400">Earn credits for every hour you spend on our servers!</p>
                <button
                    onClick={handleVerify}
                    className="mt-2 rounded bg-primary px-4 py-2 text-stone-400 hover:bg-primary_light hover:text-stone-900"
                >
                    Verify
                </button>
                {error && <p className="mt-2 text-red-500">{error}</p>}
            </div>
        </div>
    );
}
