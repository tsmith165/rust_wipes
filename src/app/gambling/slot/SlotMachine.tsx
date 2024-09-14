'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { spinSlotMachine, getUserCredits, verifySteamProfile } from './slotMachineActions';
import InputTextbox from '@/components/inputs/InputTextbox';
import Image from 'next/image';
import { SLOT_ITEMS, BONUS_SYMBOL, WINNING_LINES } from './slotMachineConstants';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Map symbols to image paths
const SYMBOL_IMAGE_PATHS: Record<string, string> = {
    ak47: '/rust_icons/ak47_icon.png',
    m39_rifle: '/rust_icons/m39_icon.png',
    p2_pistol: '/rust_icons/p2_icon.png',
    m92_pistol: '/rust_icons/m92_icon.png',
    thompson: '/rust_icons/thompson_icon.png',
    scrap: '/rust_icons/scrap_icon.png',
    metal_fragments: '/rust_icons/metal_fragments_icon.png',
    high_quality_metal: '/rust_icons/hqm_icon.png',
    bonus: '/rust_icons/bonus_icon.png',
};

interface SlotResult {
    finalVisibleGrid: string[][];
    spinAmounts: number[];
    payout: { item: string; quantity: number }[];
    bonusTriggered: boolean;
    credits: number;
    freeSpinsAvailable: number;
    winningCells: number[][]; // [x, y]
    bonusCells: number[][]; // [x, y]
    winningLines: number[][][]; // [[x, y]]
}

interface SteamProfile {
    name: string;
    avatarUrl: string;
    steamId: string;
}

const VISIBLE_ITEMS = 5;
const ITEM_HEIGHT_LARGE = 100;
const ITEM_WIDTH_LARGE = 100;
const ITEM_WIDTH_SMALL = 60;
const ITEM_HEIGHT_SMALL = 60;
const GAP = 2; // Adjusted gap
const WINDOW_SIZE_THRESHOLD = 600;

