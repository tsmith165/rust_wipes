'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMachineStore } from '@/stores/machine_store';
import { useSlotStore } from '@/stores/slot_store';
import { useSteamUser } from '@/stores/steam_user_store';
import { spinSlotMachine, setBonusType } from './Slot.Actions';
import { getRandomSymbol } from './Slot.Utils';
import { MachineContainer } from '@/components/machine';
import SlotGame from './Slot.Game';
import SlotControls from './Slot.Controls';
import RecentSlotWinners from './Slot.RecentWinners';
import SteamSignInModal from '@/components/SteamSignInModal';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
    WINDOW_SIZE_SMALL_THRESHOLD,
    WINDOW_SIZE_MEDIUM_THRESHOLD,
    WINDOW_SIZE_LARGE_THRESHOLD,
    WINDOW_SIZE_EXTRA_LARGE_THRESHOLD,
    ITEM_SIZE_EXTRA_LARGE,
    ITEM_SIZE_LARGE,
    ITEM_SIZE_MEDIUM,
    ITEM_SIZE_SMALL,
    ITEM_SIZE_EXTRA_SMALL,
} from './Slot.Constants';

const MachineWinOverlay = dynamic(() => import('@/components/machine/Machine.WinOverlay'), {
    ssr: false,
});

// Constants
const GAP = 2;
const VISIBLE_ITEMS = 5;

interface SlotContainerProps {
    initialSymbols: string[][];
}

