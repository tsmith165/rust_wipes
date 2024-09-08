'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { spinWheel, getUserCredits, verifySteamProfile, recordSpinResult } from './wheelActions';
import { WHEEL_SLOTS, DEGREES_PER_SLOT, COLOR_CODES, PAYOUTS, WheelColor, WheelPayout, LEGEND_ORDER } from './wheelConstants';
import InputTextbox from '@/components/inputs/InputTextbox';
import Image from 'next/image';
import RecentWinners from './RecentWinners';
import { BiSolidDownArrow } from 'react-icons/bi';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

const ICON_PATHS: Record<WheelPayout, string> = {
    'AK47 Rifle': '/rust_icons/ak47_icon.png',
    'M39 Rifle': '/rust_icons/m39_icon.png',
    Thompson: '/rust_icons/thompson_icon.png',
    'M92 Pistol': '/rust_icons/m92_icon.png',
    'P2 Pistol': '/rust_icons/p2_icon.png',
};

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
    const [showOverlay, setShowOverlay] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const currentRotationRef = useRef(0);

    useEffect(() => {
        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateWindowSize();
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

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
                setShowOverlay(true);
                setShowConfetti(true);
                await recordSpinResult(userId, result.payout);
                setShouldRefetchWinners(true);
                setTimeout(() => {
                    setShowOverlay(false);
                    setShowConfetti(false);
                }, 2500);
            }, 5000);
        } catch (error) {
            console.error('Error spinning wheel:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while spinning the wheel.');
            setSpinning(false);
        }
    };

    return (
        <div className="flex h-[calc(100dvh-50px)] w-full flex-col overflow-x-hidden overflow-y-hidden bg-stone-800 text-white md:flex-row  ">
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
                    <div className="flex h-full flex-col items-center space-y-2 md:space-y-4">
                        <div className="relative flex h-full w-full items-center justify-center">
                            <div className="relative h-[90dvw] min-h-full w-[3/4] md:h-[75dvh]">
                                <motion.div
                                    className="h-[90dvw] w-[90dvw] rounded-full md:h-[80dvh] md:w-[80dvh]"
                                    style={{
                                        background: `conic-gradient(${WHEEL_SLOTS.map(
                                            (color, index) =>
                                                `${COLOR_CODES[color]} ${index * DEGREES_PER_SLOT}deg ${(index + 1) * DEGREES_PER_SLOT}deg`,
                                        ).join(', ')})`,
                                    }}
                                    animate={{ rotate: rotation }}
                                    transition={{ duration: 5, ease: 'easeInOut' }}
                                >
                                    {WHEEL_SLOTS.map((color, index) => (
                                        <div
                                            key={index}
                                            className="invisible md:visible md:absolute"
                                            style={{
                                                top: '39dvh',
                                                left: '39dvh',
                                                transform: `rotate(${index * DEGREES_PER_SLOT + DEGREES_PER_SLOT / 2}deg) translateY(-37dvh)`,
                                            }}
                                        >
                                            <Image src={ICON_PATHS[PAYOUTS[color]]} alt={PAYOUTS[color]} width={32} height={32} />
                                        </div>
                                    ))}
                                </motion.div>
                                <div className="absolute left-1/2 top-0 -translate-x-1/2 transform text-stone-800">
                                    <BiSolidDownArrow size={32} />
                                </div>
                                <AnimatePresence>
                                    {showOverlay && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70"
                                        >
                                            <div className="text-center">
                                                <h2 className="mb-4 text-4xl font-bold">You Won!</h2>
                                                <div className="flex items-center justify-center">
                                                    <Image
                                                        src={ICON_PATHS[result?.payout || 'P2 Pistol']}
                                                        alt={result?.payout || ''}
                                                        width={64}
                                                        height={64}
                                                    />
                                                    <span className="ml-4 text-3xl font-bold">{result?.payout}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {showConfetti && windowSize.width > 0 && windowSize.height > 0 && (
                                    <Confetti
                                        width={windowSize.width}
                                        height={windowSize.height}
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
                            </div>
                        </div>
                        <div className="grid w-full grid-cols-2 gap-2 md:flex md:flex-row md:justify-center md:space-x-2">
                            {LEGEND_ORDER.map((color) => (
                                <div key={color} className="flex items-center justify-center space-x-2 md:w-auto">
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-md"
                                        style={{ backgroundColor: COLOR_CODES[color] }}
                                    >
                                        <Image src={ICON_PATHS[PAYOUTS[color]]} alt={PAYOUTS[color]} width={24} height={24} />
                                    </div>
                                    <span className="w-[90px] text-left text-sm font-bold">{PAYOUTS[color]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex h-full w-full flex-col space-y-2 overflow-y-auto bg-stone-700 px-4 py-2 md:w-1/4 md:space-y-4 md:p-4">
                <div className="flex flex-row items-center justify-between space-y-2 md:flex-col md:space-y-4">
                    {!isVerified ? (
                        <p className="text-center text-primary_light">Type '/auth' in game to get your code</p>
                    ) : steamProfile ? (
                        <div className="flex items-center">
                            <Image src={steamProfile.avatarUrl} alt="Steam Avatar" width={40} height={40} className="mr-2 rounded-full" />
                            <span className="text-lg font-bold">{steamProfile.name}</span>
                        </div>
                    ) : null}
                    {credits !== null && <p className="mb-4 text-center text-lg font-bold text-white">Credits: {credits}</p>}
                </div>
                {isVerified && (
                    <button
                        onClick={handleSpin}
                        disabled={spinning || credits === null || credits < 5}
                        className="mb-4 rounded bg-primary px-4 py-2 text-white hover:bg-primary_light disabled:bg-gray-400"
                    >
                        {spinning ? 'Spinning...' : 'Spin (5 credits)'}
                    </button>
                )}
                <RecentWinners shouldRefetch={shouldRefetchWinners} onRefetchComplete={() => setShouldRefetchWinners(false)} />
            </div>
        </div>
    );
}
