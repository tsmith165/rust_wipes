'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { spinSlotMachine, setBonusType } from './Slot.Actions';
import Image from 'next/image';
import { WINNING_LINES } from '@/app/gambling/slot/Slot.Constants';
import { getRandomSymbol } from '@/app/gambling/slot/Slot.Utils';
import RecentSlotWinners from '@/app/gambling/slot/Slot.RecentWinners';

import { FaVolumeMute, FaPlay, FaPause, FaInfoCircle, FaCoins } from 'react-icons/fa';
import { FaVolumeHigh } from 'react-icons/fa6';
import { Tooltip } from 'react-tooltip';

import SteamSignInModal from '@/components/SteamSignInModal';
import { useSteamUser } from '@/stores/steam_user_store';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Map symbols to image paths
const SYMBOL_IMAGE_PATHS: Record<string, string> = {
    ak47: '/rust_icons/ak47_icon.png',
    m39_rifle: '/rust_icons/m39_icon.png',
    thompson: '/rust_icons/thompson_icon.png',
    scrap: '/rust_icons/scrap_icon.png',
    metal_fragments: '/rust_icons/metal_fragments_icon.png',
    high_quality_metal: '/rust_icons/hqm_icon.png',
    bonus: '/rust_icons/bonus_symbol.png',
    '2x_multiplier': '/rust_icons/2x_multi.png',
    '3x_multiplier': '/rust_icons/3x_multi.png',
    '5x_multiplier': '/rust_icons/5x_multi.png',
};

interface SlotResult {
    finalVisibleGrid: string[][];
    spinAmounts: number[];
    payout: { item: string; full_name: string; quantity: number }[];
    bonusTriggered: boolean;
    bonusSpinsAwarded: number;
    credits: number;
    freeSpinsAvailable: number;
    winningCells: number[][]; // [x, y]
    bonusCells: number[][]; // [x, y]
    winningLines: number[][][]; // [[x, y]]
    stickyMultipliers?: { x: number; y: number; multiplier: number }[]; // Added for sticky multipliers
}

interface SteamProfile {
    name: string;
    avatarUrl: string;
    steamId: string;
}

const WINDOW_SIZE_SMALL_THRESHOLD = 400;
const WINDOW_SIZE_MEDIUM_THRESHOLD = 600;
const WINDOW_SIZE_LARGE_THRESHOLD = 800;
const WINDOW_SIZE_EXTRA_LARGE_THRESHOLD = 1300;

const ITEM_SIZE_EXTRA_LARGE = 120;
const ITEM_SIZE_LARGE = 100;
const ITEM_SIZE_MEDIUM = 80;
const ITEM_SIZE_SMALL = 60;
const ITEM_SIZE_EXTRA_SMALL = 50;

const VISIBLE_ITEMS = 5;
const GAP = 2; // Adjusted gap

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return <>{children}</>;
};

