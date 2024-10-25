// src/app/gambling/wheel/GamblingWheel.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { spinWheel, getUserCredits, verifySteamProfile, recordSpinResult } from './wheelActions';
import { WHEEL_SLOTS, DEGREES_PER_SLOT, COLOR_CODES, PAYOUTS, WheelColor, WheelResult, LEGEND_ORDER } from './wheelConstants';
import Image from 'next/image';
import RecentWinners from './RecentWinners';
import { BiSolidDownArrow } from 'react-icons/bi';

import Cookies from 'js-cookie';
import SteamSignInModal from '@/components/SteamSignInModal';

// Dynamically import the Confetti component to avoid SSR issues
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Map payout display names to their corresponding icon paths
const ICON_PATHS: Record<string, string> = {
    'AK47 Rifle': '/rust_icons/ak47_icon.png',
    'M39 Rifle': '/rust_icons/m39_icon.png',
    Thompson: '/rust_icons/thompson_icon.png',
    'M92 Pistol': '/rust_icons/m92_icon.png',
    'P2 Pistol': '/rust_icons/p2_icon.png',
};

// Interface for Steam Profile data
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
    const [showOverlay, setShowOverlay] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const currentRotationRef = useRef(0);

    // Effect to handle window resize for Confetti component
    useEffect(() => {
        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateWindowSize();
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

    // Function to handle user verification
    const handleVerify = async (profileUrlParam?: string, authCodeParam?: string) => {
        const profileUrl = profileUrlParam ?? steamInput;
        const authCode = authCodeParam ?? code;

        try {
            const profile = await verifySteamProfile(profileUrl);
            if (!profile.success) {
                setError(profile.error || 'Failed to verify Steam profile.');
                return;
            }

            if (!profile.data) {
                setError('Failed to verify Steam profile.');
                return;
            }

            setSteamProfile(profile.data);
            const creditsResponse = await getUserCredits(profile.data.steamId, authCode);
            if (!creditsResponse.success) {
                setError(creditsResponse.error || 'Failed to retrieve user credits');
                return;
            }
            if (!creditsResponse.data) {
                setError('Failed to retrieve user credits');
                return;
            }

            setCredits(creditsResponse.data.credits);
            setIsVerified(true);
            setError('');

            // Save credentials to cookies
            Cookies.set('steamInput', profileUrl, { expires: 7, secure: true, sameSite: 'Lax' });
            Cookies.set('authCode', authCode, { expires: 7, secure: true, sameSite: 'Lax' });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Verification failed');
        }
    };

    // Load credentials from cookies on component mount
    useEffect(() => {
        const savedSteamInput = Cookies.get('steamInput');
        const savedCode = Cookies.get('authCode');

        if (savedSteamInput && savedCode) {
            setSteamInput(savedSteamInput);
            setCode(savedCode);
            // Automatically verify credentials using the values from cookies
            handleVerify(savedSteamInput, savedCode);
        }
    }, []);

    // Function to handle spinning the wheel
    const handleSpin = async () => {
        if (!steamProfile) return;
        setSpinning(true);
        setError('');
        try {
            const spinResponse = await spinWheel(steamProfile.steamId, code, currentRotationRef.current);

            if (!spinResponse.success) {
                setError(spinResponse.error || 'An error occurred during the spin.');
                setSpinning(false);
                return;
            }

            if (!spinResponse.data) {
                setError('Failed to spin the wheel.');
                setSpinning(false);
                return;
            }

            const { result: spinResult, totalRotation, finalDegree, credits: updatedCredits, userId } = spinResponse.data;

            setRotation((prev) => prev + totalRotation);
            currentRotationRef.current = finalDegree;
            setCredits(updatedCredits);
            setTimeout(async () => {
                setResult(spinResult);
                setSpinning(false);
                setShowOverlay(true);
                setShowConfetti(true);
                await recordSpinResult(userId, spinResult.color);
                setShouldRefetchWinners(true);
                setTimeout(() => {
                    setShowOverlay(false);
                    setShowConfetti(false);
                }, 2500);
            }, 5000); // Simulate spin duration
        } catch (error) {
            console.error('Error spinning wheel:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while spinning the wheel.');
            setSpinning(false);
        }
    };

    return (
        <div className="flex h-[calc(100dvh-50px)] w-full flex-col overflow-x-hidden overflow-y-hidden bg-stone-800 text-white lg:flex-row">
            {/* Main Wheel and Spin Area */}
            <div className="flex w-full items-center justify-center p-4 lg:w-3/4">
                {/* Wheel Display and Result */}
                <div className="flex h-full flex-col items-center space-y-2 lg:space-y-4">
                    {/* Wheel and Overlay */}
                    <div className="relative flex h-full w-full items-center justify-start">
                        <div className="relative h-fit w-[3/4]">
                            {/* Wheel */}
                            <motion.div
                                className="relative h-[90dvw] max-h-[60dvh] w-[90dvw] max-w-[60dvh] rounded-full lg:h-[70dvw] lg:!max-h-[80dvh] lg:w-[70dvw] lg:!max-w-[80dvh]"
                                style={{
                                    background: `conic-gradient(${WHEEL_SLOTS.map(
                                        (color, index) =>
                                            `${COLOR_CODES[color]} ${index * DEGREES_PER_SLOT}deg ${(index + 1) * DEGREES_PER_SLOT}deg`,
                                    ).join(', ')})`,
                                }}
                                animate={{ rotate: rotation }}
                                transition={{ duration: 5, ease: 'easeInOut' }}
                            >
                                {/* Wheel Segments with Icons */}
                                {WHEEL_SLOTS.map((color, index) => (
                                    <div
                                        key={index}
                                        className="invisible absolute lg:visible"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            transform: `rotate(${index * DEGREES_PER_SLOT + DEGREES_PER_SLOT / 2}deg)`,
                                        }}
                                    >
                                        <div className="absolute left-1/2 top-[30px] -translate-x-1/2 -translate-y-1/2 transform">
                                            <Image
                                                src={ICON_PATHS[PAYOUTS[color].displayName]}
                                                alt={PAYOUTS[color].displayName}
                                                width={32}
                                                height={32}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                            {/* Down Arrow Indicator */}
                            <div className="absolute left-1/2 top-[-15px] -translate-x-1/2 transform text-primary_light">
                                <BiSolidDownArrow size={32} />
                            </div>
                            {/* Overlay for Spin Result */}
                            <div className="absolute left-1/2 top-0 flex h-full w-full -translate-x-1/2 transform items-center justify-center lg:top-[-10%]">
                                <AnimatePresence>
                                    {showOverlay && result && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex h-[70%] w-[70%] items-center justify-center rounded-lg bg-black bg-opacity-70 lg:!h-[30dvw] lg:!w-[30dvw]"
                                        >
                                            <div className="text-center">
                                                <h2 className="mb-4 text-4xl font-bold">You Won!</h2>
                                                <div className="flex items-center justify-center">
                                                    <Image
                                                        src={ICON_PATHS[result.payout.displayName]}
                                                        alt={result.payout.displayName}
                                                        width={64}
                                                        height={64}
                                                    />
                                                    <span className="ml-4 text-3xl font-bold">{result.payout.displayName}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    {/* Confetti Effect */}
                    {showConfetti && (
                        <Confetti
                            className="absolute left-0 top-12 h-[calc(100dvh-50px)] w-[100dvw] lg:w-3/4"
                            recycle={false}
                            numberOfPieces={200}
                            gravity={0.2}
                            initialVelocityX={5}
                            initialVelocityY={20}
                            confettiSource={{
                                x: 0,
                                y: 0,
                                w: windowSize.width,
                                h: 0,
                            }}
                        />
                    )}
                    {/* Legend Display */}
                    <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:flex-row lg:justify-center lg:space-x-2">
                        {LEGEND_ORDER.map((color) => (
                            <div key={color} className="flex items-center justify-center space-x-2 lg:w-auto">
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-md"
                                    style={{ backgroundColor: COLOR_CODES[color] }}
                                >
                                    <Image
                                        src={ICON_PATHS[PAYOUTS[color].displayName]}
                                        alt={PAYOUTS[color].displayName}
                                        width={24}
                                        height={24}
                                    />
                                </div>
                                <span className="w-[90px] text-left text-sm font-bold">{PAYOUTS[color].displayName}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Sign-In Modal */}
                {!isVerified && (
                    <SteamSignInModal
                        steamInput={steamInput}
                        setSteamInput={setSteamInput}
                        code={code}
                        setCode={setCode}
                        onVerify={handleVerify}
                        error={error}
                    />
                )}
            </div>
            {/* Sidebar: User Info and Recent Winners */}
            <div className="flex h-full w-full flex-col space-y-2 overflow-y-auto bg-stone-700 px-4 py-2 lg:w-1/4 lg:space-y-4 lg:p-4">
                {/* User Information */}
                <div className="flex flex-row items-center justify-between lg:flex-col lg:space-y-4">
                    <div className="fit flex items-start lg:w-full">
                        <Image
                            src={steamProfile?.avatarUrl || '/steam_icon_small.png'}
                            alt="Steam Avatar"
                            width={32}
                            height={32}
                            className="mr-2 rounded-full"
                        />
                        <span className="text-lg font-bold">{steamProfile?.name || 'Enter Steam Profile URL'}</span>
                    </div>
                    <p className="flex w-fit items-start text-center text-lg font-bold text-white lg:w-full">
                        Credits: {credits !== null ? credits : '0'}
                    </p>
                </div>
                {/* Spin Button */}
                <button
                    onClick={handleSpin}
                    disabled={!isVerified || spinning || credits === null || credits < 5}
                    className="mb-4 rounded bg-primary px-4 py-2 text-white hover:bg-primary_light disabled:bg-gray-400"
                >
                    {spinning ? 'Spinning...' : 'Spin (5 credits)'}
                </button>
                {/* Recent Winners */}
                <RecentWinners shouldRefetch={shouldRefetchWinners} onRefetchComplete={() => setShouldRefetchWinners(false)} />
            </div>
        </div>
    );
}
