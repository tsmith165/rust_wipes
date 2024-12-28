'use client';

import InputTextbox from '@/components/inputs/InputTextbox';
import { verifyAndGetCredits } from '@/app/gambling/Gambling.Actions';
import { useEffect, useState } from 'react';

interface SteamSignInModalProps {
    steamInput: string;
    setSteamInput: (value: string) => void;
    code: string;
    setCode: (value: string) => void;
    onVerify: (profileData: any) => void;
    error?: string;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
}

export default function SteamSignInModal({
    steamInput,
    setSteamInput,
    code,
    setCode,
    onVerify,
    error,
    showModal,
    setShowModal,
}: SteamSignInModalProps) {
    const [verifyError, setVerifyError] = useState<string>('');

    useEffect(() => {
        const autoVerify = async () => {
            if (steamInput && code) {
                try {
                    // Basic URL validation for auto-verify
                    if (!steamInput.includes('steamcommunity.com')) {
                        return;
                    }

                    const result = await verifyAndGetCredits(steamInput, code);
                    if (result.success && result.data) {
                        onVerify(result.data);
                        setShowModal(false); // Close modal on successful verification
                    } else {
                        setVerifyError(result.error || 'Auto-verification failed. Please check your Steam profile URL and auth code.');
                    }
                } catch (error) {
                    console.error('Error auto-verifying Steam profile:', error);
                    setVerifyError('An unexpected error occurred during auto-verification.');
                }
            }
        };

        autoVerify();
    }, [steamInput, code, onVerify, setShowModal]);

    const handleVerify = async () => {
        try {
            setVerifyError('');

            // Basic URL validation
            if (!steamInput.includes('steamcommunity.com')) {
                setVerifyError(
                    'Please enter a valid Steam community profile URL (e.g., https://steamcommunity.com/id/username or https://steamcommunity.com/profiles/123456789)',
                );
                return;
            }

            // Basic code validation
            if (!code) {
                setVerifyError('Please enter your auth code. Type /auth in game to get your code.');
                return;
            }

            const result = await verifyAndGetCredits(steamInput, code);
            if (result.success && result.data) {
                onVerify(result.data);
                setShowModal(false); // Close modal on successful verification
            } else {
                setVerifyError(result.error || 'Verification failed. Please check your Steam profile URL and auth code.');
            }
        } catch (error) {
            console.error('Error verifying Steam profile:', error);
            setVerifyError('An unexpected error occurred. Please try again.');
        }
    };

    if (!showModal) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-65">
            <div className="h-fit w-fit rounded-lg bg-stone-700 p-4">
                <div className="mb-4 flex h-full w-full flex-col items-center justify-center space-y-2">
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
                    {verifyError && <p className="mt-2 text-red-500">{verifyError}</p>}
                    {error && <p className="mt-2 text-red-500">{error}</p>}
                </div>
            </div>
        </div>
    );
}