export default function SlotMachine() {
    // Use the Zustand store
    const {
        steamInput,
        setSteamInput,
        authCode: code,
        setAuthCode: setCode,
        steamId,
        setSteamId,
        profile: steamProfile,
        setProfile: setSteamProfile,
        credits,
        setCredits,
        freeSpins,
        setFreeSpins,
        isVerified,
        setIsVerified,
        error,
        setError,
        verifyUser,
        loadUserData,
    } = useSteamUser();

    console.log(`SlotMachine - steamId: ${steamId} | authCode: ${code} | isVerified: ${isVerified} | error: ${error}`);

    const [showOverlay, setShowOverlay] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });
    const [shouldRefetchWinners, setShouldRefetchWinners] = useState(false);

    const [spinning, setSpinning] = useState(false);
    const [autoSpin, setAutoSpin] = useState(false);
    const [result, setResult] = useState<SlotResult | null>(null);

    const [winningCells, setWinningCells] = useState<number[][]>([]);
    const [bonusCells, setBonusCells] = useState<number[][]>([]);

    const [winningLines, setWinningLines] = useState<number[][][]>([]);
    const [currentWinningLine, setCurrentWinningLine] = useState<number[][]>([]);
    const [currentWinningLineIndex, setCurrentWinningLineIndex] = useState(0);
    const [currentWinningLineFlashCount, setCurrentWinningLineFlashCount] = useState(0);

    const [isBonusPending, setIsBonusPending] = useState(false);

    const [reels, setReels] = useState<string[][]>([]);
    const [spinAmounts, setSpinAmounts] = useState<number[]>([]);
    const [spinKey, setSpinKey] = useState(0);

    const [ITEM_HEIGHT, setItemHeight] = useState(ITEM_SIZE_MEDIUM);
    const [ITEM_WIDTH, setItemWidth] = useState(ITEM_SIZE_MEDIUM);

    const itemHeightRef = useRef(ITEM_HEIGHT);
    const itemWidthRef = useRef(ITEM_WIDTH);

    // Sound References
    const handlePullSoundRef = useRef<HTMLAudioElement | null>(null);
    const spinStartSoundRef = useRef<HTMLAudioElement | null>(null);
    const spinEndSoundRef = useRef<HTMLAudioElement | null>(null);
    const win1SoundRef = useRef<HTMLAudioElement | null>(null);
    const win2SoundRef = useRef<HTMLAudioElement | null>(null);
    const win3SoundRef = useRef<HTMLAudioElement | null>(null);
    const bonusWonSoundRef = useRef<HTMLAudioElement | null>(null);

    // Initialize Audio Elements
    useEffect(() => {
        handlePullSoundRef.current = new Audio('/sounds/slot-handle_pull-1.mp3');
        spinStartSoundRef.current = new Audio('/sounds/slot-spin_start-1.mp3');
        spinEndSoundRef.current = new Audio('/sounds/slot-spin_end-1.mp3');
        win1SoundRef.current = new Audio('/sounds/slot-win-1.mp3');
        win2SoundRef.current = new Audio('/sounds/slot-win-2.mp3');
        win3SoundRef.current = new Audio('/sounds/slot-win-3.mp3');
        bonusWonSoundRef.current = new Audio('/sounds/slot-bonus_won-1.mp3');
    }, []);

    // Function to stop all sounds
    const stopAllSounds = () => {
        const sounds = [
            handlePullSoundRef.current,
            spinStartSoundRef.current,
            spinEndSoundRef.current,
            win1SoundRef.current,
            win2SoundRef.current,
            win3SoundRef.current,
            bonusWonSoundRef.current,
        ];
        sounds.forEach((sound) => {
            if (sound && !sound.paused) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    };

    // Function to play a sound with resetting to allow replay
    const playSound = (audioRef: React.MutableRefObject<HTMLAudioElement | null>, isMuted: boolean) => {
        if (isMuted) return; // Do not play if muted
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((error) => {
                console.error('Error playing sound:', error);
            });
        }
    };

    // Specific Sound Functions
    const playHandlePull = (isMuted: boolean) => {
        playSound(handlePullSoundRef, isMuted);
    };

    const playSpinStart = (isMuted: boolean) => {
        playSound(spinStartSoundRef, isMuted);
    };

    const playSpinEnd = (isMuted: boolean) => {
        playSound(spinEndSoundRef, isMuted);
    };

    const playWinSound = (numWins: number, isMuted: boolean) => {
        if (numWins === 1) {
            playSound(win1SoundRef, isMuted);
        } else if (numWins === 2) {
            playSound(win2SoundRef, isMuted);
        } else if (numWins >= 3) {
            playSound(win3SoundRef, isMuted);
        }
    };

    const playBonusWonSound = (isMuted: boolean) => {
        playSound(bonusWonSoundRef, isMuted);
    };

    useEffect(() => {
        itemHeightRef.current = ITEM_HEIGHT;
    }, [ITEM_HEIGHT]);

    useEffect(() => {
        itemWidthRef.current = ITEM_WIDTH;
    }, [ITEM_WIDTH]);

    // Add state variables for "Show Lines" functionality
    const [lineType, setLineType] = useState<'horizontal' | 'diagonal' | 'zigzag_downwards' | 'zigzag_upwards' | null>(null);
    const [lineFlashCount, setLineFlashCount] = useState(0);

    useEffect(() => {
        // Initialize reels with random symbols
        const initialReels = Array(5)
            .fill(0)
            .map(() =>
                Array(VISIBLE_ITEMS)
                    .fill(0)
                    .map(() => getRandomSymbol()),
            );
        setReels(initialReels);
    }, []);

    useLayoutEffect(() => {
        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });

            const CurrentItemSize = getScreenSize();

            if (CurrentItemSize !== itemHeightRef.current || CurrentItemSize !== itemWidthRef.current) {
                setItemHeight(CurrentItemSize);
                setItemWidth(CurrentItemSize);
            }
        };

        updateWindowSize();
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

    // Ref to store timeout ID for auto spin
    const autoSpinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (autoSpin) {
            handleSpin();
            startAutoSpin();
        } else {
            if (autoSpinTimeoutRef.current) {
                clearTimeout(autoSpinTimeoutRef.current);
                autoSpinTimeoutRef.current = null;
            }
        }

        return () => {
            if (autoSpinTimeoutRef.current) {
                clearTimeout(autoSpinTimeoutRef.current);
                autoSpinTimeoutRef.current = null;
            }
        };
    }, [autoSpin]);

    function startAutoSpin() {
        if (autoSpin) {
            autoSpinTimeoutRef.current = setTimeout(() => {
                handleSpin();
                if (autoSpin) {
                    startAutoSpin();
                }
            }, 10000); // 10 seconds
        }
    }

    function getScreenSize() {
        if (window.innerWidth >= WINDOW_SIZE_EXTRA_LARGE_THRESHOLD && window.innerHeight > ITEM_SIZE_EXTRA_LARGE * 5 + 100) {
            return ITEM_SIZE_EXTRA_LARGE;
        } else if (window.innerWidth >= WINDOW_SIZE_LARGE_THRESHOLD && window.innerHeight > ITEM_SIZE_LARGE * 5 + 100) {
            return ITEM_SIZE_LARGE;
        } else if (window.innerWidth >= WINDOW_SIZE_MEDIUM_THRESHOLD && window.innerHeight > ITEM_SIZE_MEDIUM * 5 + 100) {
            return ITEM_SIZE_MEDIUM;
        } else if (window.innerWidth >= WINDOW_SIZE_SMALL_THRESHOLD && window.innerHeight > ITEM_SIZE_SMALL * 5 + 100) {
            return ITEM_SIZE_SMALL;
        } else {
            return ITEM_SIZE_EXTRA_SMALL;
        }
    }

    // Handle line flashing for "Show Lines" functionality
    useEffect(() => {
        if (lineType) {
            const timer = setTimeout(() => {
                if (lineFlashCount < 3) {
                    setLineFlashCount((prev) => prev + 1);
                } else {
                    setLineFlashCount(0);
                    setLineType((prev) => {
                        if (prev === 'horizontal') return 'zigzag_downwards';
                        if (prev === 'zigzag_downwards') return 'zigzag_upwards';
                        if (prev === 'zigzag_upwards') return 'diagonal';
                        return null;
                    });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [lineType, lineFlashCount]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentWinningLineFlashCount < 3) {
                setCurrentWinningLineFlashCount((prev) => prev + 1);
            } else {
                setCurrentWinningLineFlashCount(0);
                setCurrentWinningLineIndex((prev) => {
                    const nextIndex = winningLines.length > 1 ? (prev + 1) % winningLines.length : 0;
                    setCurrentWinningLine(winningLines[nextIndex]);
                    return nextIndex;
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [currentWinningLineFlashCount]);

    useEffect(() => {
        if (winningLines.length > 0) {
            setCurrentWinningLineIndex(0);
            console.log('Setting current winning line to:', winningLines[0]);
            setCurrentWinningLine(winningLines[0]);
        }
    }, [winningLines]);

    // Function to handle user verification
    const handleVerify = async (profileData: any) => {
        try {
            verifyUser(profileData);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Verification failed');
        }
    };

    const [isMuted, setIsMuted] = useState(false); // State for mute

    const handleMuteToggle = () => {
        setIsMuted((prev) => !prev);
        if (!isMuted) {
            stopAllSounds();
        }
    };

    const handleAutoSpinButton = () => {
        console.log('Auto spin button clicked');
        setAutoSpin((prev) => !prev);
    };

    // New state for bonus type selection
    const [showBonusTypeModal, setShowBonusTypeModal] = useState(false);
    const [selectedBonusType, setSelectedBonusType] = useState<'normal' | 'sticky' | ''>('');

    // Function to handle spinning the slot machine
    const handleSpin = async () => {
        // Stop all currently playing sounds before starting a new spin
        stopAllSounds();
        setShowOverlay(false);
        setShowConfetti(false);
        setSpinning(false);

        if (!steamProfile) return;
        if (freeSpins < 1 && (credits === null || credits < 5)) {
            console.log('Not enough credits or free spins');
            if (autoSpin) {
                console.log('Auto spin is enabled, disabling it while not enough credits or free spins');
                setAutoSpin(false);
            }
            return;
        }

        setSpinning(true);

        // Play handle pull sound when user clicks spin
        playHandlePull(isMuted);

        // Start fade out
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
            const spinResponse = await spinSlotMachine(steamId, code);
            if (!spinResponse.success) {
                setError(spinResponse.error || 'An error occurred during the spin.');
                setSpinning(false);
                return;
            }

            const spinResult = spinResponse.data!;
            const {
                finalVisibleGrid,
                spinAmounts,
                credits: updatedCredits,
                freeSpinsAvailable,
                winningCells: currWinningCells,
                bonusCells: currentBonusCells,
                winningLines: currWinningLines,
                bonusSpinsAwarded,
                stickyMultipliers,
                needsBonusTypeSelection,
                payout,
                bonusTriggered,
            } = spinResult;

            setSpinAmounts(spinAmounts);

            console.log('Final Visible Grid:', finalVisibleGrid);

            // Prepare reels for animation
            const newReels = finalVisibleGrid.map((finalReel, i) => {
                const spinSymbolsCount = spinAmounts[i];

                // Generate random spin symbols
                const spinSymbols = Array(spinSymbolsCount)
                    .fill(0)
                    .map(() => getRandomSymbol());

                // The new reel is spin symbols + final symbols
                return [...spinSymbols, ...finalReel];
            });

            setReels(newReels);

            // Play spin start sound for each reel when spinning starts

            // Wait for the animations to complete
            const maxDuration = 2 + 4 * 0.6 + 0.4; // For the last reel
            await new Promise((resolve) => setTimeout(resolve, maxDuration * 1000));

            // Update credits and other states
            setCredits(updatedCredits);
            setFreeSpins(freeSpinsAvailable);
            setResult(spinResult);
            setSpinning(false); // Spin is now complete

            // Update winning cells, bonus cells, and winning lines
            setWinningCells(currWinningCells);
            setBonusCells(currentBonusCells);
            setWinningLines(currWinningLines);
            setCurrentWinningLine(currWinningLines[0]);
            setCurrentWinningLineIndex(0);
            setShouldRefetchWinners(true); // Trigger refetch after spin is complete

            // Determine which sounds to play
            const hasNormalWin = payout.length > 0;
            const hasBonusWin = bonusSpinsAwarded > 0;

            if (hasNormalWin) {
                // Play win sound based on number of wins
                playWinSound(payout.length, isMuted);
            }

            if (hasBonusWin && !hasNormalWin) {
                // Play bonus sound only if there is no normal win
                playBonusWonSound(isMuted);
            }

            if (hasNormalWin || hasBonusWin) {
                setShowOverlay(true);
                setShowConfetti(true);
                setTimeout(() => {
                    setShowOverlay(false);
                    setShowConfetti(false);
                }, 2500);
            }

            if (bonusTriggered) {
                if (needsBonusTypeSelection) {
                    // Bonus type needs to be selected by the user
                    setIsBonusPending(true);
                    setShowBonusTypeModal(true);
                    setAutoSpin(false);
                } else {
                    // Bonus type was already set and spins were assigned
                }
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

    // Handle bonus type selection
    const handleBonusTypeSelection = async (type: 'normal' | 'sticky') => {
        setSelectedBonusType(type);
        setShowBonusTypeModal(false);
        setIsBonusPending(false);

        try {
            const bonusResponse = await setBonusType(steamProfile!.steamId, code, type);
            if (!bonusResponse.success) {
                setError(bonusResponse.error || 'Failed to set bonus type.');
                return;
            }
            let spins_remaining = bonusResponse.data!;
            if (spins_remaining > 0) {
                setFreeSpins(spins_remaining);
            }
            setAutoSpin(true);
        } catch (error) {
            console.error('Error assigning bonus spins:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while assigning bonus spins.');
        }
    };

    // Helper function to calculate the total height of the reel content
    const calculateReelHeight = (reelLength: number) => {
        return reelLength * ITEM_HEIGHT + (reelLength - 1) * GAP;
    };

    // State to manage sticky multipliers in the UI
    const [stickyMultipliers, setStickyMultipliers] = useState<{ x: number; y: number; multiplier: number }[]>([]);

    let currentWinningLinePoints = [];
    if (currentWinningLine && currentWinningLine.length > 0) {
        for (let i = 0; i < currentWinningLine.length; i++) {
            const [x, y] = currentWinningLine[i];
            currentWinningLinePoints.push(`${x * (ITEM_WIDTH + GAP) + ITEM_WIDTH / 2},${y * (ITEM_HEIGHT + GAP) + ITEM_HEIGHT / 2}`);
        }
    }

    useEffect(() => {
        const initializeUser = async () => {
            if (steamId && code) {
                // Attempt to load user data
                await loadUserData();
            } else {
                // If no steamId or code, make sure isVerified is false
                setIsVerified(false);
            }
        };

        initializeUser();
    }, []); // Run once on mount

    return (
        <ClientOnly>
            <div className="relative flex h-[calc(100dvh-50px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-stone-800 text-white">
                {/* Main Content Layer */}
                <div className="z-10 flex w-full flex-col items-center">
                    {/* Slot Machine Section with Background Images */}
                    <div className="flex w-full flex-row items-center justify-center">
                        {/* Left Hazmat Image */}
                        <div className="hidden h-full w-1/4 items-end justify-end md:!flex">
                            <Image
                                src="/rust_hazmat_icon_large.png"
                                alt="Rust Hazmat Icon Left"
                                width={512}
                                height={512}
                                className="h-auto w-auto"
                            />
                        </div>

                        {/* Slot Machine */}
                        <div className="w-full p-4 md:w-1/2">
                            <div className="relative flex flex-col items-center space-y-2">
                                <div
                                    className="relative overflow-hidden rounded-lg bg-gray-700 p-2"
                                    style={{
                                        height: `${VISIBLE_ITEMS * ITEM_HEIGHT + (VISIBLE_ITEMS - 1) * GAP + 4 + 8}px`,
                                        width: `${5 * ITEM_WIDTH + 4 * GAP + 4 + 8}px`,
                                    }}
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={spinKey}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1.2 }}
                                            className="grid grid-cols-5 gap-0"
                                        >
                                            {reels.map((reel, i) => (
                                                <motion.div
                                                    key={`reel-${i}-${reel.length}-${spinKey}`}
                                                    className="flex flex-col items-center"
                                                    animate={
                                                        spinning && spinAmounts.length > 0
                                                            ? {
                                                                  y: -(
                                                                      calculateReelHeight(reel.length) - calculateReelHeight(VISIBLE_ITEMS)
                                                                  ),
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
                                                    // Play spin start sound when animation starts
                                                    onAnimationStart={() => playSpinStart(isMuted)}
                                                    // Play spin end sound when animation completes
                                                    onAnimationComplete={() => playSpinEnd(isMuted)}
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
                                                                {/* Highlight for winning and bonus cells */}
                                                                {isDisplayed &&
                                                                    winningCells.some(
                                                                        (cell) => cell[0] === i && cell[1] === displayedIndex,
                                                                    ) && <div className="absolute inset-0 z-10 bg-red-500 opacity-50" />}
                                                                {isDisplayed &&
                                                                    bonusCells.some(
                                                                        (cell) => cell[0] === i && cell[1] === displayedIndex,
                                                                    ) && <div className="absolute inset-0 z-10 bg-green-500 opacity-50" />}
                                                                {SYMBOL_IMAGE_PATHS[item] ? (
                                                                    <Image
                                                                        src={SYMBOL_IMAGE_PATHS[item]}
                                                                        alt={item}
                                                                        width={ITEM_WIDTH - 10}
                                                                        height={ITEM_HEIGHT - 10}
                                                                        className="z-50"
                                                                    />
                                                                ) : (
                                                                    <span className="z-50 text-4xl">{item}</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    </AnimatePresence>
                                    {/* Cycle through each winning line */}
                                    {!spinning && winningLines && winningLines.length > 0 && (
                                        <div className="absolute inset-0">
                                            <svg key={`winning-line`} className="absolute inset-0 z-50 h-full w-full">
                                                <polyline
                                                    points={currentWinningLinePoints.join(' ')}
                                                    fill="none"
                                                    stroke={'#32CD32'}
                                                    strokeWidth="4"
                                                    opacity={currentWinningLineFlashCount % 2 === 0 ? 1 : 0}
                                                />
                                            </svg>
                                        </div>
                                    )}
                                    {/* Render the lines when lineType is set */}
                                    {lineType && (
                                        <div className="absolute inset-0">
                                            {WINNING_LINES[lineType].map((line, index) => (
                                                <svg key={`${lineType}-${index}`} className="absolute inset-0 z-50 h-full w-full">
                                                    <polyline
                                                        points={line
                                                            .map(
                                                                ([x, y]) =>
                                                                    `${x * (ITEM_WIDTH + GAP) + ITEM_WIDTH / 2},${y * (ITEM_HEIGHT + GAP) + ITEM_HEIGHT / 2}`,
                                                            )
                                                            .join(' ')}
                                                        fill="none"
                                                        stroke={'#32CD32'}
                                                        strokeWidth="4"
                                                        opacity={lineFlashCount % 2 === 0 ? 1 : 0}
                                                    />
                                                </svg>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <AnimatePresence>
                                    {showOverlay && result && (
                                        <div className="absolute flex h-full w-full items-center justify-center">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="absolute m-16 flex h-fit w-[calc(75dvw)] items-center justify-center rounded-lg bg-black bg-opacity-70 p-16 sm:!w-[calc(100dvw*0.75/3)]"
                                            >
                                                <div className="text-center">
                                                    <h2 className="mb-4 text-4xl font-bold">You Won!</h2>
                                                    {result.payout.map((item, index) => (
                                                        <p key={index} className="text-2xl">
                                                            {item.quantity}x {item.full_name}
                                                        </p>
                                                    ))}
                                                    {result.bonusSpinsAwarded > 0 && (
                                                        <p className="text-2xl text-yellow-400">Free Spins Won!</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}
                                </AnimatePresence>
                                {showConfetti && (
                                    <Confetti
                                        className="absolute flex h-fit w-full items-center justify-center rounded-lg p-8"
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

                        {/* Right Hazmat Image */}
                        <div className="hidden h-full w-1/4 items-end justify-start md:!flex">
                            <Image
                                src="/rust_hazmat_icon_large.png"
                                alt="Rust Hazmat Icon Right"
                                width={512}
                                height={512}
                                className="h-auto w-auto scale-x-[-1]"
                            />
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="w-full max-w-[1200px] px-4">
                        <div className="flex flex-col space-y-4 rounded-lg bg-stone-700 p-4">
                            {/* User info and controls row */}
                            <div className="flex w-full flex-col items-start justify-between space-y-2">
                                {/* User info and credits */}
                                <div className="flex w-full flex-row justify-between">
                                    <div className="flex items-center">
                                        <Image
                                            src={steamProfile?.avatarUrl || '/steam_icon_small.png'}
                                            alt="Steam Avatar"
                                            width={40}
                                            height={40}
                                            className="mr-2 rounded-full"
                                        />
                                        <span className="text-xl font-bold">{steamProfile?.name || 'Unknown Player'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FaCoins className="h-10 w-10 text-primary_light" />
                                        <span className="text-xl font-bold text-white">{credits || '0'}</span>
                                    </div>
                                </div>

                                {/* Control buttons */}
                                <div className="flex w-full justify-end space-x-2">
                                    {/* Spin Button */}
                                    <button
                                        data-tooltip-id="spin-tooltip"
                                        data-tooltip-place="top"
                                        data-tooltip-offset={6}
                                        onClick={handleSpin}
                                        disabled={!isVerified || spinning || (credits !== null && credits < 5 && freeSpins === 0)}
                                        className="rounded-lg bg-primary_light p-3 text-stone-800 hover:bg-primary hover:text-stone-300 disabled:bg-gray-400"
                                    >
                                        {freeSpins > 0 ? (
                                            <div className="flex h-6 w-6 items-center justify-center">
                                                <b className="text-2xl">{freeSpins}</b>
                                            </div>
                                        ) : (
                                            <FaCoins className="h-6 w-6" />
                                        )}
                                    </button>
                                    <Tooltip id="spin-tooltip">
                                        {spinning
                                            ? 'Spinning...'
                                            : freeSpins > 0
                                              ? `${freeSpins} Free Spins Remaining`
                                              : `Spin (5 credits)`}
                                    </Tooltip>

                                    {/* Auto Spin Button */}
                                    <button
                                        data-tooltip-id="auto-spin-tooltip"
                                        data-tooltip-place="top"
                                        data-tooltip-offset={6}
                                        onClick={handleAutoSpinButton}
                                        disabled={!isVerified || (credits !== null && credits < 5 && freeSpins === 0)}
                                        className="rounded-lg bg-primary_light p-3 text-stone-800 hover:bg-primary hover:text-stone-300 disabled:bg-gray-400"
                                    >
                                        {autoSpin ? <FaPause className="h-6 w-6" /> : <FaPlay className="h-6 w-6" />}
                                    </button>
                                    <Tooltip id="auto-spin-tooltip">{autoSpin ? 'Stop Auto Spins' : 'Start Auto Spins'}</Tooltip>

                                    {/* Show Lines Button */}
                                    <button
                                        data-tooltip-id="show-lines-tooltip"
                                        data-tooltip-place="top"
                                        data-tooltip-offset={6}
                                        onClick={handleShowLines}
                                        className="rounded-lg bg-stone-300 p-3 text-primary hover:bg-stone-800 hover:text-primary_light"
                                    >
                                        <FaInfoCircle className="h-6 w-6" />
                                    </button>
                                    <Tooltip id="show-lines-tooltip">Show Winning Lines</Tooltip>

                                    {/* Sound Toggle Button */}
                                    <button
                                        data-tooltip-id="sound-tooltip"
                                        data-tooltip-place="top"
                                        data-tooltip-offset={6}
                                        onClick={handleMuteToggle}
                                        className="rounded-lg bg-stone-300 p-3 text-primary hover:bg-stone-800 hover:text-primary_light"
                                    >
                                        {isMuted ? <FaVolumeMute className="h-6 w-6" /> : <FaVolumeHigh className="h-6 w-6" />}
                                    </button>
                                    <Tooltip id="sound-tooltip">{isMuted ? 'Turn Sound On' : 'Turn Sound Off'}</Tooltip>
                                </div>
                            </div>

                            {error && <p className="text-red-500">{error}</p>}
                        </div>
                    </div>

                    {/* Recent Winners Section */}
                    <div className="mt-4 w-full max-w-[1200px] px-4 pb-4">
                        <div className="rounded-lg bg-stone-700 p-4">
                            <RecentSlotWinners
                                shouldRefetch={shouldRefetchWinners}
                                onRefetchComplete={() => setShouldRefetchWinners(false)}
                                spinning={spinning}
                            />
                        </div>
                    </div>
                </div>

                {/* Sign-In Modal */}
                {!isVerified && (
                    <div className="absolute inset-0">
                        <SteamSignInModal
                            steamInput={steamInput}
                            setSteamInput={setSteamInput}
                            code={code}
                            setCode={setCode}
                            onVerify={handleVerify}
                            error={error}
                        />
                    </div>
                )}

                {/* Bonus Type Selection Modal */}
                <AnimatePresence>
                    {showBonusTypeModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-800 bg-opacity-50"
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                className="rounded-lg bg-stone-800 p-8 text-white shadow-lg"
                            >
                                <h2 className="mb-6 text-center text-2xl font-bold">Choose Bonus Type</h2>
                                <div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
                                    {/* Normal Bonus Button */}
                                    <button onClick={() => handleBonusTypeSelection('normal')} className="group relative">
                                        <Image
                                            src="/rust_icons/normal_bonus_banner.png"
                                            alt="Normal Bonus"
                                            width={300}
                                            height={100}
                                            className="rounded-lg"
                                        />
                                        {/* Overlay on Hover */}
                                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-stone-900 bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-70">
                                            <p className="px-4 text-center opacity-0 group-hover:opacity-100">
                                                More spins, lower volatility. Multipliers do not stick for all spins.
                                            </p>
                                        </div>
                                    </button>

                                    {/* Sticky Bonus Button */}
                                    <button onClick={() => handleBonusTypeSelection('sticky')} className="group relative">
                                        <Image
                                            src="/rust_icons/sticky_bonus_banner.png"
                                            alt="Sticky Bonus"
                                            width={300}
                                            height={100}
                                            className="rounded-lg"
                                        />
                                        {/* Overlay on Hover */}
                                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-stone-900 bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-70">
                                            <p className="px-4 text-center opacity-0 group-hover:opacity-100">
                                                Less spins, higher volatility. Multipliers will stay in place for all spins.
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ClientOnly>
    );
}