export default function SlotContainer({ initialSymbols }: SlotContainerProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [ITEM_HEIGHT, setItemHeight] = useState(ITEM_SIZE_EXTRA_SMALL);
    const [ITEM_WIDTH, setItemWidth] = useState(ITEM_SIZE_EXTRA_SMALL);

    const itemHeightRef = useRef(ITEM_HEIGHT);
    const itemWidthRef = useRef(ITEM_WIDTH);

    useEffect(() => {
        itemHeightRef.current = ITEM_HEIGHT;
    }, [ITEM_HEIGHT]);

    useEffect(() => {
        itemWidthRef.current = ITEM_WIDTH;
    }, [ITEM_WIDTH]);

    useEffect(() => {
        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            const currentItemSize = getScreenSize();
            if (currentItemSize !== itemHeightRef.current || currentItemSize !== itemWidthRef.current) {
                setItemHeight(currentItemSize);
                setItemWidth(currentItemSize);
            }
        };
        updateWindowSize();
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

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

    // Machine Store
    const {
        spinning,
        autoSpin,
        isMuted,
        showOverlay,
        showConfetti,
        error,
        freeSpins,
        result,
        setSpinning,
        setShowOverlay,
        setShowConfetti,
        setError,
        setFreeSpins,
        setResult,
    } = useMachineStore();

    // Slot Store
    const {
        reels,
        spinAmounts,
        spinKey,
        winningCells,
        bonusCells,
        winningLines,
        currentWinningLine,
        currentWinningLineFlashCount,
        lineType,
        lineFlashCount,
        showBonusTypeModal,
        isBonusPending,
        setReels,
        setSpinAmounts,
        incrementSpinKey,
        setWinningCells,
        setBonusCells,
        setWinningLines,
        setCurrentWinningLine,
        setCurrentWinningLineFlashCount,
        setLineType,
        setLineFlashCount,
        setShowBonusTypeModal,
        setIsBonusPending,
        cycleLineType,
        cycleWinningLine,
    } = useSlotStore();

    // Steam User Store
    const {
        isVerified,
        steamId,
        authCode: code,
        credits,
        profile: steamProfile,
        verifyUser,
        setSteamId,
        setAuthCode: setCode,
        steamInput,
        setSteamInput,
        loadUserData,
        freeSpins: userFreeSpins,
    } = useSteamUser();

    // State for modal visibility
    const [showSignInModal, setShowSignInModal] = useState(!isVerified);

    // Update modal visibility when verification status changes
    useEffect(() => {
        setShowSignInModal(!isVerified);
    }, [isVerified]);

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

    // Function to play a sound
    const playSound = (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
        if (isMuted) return;
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((error) => {
                console.error('Error playing sound:', error);
            });
        }
    };

    // Initialize reels with server-generated symbols
    useEffect(() => {
        if (!reels || reels.length === 0) {
            setReels(initialSymbols);
        }
    }, [initialSymbols, reels, setReels]);

    // Auto spin effect
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (autoSpin && !spinning && !isBonusPending) {
            timeoutId = setTimeout(handleSpin, 1000);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [autoSpin, spinning, isBonusPending]);

    // Handle spin
    const handleSpin = async () => {
        if (!steamProfile) return;
        if (freeSpins < 1 && (credits === null || credits < 5)) {
            console.log('Not enough credits or free spins');
            return;
        }

        stopAllSounds();
        setShowOverlay(false);
        setShowConfetti(false);
        setSpinning(true);
        playSound(handlePullSoundRef);
        incrementSpinKey();

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
                spinAmounts: newSpinAmounts,
                winningCells: newWinningCells,
                bonusCells: newBonusCells,
                winningLines: newWinningLines,
                bonusSpinsAwarded,
                needsBonusTypeSelection,
                payout,
                bonusTriggered,
                freeSpinsAvailable,
            } = spinResult;

            setSpinAmounts(newSpinAmounts);
            setReels(
                finalVisibleGrid.map((finalReel, i) => {
                    const spinSymbolsCount = newSpinAmounts[i];
                    const spinSymbols = Array(spinSymbolsCount)
                        .fill(0)
                        .map(() => getRandomSymbol());
                    return [...spinSymbols, ...finalReel];
                }),
            );

            // Wait for animations
            await new Promise((resolve) => setTimeout(resolve, (2 + 4 * 0.6 + 0.4) * 1000));

            setWinningCells(newWinningCells);
            setBonusCells(newBonusCells);
            setWinningLines(newWinningLines);
            if (newWinningLines.length > 0) {
                setCurrentWinningLine(newWinningLines[0]);
            }
            setFreeSpins(freeSpinsAvailable);
            setResult(spinResult);
            setSpinning(false);

            // Handle win effects
            const hasNormalWin = payout.length > 0;
            const hasBonusWin = bonusSpinsAwarded > 0;

            if (hasNormalWin) {
                playSound(payout.length >= 3 ? win3SoundRef : payout.length >= 2 ? win2SoundRef : win1SoundRef);
            }

            if (hasBonusWin && !hasNormalWin) {
                playSound(bonusWonSoundRef);
            }

            if (hasNormalWin || hasBonusWin) {
                setShowOverlay(true);
                setShowConfetti(true);
                setTimeout(() => {
                    setShowOverlay(false);
                    setShowConfetti(false);
                }, 2500);
            }

            if (bonusTriggered && needsBonusTypeSelection) {
                setIsBonusPending(true);
                setShowBonusTypeModal(true);
            }
        } catch (error) {
            console.error('Error spinning slot machine:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while spinning the slot machine.');
            setSpinning(false);
        }
    };

    // Handle bonus type selection
    const handleBonusTypeSelection = async (type: 'normal' | 'sticky') => {
        setShowBonusTypeModal(false);
        setIsBonusPending(false);

        try {
            const bonusResponse = await setBonusType(steamId, code, type);
            if (!bonusResponse.success) {
                setError(bonusResponse.error || 'Failed to set bonus type.');
                return;
            }
            const spinsRemaining = bonusResponse.data!;
            if (spinsRemaining > 0) {
                setFreeSpins(spinsRemaining);
            }
        } catch (error) {
            console.error('Error assigning bonus spins:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while assigning bonus spins.');
        }
    };

    // Add effects for line flashing
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (lineType !== null) {
            timer = setInterval(() => {
                cycleLineType();
            }, 500);
        }
        return () => clearInterval(timer);
    }, [lineType, cycleLineType]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (winningLines.length > 0) {
            timer = setInterval(() => {
                cycleWinningLine();
            }, 500);
        }
        return () => clearInterval(timer);
    }, [winningLines, cycleWinningLine]);

    // Handle show lines
    const handleShowLines = () => {
        if (!lineType) {
            setLineType('horizontal');
        } else {
            cycleLineType();
        }
    };

    useEffect(() => {
        if (steamId && code) {
            loadUserData();
        }
    }, [steamId, code, loadUserData]);

    // Add this effect to sync free spins
    useEffect(() => {
        if (userFreeSpins !== undefined) {
            setFreeSpins(userFreeSpins);
        }
    }, [userFreeSpins, setFreeSpins]);

    return (
        <div className="flex h-[calc(100dvh-50px)] w-full flex-col overflow-x-hidden overflow-y-hidden text-white">
            <div className="flex h-[40dvh] items-center justify-center sm:h-[50dvh] md:h-[60dvh]">
                <MachineContainer leftCharacterImage="/rust_hazmat_icon_large.png" rightCharacterImage="/rust_hazmat_icon_large.png">
                    <div className="flex w-full flex-col space-y-4">
                        {/* Game Area */}
                        <div className="flex h-full items-center justify-center">
                            <SlotGame
                                reels={reels}
                                spinAmounts={spinAmounts}
                                spinKey={spinKey}
                                winningCells={winningCells}
                                bonusCells={bonusCells}
                                winningLines={winningLines}
                                currentWinningLine={currentWinningLine}
                                currentWinningLineFlashCount={currentWinningLineFlashCount}
                                ITEM_HEIGHT={ITEM_HEIGHT}
                                ITEM_WIDTH={ITEM_WIDTH}
                                GAP={GAP}
                                VISIBLE_ITEMS={VISIBLE_ITEMS}
                                lineType={lineType}
                                lineFlashCount={lineFlashCount}
                            />
                        </div>

                        {/* Win Overlay */}
                        {isMounted && <MachineWinOverlay showOverlay={showOverlay} showConfetti={showConfetti} result={result} />}

                        {/* Sign-In Modal */}
                        <SteamSignInModal
                            steamInput={steamInput}
                            setSteamInput={setSteamInput}
                            code={code}
                            setCode={setCode}
                            onVerify={verifyUser}
                            error={error}
                            showModal={showSignInModal}
                            setShowModal={setShowSignInModal}
                        />
                    </div>
                </MachineContainer>
            </div>
            <div className="flex h-full flex-col bg-stone-600">
                {/* Controls Area */}
                <SlotControls onSpin={handleSpin} onShowLines={handleShowLines} />

                {/* Recent Winners */}
                <div className="flex-1 overflow-y-auto">
                    <RecentSlotWinners spinning={spinning} />
                </div>
            </div>

            {/* Bonus Type Modal */}
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
    );
}
