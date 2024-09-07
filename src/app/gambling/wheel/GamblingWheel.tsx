'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { spinWheel, getUserCredits, verifySteamProfile, recordSpinResult } from './wheelActions';
import { WHEEL_SLOTS, DEGREES_PER_SLOT, COLOR_CODES, WheelColor, WheelPayout } from './wheelConstants';
import InputTextbox from '@/components/inputs/InputTextbox';
import Image from 'next/image';
import RecentWinners from './RecentWinners';
import { BiSolidDownArrow } from 'react-icons/bi';

interface WheelResult {
    start: number;
    end: number;
    color: WheelColor;
    payout: WheelPayout;
}

interface SteamProfile {
    name: string;
    avatarUrl: string;
    steamId: string;
}

export default function GamblingWheel() {
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<WheelResult | null>(null);
    const [rotation, setRotation] = useState(0);
    const [steamInput, setSteamInput] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [credits, setCredits] = useState<number | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [steamProfile, setSteamProfile] = useState<SteamProfile | null>(null);
    const [shouldRefetchWinners, setShouldRefetchWinners] = useState(false);
    const currentRotationRef = useRef(0);

    const handleVerify = async () => {
        try {
            const profile = await verifySteamProfile(steamInput);
            setSteamProfile(profile);
            const { credits } = await getUserCredits(profile.steamId, code);
            setCredits(credits);
            setIsVerified(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Verification failed');
        }
    };

    const handleSpin = async () => {
        if (!steamProfile) return;
        setSpinning(true);
        setError('');
        try {
            const {
                result,
                totalRotation,
                finalDegree,
                credits: updatedCredits,
                userId,
            } = await spinWheel(steamProfile.steamId, code, currentRotationRef.current);
            setRotation((prev) => prev + totalRotation);
            currentRotationRef.current = finalDegree;
            setCredits(updatedCredits);
            setTimeout(async () => {
                setResult(result);
                setSpinning(false);
                // Record the spin result after the animation is complete
                await recordSpinResult(userId, result.payout);
                // Trigger a re-fetch of recent winners
                setShouldRefetchWinners(true);
            }, 5000); // Wait for animation to complete
        } catch (error) {
            console.error('Error spinning wheel:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while spinning the wheel.');
            setSpinning(false);
        }
    };

    return (
        <div className="flex h-[calc(100dvh-50px)] w-full flex-col overflow-y-hidden bg-stone-800 text-white md:flex-row">
            <div className="w-full p-4 md:w-3/4">
                {!isVerified ? (
                    <div className="mb-4 flex h-fit w-full flex-col space-y-2">
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
                        <button onClick={handleVerify} className="mt-2 rounded bg-primary px-4 py-2 text-white hover:bg-primary_light">
                            Verify
                        </button>
                        {error && <p className="mt-2 text-red-500">{error}</p>}
                    </div>
                ) : (
                    <div className="flex h-full flex-col items-center">
                        <div className="flex h-full w-full items-center justify-center">
                            <div className="relative h-[75dvh] min-h-full w-[3/4]">
                                <motion.div
                                    className="h-[80dvh] w-[80dvh] rounded-full"
                                    style={{
                                        background: `conic-gradient(${WHEEL_SLOTS.map(
                                            (slot, index) =>
                                                `${COLOR_CODES[slot.color]} ${index * DEGREES_PER_SLOT}deg ${
                                                    (index + 1) * DEGREES_PER_SLOT
                                                }deg`,
                                        ).join(', ')})`,
                                    }}
                                    animate={{ rotate: rotation }}
                                    transition={{ duration: 5, ease: 'easeInOut' }}
                                />
                                <div className="absolute left-1/2 top-0 -translate-x-1/2 transform text-stone-800">
                                    <BiSolidDownArrow size={32} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row justify-end space-x-2">
                            {Object.entries(COLOR_CODES).map(([color, code]) => (
                                <div key={color} className="flex items-center">
                                    <div className="mr-2 h-4 w-4" style={{ backgroundColor: code }}></div>
                                    <span>{WHEEL_SLOTS.find((slot) => slot.color === color)?.payout}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex w-full flex-col bg-stone-700 p-4 md:w-1/4">
                {!isVerified ? (
                    <p className="mb-4 text-center text-primary_light">Type '/auth' in game to get your code</p>
                ) : steamProfile ? (
                    <div className="mb-4 flex items-center">
                        <Image src={steamProfile.avatarUrl} alt="Steam Avatar" width={40} height={40} className="mr-2 rounded-full" />
                        <span className="text-lg font-bold">{steamProfile.name}</span>
                    </div>
                ) : null}
                {credits !== null && <p className="mb-4 text-lg font-bold text-white">Credits: {credits}</p>}
                {isVerified && (
                    <button
                        onClick={handleSpin}
                        disabled={spinning || credits === null || credits < 5}
                        className="mb-4 rounded bg-primary px-4 py-2 text-white hover:bg-primary_light disabled:bg-gray-400"
                    >
                        {spinning ? 'Spinning...' : 'Spin (5 credits)'}
                    </button>
                )}
                {result && <p className="mb-4 text-lg font-bold text-primary_light">You won: {result.payout}</p>}
                <RecentWinners shouldRefetch={shouldRefetchWinners} onRefetchComplete={() => setShouldRefetchWinners(false)} />
            </div>
        </div>
    );
}