export default function SlotMachine() {
    const [showOverlay, setShowOverlay] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<SlotResult | null>(null);
    const [steamInput, setSteamInput] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [credits, setCredits] = useState<number | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [steamProfile, setSteamProfile] = useState<SteamProfile | null>(null);
    const [freeSpins, setFreeSpins] = useState(0);
    const [winningCells, setWinningCells] = useState<number[][]>([]);
    const [bonusCells, setBonusCells] = useState<number[][]>([]);
    const [winningLines, setWinningLines] = useState<number[][][]>([]);

    const [reels, setReels] = useState<string[][]>([]);
    const [spinAmounts, setSpinAmounts] = useState<number[]>([]);
    const [spinKey, setSpinKey] = useState(0);

    const [ITEM_HEIGHT, setItemHeight] = useState(ITEM_HEIGHT_LARGE);
    const [ITEM_WIDTH, setItemWidth] = useState(ITEM_WIDTH_LARGE);

    // Add state variables for "Show Lines" functionality
    const [lineType, setLineType] = useState<'horizontal' | 'zigzag' | 'diagonal' | null>(null);
    const [lineFlashCount, setLineFlashCount] = useState(0);

    useEffect(() => {
        // Initialize reels with random symbols
        const initialReels = Array(5)
            .fill(0)
            .map(() =>
                Array(VISIBLE_ITEMS)
                    .fill(0)
                    .map(() => SLOT_ITEMS[Math.floor(Math.random() * SLOT_ITEMS.length)]),
            );
        setReels(initialReels);
    }, []);

    useEffect(() => {
        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            if (
                (window.innerWidth < WINDOW_SIZE_THRESHOLD || window.innerHeight < WINDOW_SIZE_THRESHOLD) &&
                ITEM_HEIGHT === ITEM_HEIGHT_LARGE
            ) {
                setItemHeight(ITEM_HEIGHT_SMALL);
                setItemWidth(ITEM_WIDTH_SMALL);
            } else if (
                window.innerWidth >= WINDOW_SIZE_THRESHOLD &&
                window.innerHeight >= WINDOW_SIZE_THRESHOLD &&
                ITEM_HEIGHT === ITEM_HEIGHT_SMALL
            ) {
                setItemHeight(ITEM_HEIGHT_LARGE);
                setItemWidth(ITEM_WIDTH_LARGE);
            }
        };
        updateWindowSize();
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

    // Handle line flashing for "Show Lines" functionality
    useEffect(() => {
        if (lineType) {
            const timer = setTimeout(() => {
                if (lineFlashCount < 3) {
                    setLineFlashCount((prev) => prev + 1);
                } else {
                    setLineFlashCount(0);
                    setLineType((prev) => {
                        if (prev === 'horizontal') return 'zigzag';
                        if (prev === 'zigzag') return 'diagonal';
                        return null;
                    });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [lineType, lineFlashCount]);

    const handleVerify = async () => {
        try {
            const profile = await verifySteamProfile(steamInput);
            setSteamProfile(profile);
            const { credits, freeSpins } = await getUserCredits(profile.steamId, code);
            setCredits(credits);
            setFreeSpins(freeSpins);
            setIsVerified(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Verification failed');
        }
    };

    const handleSpin = async () => {
        if (!steamProfile) return;

        // Start fade out
        setSpinning(false);
        setSpinKey((prev) => prev + 1);

        // Wait for fade out animation
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Proceed with spinning
        setError('');

        // Clear winning and bonus cells and lines
        setWinningCells([]);
        setBonusCells([]);
        setWinningLines([]);

        try {
            const spinResult = await spinSlotMachine(steamProfile.steamId, code);
            const {
                finalVisibleGrid,
                spinAmounts,
                credits,
                freeSpinsAvailable,
                winningCells: currWinningCells,
                bonusCells: currentBonusCells,
                winningLines: currWinningLines,
            } = spinResult;

            setSpinAmounts(spinAmounts);

            // Prepare reels for animation
            const newReels = finalVisibleGrid.map((finalReel, i) => {
                const spinSymbolsCount = spinAmounts[i];

                // Generate random spin symbols
                const spinSymbols = Array(spinSymbolsCount)
                    .fill(0)
                    .map(() => SLOT_ITEMS[Math.floor(Math.random() * SLOT_ITEMS.length)]);

                // The new reel is spin symbols + final symbols
                return [...spinSymbols, ...finalReel];
            });

            setReels(newReels);
            setSpinning(true);

            // Wait for the animations to complete
            const maxDuration = 2 + 4 * 0.6; // For the last reel
            await new Promise((resolve) => setTimeout(resolve, maxDuration * 1000));

            // Update credits and other states
            setCredits(credits);
            setFreeSpins(freeSpinsAvailable);
            setResult(spinResult);
            setSpinning(false);

            // Update winning cells, bonus cells, and winning lines
            setWinningCells(currWinningCells);
            setBonusCells(currentBonusCells);
            setWinningLines(currWinningLines);

            if (spinResult.payout.length > 0 || spinResult.bonusTriggered) {
                setShowOverlay(true);
                setShowConfetti(true);
                setTimeout(() => {
                    setShowOverlay(false);
                    setShowConfetti(false);
                }, 2500);
            }
        } catch (error) {
            console.error('Error spinning slot machine:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while spinning the slot machine.');
            setSpinning(false);
        }
    };

    // Handle "Show Lines" button click
    const handleShowLines = () => {
        setLineType('horizontal');
    };

    // Helper function to calculate the total height of the reel content
    const calculateReelHeight = (reelLength: number) => {
        return reelLength * ITEM_HEIGHT + (reelLength - 1) * GAP;
    };

    return (
        <div className="flex h-[calc(100dvh-50px)] w-full flex-col items-center justify-center overflow-x-hidden overflow-y-hidden bg-stone-800 text-white">
            {!isVerified ? (
                <div className="mb-4 flex w-full flex-col items-center justify-center space-y-2 px-8 md:w-1/2">
                    {/* Verification inputs */}
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
                    <p className="text-center text-primary_light">Type '/auth' in game to get your code</p>
                    <button onClick={handleVerify} className="mt-2 rounded bg-primary px-4 py-2 text-white hover:bg-primary_light">
                        Verify
                    </button>
                    {error && <p className="mt-2 text-red-500">{error}</p>}
                </div>
            ) : (
                <div className="flex h-full w-full flex-col lg:flex-row">
                    <div className="flex w-full items-center justify-center p-4 lg:w-3/4">
                        <div className="relative flex h-full flex-col items-center space-y-2 lg:space-y-4">
                            <div
                                className="relative overflow-hidden rounded-lg bg-gray-700 p-2"
                                style={{
                                    height: `${VISIBLE_ITEMS * ITEM_HEIGHT + (VISIBLE_ITEMS - 1) * GAP + 4 + 8}px`, // Added 4px to account for padding
                                    width: `${5 * ITEM_WIDTH + 4 * GAP + 4 + 8}px`, // Added 4px to account for padding
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={spinKey}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="grid grid-cols-5 gap-0" // Adjusted gap to 0
                                    >
                                        {reels.map((reel, i) => (
                                            <motion.div
                                                key={`reel-${i}-${reel.length}-${spinKey}`}
                                                className="flex flex-col items-center"
                                                animate={
                                                    spinning && spinAmounts.length > 0
                                                        ? {
                                                              y: -(calculateReelHeight(reel.length) - calculateReelHeight(VISIBLE_ITEMS)),
                                                          }
                                                        : {}
                                                }
                                                transition={{
                                                    duration: 2 + i * 0.5,
                                                    ease: 'easeInOut',
                                                }}
                                                style={{
                                                    // Set initial position to show the starting items
                                                    y: spinning
                                                        ? 0
                                                        : -(calculateReelHeight(reel.length) - calculateReelHeight(VISIBLE_ITEMS)),
                                                }}
                                            >
                                                {reel.map((item, j) => {
                                                    const displayedIndex = j - (reel.length - VISIBLE_ITEMS);
                                                    const isDisplayed = displayedIndex >= 0 && displayedIndex < VISIBLE_ITEMS;

                                                    return (
                                                        <div
                                                            key={j}
                                                            className="relative flex items-center justify-center"
                                                            style={{
                                                                height: `${ITEM_HEIGHT}px`,
                                                                width: `${ITEM_WIDTH}px`,
                                                                marginBottom: j < reel.length - 1 ? `${GAP}px` : '0px',
                                                            }}
                                                        >
                                                            {SYMBOL_IMAGE_PATHS[item] ? (
                                                                <Image
                                                                    src={SYMBOL_IMAGE_PATHS[item]}
                                                                    alt={item}
                                                                    width={ITEM_WIDTH - 10}
                                                                    height={ITEM_HEIGHT - 10}
                                                                />
                                                            ) : (
                                                                <span className="text-4xl">{item}</span>
                                                            )}
                                                            {/* Highlight for winning and bonus cells */}
                                                            {isDisplayed &&
                                                                winningCells.some(
                                                                    (cell) => cell[0] === i && cell[1] === displayedIndex,
                                                                ) && <div className="absolute inset-0 bg-red-500 opacity-50" />}
                                                            {isDisplayed &&
                                                                bonusCells.some((cell) => cell[0] === i && cell[1] === displayedIndex) && (
                                                                    <div className="absolute inset-0 bg-green-500 opacity-50" />
                                                                )}
                                                        </div>
                                                    );
                                                })}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                                {/* Render lines for each winning line */}
                                {!spinning && winningLines && winningLines.length > 0 && (
                                    <div className="absolute inset-0">
                                        {winningLines.map((line, index) => (
                                            <svg key={`winning-line-${index}`} className="absolute inset-0 h-full w-full">
                                                <polyline
                                                    points={line
                                                        .map(([x, y]) => {
                                                            // Adjust y coordinate based on displayed items
                                                            const yPos =
                                                                y * (ITEM_HEIGHT + GAP) + ITEM_HEIGHT / 2 + GAP * (VISIBLE_ITEMS - 1 - y);
                                                            return `${x * (ITEM_WIDTH + GAP) + ITEM_WIDTH / 2},${yPos}`;
                                                        })
                                                        .join(' ')}
                                                    fill="none"
                                                    stroke="red"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        ))}
                                    </div>
                                )}
                                {/* Render the lines when lineType is set */}
                                {lineType && (
                                    <div className="absolute inset-0">
                                        {WINNING_LINES[lineType].map((line, index) => (
                                            <svg key={`${lineType}-${index}`} className="absolute inset-0 h-full w-full">
                                                <polyline
                                                    points={line
                                                        .map(
                                                            ([x, y]) =>
                                                                `${x * (ITEM_WIDTH + GAP) + ITEM_WIDTH / 2},${
                                                                    y * (ITEM_HEIGHT + GAP) + ITEM_HEIGHT / 2
                                                                }`,
                                                        )
                                                        .join(' ')}
                                                    fill="none"
                                                    stroke={lineType === 'horizontal' ? 'yellow' : lineType === 'zigzag' ? 'green' : 'blue'}
                                                    strokeWidth="2"
                                                    opacity={lineFlashCount % 2 === 0 ? 1 : 0}
                                                />
                                            </svg>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Overlay and Confetti */}
                            <AnimatePresence>
                                {showOverlay && result && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute m-8 flex h-fit w-fit items-center justify-center rounded-lg bg-black bg-opacity-70 p-8"
                                    >
                                        <div className="text-center">
                                            <h2 className="mb-4 text-4xl font-bold">You Won!</h2>
                                            {result.payout.map((item, index) => (
                                                <p key={index} className="text-2xl">
                                                    {item.quantity}x {item.item}
                                                </p>
                                            ))}
                                            {result.bonusTriggered && <p className="mt-4 text-2xl text-yellow-400">+10 Free Spins!</p>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {showConfetti && (
                                <Confetti
                                    className="absolute left-0 top-0 h-full w-full"
                                    recycle={false}
                                    numberOfPieces={200}
                                    gravity={0.2}
                                    initialVelocityX={5}
                                    initialVelocityY={20}
                                    confettiSource={{
                                        x: windowSize.width / 2,
                                        y: windowSize.height / 2,
                                        w: 0,
                                        h: 0,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    {/* Side panel */}
                    <div className="flex h-full w-full flex-col space-y-2 overflow-y-auto bg-stone-700 px-4 py-2 lg:w-1/4 lg:space-y-4 lg:p-4">
                        {/* User info and controls */}
                        <div className="flex flex-row items-center justify-between lg:flex-col lg:space-y-4">
                            <div className="fit flex items-start lg:w-full">
                                <Image
                                    src={steamProfile?.avatarUrl || '/steam_icon_small.png'}
                                    alt="Steam Avatar"
                                    width={32}
                                    height={32}
                                    className="mr-2 rounded-full"
                                />
                                <span className="text-lg font-bold">{steamProfile?.name || 'Unknown Player'}</span>
                            </div>
                            <p className="flex w-fit items-start text-center text-lg font-bold text-white lg:w-full">
                                Credits: {credits || '0'}
                            </p>
                        </div>
                        <button
                            onClick={handleSpin}
                            disabled={spinning || (credits !== null && credits < 5 && freeSpins === 0)}
                            className="mt-4 rounded bg-primary_light px-4 py-2 font-bold text-stone-800 hover:bg-primary hover:text-stone-300 disabled:bg-gray-400"
                        >
                            {spinning ? 'Spinning...' : freeSpins > 0 ? `Free Spin (${freeSpins} left)` : 'Spin (5 credits)'}
                        </button>
                        {/* Add the "Show Lines" button */}
                        <button
                            onClick={handleShowLines}
                            className="mt-2 rounded bg-stone-300 px-4 py-2 font-bold text-primary hover:bg-stone-800 hover:text-primary_light"
                        >
                            Show Lines
                        </button>
                        {error && <p className="mt-2 text-red-500">{error}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
