'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';

import { SlotContainer } from '@/components/slot/base/Slot.Container';
import { SlotGrid } from '@/components/slot/game/Slot.Grid';
import { SlotControls } from '@/components/slot/base/Slot.Controls';
import { SlotSoundManager } from '@/components/slot/game/Slot.SoundManager';
import { SlotRecentWinners } from '@/components/slot/game/Slot.RecentWinners';
import SteamSignInModal from '@/components/SteamSignInModal';
import { SlotConfettiOverlay } from '@/components/slot/game/Slot.ConfettiOverlay';

import { spinSlotMachine, setBonusType, checkPendingBonus, getRecentSlotWinners } from './Default.Actions';
import type { SpinResult } from './Default.Actions';
import { useSteamUser } from '@/stores/steam_user_store';
import { useSlotGame } from '@/stores/slot_game_store';
import { getRandomSymbol } from '@/app/gambling/slot/Slot.Utils';
import { SYMBOL_IMAGE_PATHS } from '../../slot/Slot.Constants';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface Winner {
    player_name: string;
    steam_id: string;
    payout: Array<{ quantity: number; full_name: string }>;
    timestamp: string;
    profile_picture_url: string | null;
    bonus_type: string;
    free_spins_won: number;
    pending_bonus_amount: number;
}

interface LocalWinner {
    playerName: string;
    steamId: string;
    payout: Array<{ quantity: number; full_name: string }>;
    timestamp: string;
    profilePicture?: string;
    bonusType?: 'normal' | 'sticky';
    bonusAmount?: number;
}

export const DefaultSlotContainer = function DefaultSlotContainer() {
    // Steam User Store
    const {
        steamInput,
        setSteamInput,
        authCode,
        setAuthCode,
        profile: steamProfile,
        verifyUser,
        credits,
        freeSpins,
        loadUserData,
        steamId,
        setIsVerified,
        isVerified,
        setFreeSpins,
    } = useSteamUser();

    // Slot Game Store
    const slotGame = useSlotGame();
    const spinning = slotGame.isSpinning;
    const setSpinning = slotGame.setSpinning;
    const autoSpinning = slotGame.isAutoSpinning;
    const setAutoSpinning = slotGame.setAutoSpinning;
    const soundEnabled = !slotGame.isMuted;
    const setSoundEnabled = (enabled: boolean) => slotGame.setMuted(!enabled);
    const volume = slotGame.volume;
    const setVolume = slotGame.setVolume;
    const result = slotGame.lastResult;
    const setResult = slotGame.setLastResult;
    const spinKey = slotGame.spinKey;
    const setSpinKey = slotGame.setSpinKey;
    const currentWinningLine = slotGame.currentWinningLine;
    const setCurrentWinningLine = slotGame.setCurrentWinningLine;
    const currentWinningLineFlashCount = slotGame.currentWinningLineFlashCount;
    const incrementWinningLineFlashCount = slotGame.incrementWinningLineFlashCount;
    const showOverlay = slotGame.showWinOverlay;
    const setShowOverlay = slotGame.setShowWinOverlay;
    const showBonusModal = slotGame.showBonusModal;
    const setShowBonusModal = slotGame.setShowBonusModal;

    // Local State
    const [showConfetti, setShowConfetti] = useState(false);
    const [error, setError] = useState('');
    const [winners, setWinners] = useState<LocalWinner[]>([]);
    const [isLoadingWinners, setIsLoadingWinners] = useState(false);
    const [winnersError, setWinnersError] = useState<string | null>(null);

    // Refs
    const winOverlayRef = useRef<HTMLDivElement>(null);
    const autoSpinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const soundManagerRef = useRef<{
        playHandlePull: () => void;
        playSpinStart: () => void;
        playSpinEnd: () => void;
        playWinSound: (numWins: number) => void;
        playBonusWon: () => void;
        stopAllSounds: () => void;
    } | null>(null);

    // Effects
    useEffect(() => {
        const initializeUser = async () => {
            if (steamId && authCode) {
                // Attempt to load user data
                await loadUserData();
            } else {
                // If no steamId or code, make sure isVerified is false
                setIsVerified(false);
            }
        };

        initializeUser();
    }, []); // Run once on mount

    useEffect(() => {
        if (steamProfile?.steamId && steamProfile.code) {
            loadUserData();
        }
    }, [steamProfile, loadUserData]);

    useEffect(() => {
        if (autoSpinning) {
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
    }, [autoSpinning]);

    // Function to fetch winners
    const fetchWinners = async () => {
        setIsLoadingWinners(true);
        try {
            const response = await getRecentSlotWinners();
            if (response.success && response.data) {
                setWinners(
                    response.data.map((winner: Winner) => ({
                        playerName: winner.player_name,
                        steamId: winner.steam_id,
                        payout: winner.payout.map((item: { quantity: number; full_name: string }) => ({
                            quantity: item.quantity,
                            full_name: item.full_name,
                        })),
                        timestamp: winner.timestamp,
                        profilePicture: winner.profile_picture_url || undefined,
                        bonusType: winner.bonus_type === 'normal' || winner.bonus_type === 'sticky' ? winner.bonus_type : undefined,
                        bonusAmount: winner.free_spins_won > 0 ? winner.free_spins_won : winner.pending_bonus_amount,
                    })),
                );
                setWinnersError(null);
            } else {
                setWinnersError(response.error || 'Failed to fetch winners');
            }
        } catch (err) {
            setWinnersError('An error occurred while fetching winners');
        } finally {
            setIsLoadingWinners(false);
        }
    };

    // Effect to fetch winners periodically
    useEffect(() => {
        // Initial fetch
        fetchWinners();

        // Set up interval for periodic updates
        const interval = setInterval(fetchWinners, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    // Effect to refetch winners after a spin
    useEffect(() => {
        if (result) {
            fetchWinners();
        }
    }, [result]);

    // Initialize grid with random symbols
    useEffect(() => {
        // Only initialize on client side
        if (typeof window === 'undefined') return;

        const initialGrid = Array(5)
            .fill(0)
            .map(() =>
                Array(5)
                    .fill(0)
                    .map(() => getRandomSymbol()),
            );
        slotGame.setGrid(initialGrid);
    }, []);

    // Functions
    const startAutoSpin = () => {
        if (autoSpinning) {
            autoSpinTimeoutRef.current = setTimeout(() => {
                handleSpin();
                if (autoSpinning) {
                    startAutoSpin();
                }
            }, 10000);
        }
    };

    const handleSpin = async () => {
        if (!steamProfile?.steamId || !steamProfile.code) return;

        // Stop all currently playing sounds
        soundManagerRef.current?.stopAllSounds();

        setShowOverlay(false);
        setShowConfetti(false);
        setSpinning(false);
        slotGame.setWinningLinesVisibility(false);
        slotGame.setCurrentWinningLine([]);
        slotGame.setWinningLines([]);

        // Reset to initial grid state
        const initialGrid = Array(5)
            .fill(0)
            .map(() =>
                Array(5)
                    .fill(0)
                    .map(() => getRandomSymbol()),
            );
        slotGame.setGrid(initialGrid);

        // Important: Wait for the initial grid to be rendered
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Start spinning state AFTER grid remount
        setSpinning(true);
        setError('');

        // Play handle pull sound
        soundManagerRef.current?.playHandlePull();

        // Wait for handle pull sound to start
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
            // Get the spin result first
            const spinResult = await spinSlotMachine(steamProfile.steamId, steamProfile.code);
            if (!spinResult.success) {
                setError(spinResult.error || 'An error occurred during the spin.');
                setSpinning(false);
                return;
            }

            if (spinResult.data) {
                // Play spin start sound
                soundManagerRef.current?.playSpinStart();

                // Generate extended grid for animation
                const extendedGrid = spinResult.data.finalVisibleGrid.map((finalReel, i) => {
                    const spinSymbolsCount = 15 + i * 5; // Stagger the reel lengths
                    const additionalSymbols = Array(spinSymbolsCount)
                        .fill(0)
                        .map(() => getRandomSymbol());
                    return [...additionalSymbols, ...finalReel];
                });

                // Set the extended grid and spin amounts for animation
                slotGame.setGrid(extendedGrid);
                slotGame.setSpinAmounts(extendedGrid.map((reel) => reel.length - 5)); // Set spin amounts based on extended grid lengths

                // Force a remount of the grid component
                slotGame.setSpinKey(spinKey + 1);

                // Wait for spin animations to complete (2 seconds base + 0.5 seconds per reel)
                const maxDuration = 2 + 4 * 0.5 + 0.5; // Base duration + time for last reel + extra time for final tick
                await new Promise((resolve) => setTimeout(resolve, maxDuration * 1000));

                // Set final grid state
                slotGame.setGrid(spinResult.data.finalVisibleGrid);
                slotGame.setSpinAmounts([]); // Clear spin amounts after animation

                // Update game state with results
                slotGame.setLastResult(spinResult.data);
                slotGame.setWinningCells(spinResult.data.winningCells);
                slotGame.setBonusCells(spinResult.data.bonusCells);
                slotGame.setWinningLines(spinResult.data.winningLines);
                slotGame.setWinningLinesVisibility(true);

                // Set initial winning line
                if (spinResult.data.winningLines.length > 0) {
                    slotGame.setCurrentWinningLine(spinResult.data.winningLines[0]);
                }

                // Play end of spin sound if no wins
                if (!spinResult.data.needsBonusTypeSelection && (!spinResult.data.payout || spinResult.data.payout.length === 0)) {
                    setTimeout(() => {
                        soundManagerRef.current?.playSpinEnd();
                    }, 200);
                }

                if (spinResult.data.needsBonusTypeSelection) {
                    setShowBonusModal(true);
                    // Play bonus sound after a short delay
                    setTimeout(() => {
                        soundManagerRef.current?.playBonusWon();
                    }, 500);
                }

                if (spinResult.data.payout.length > 0) {
                    setShowConfetti(true);
                    setShowOverlay(true);

                    // Play win sound after a short delay
                    setTimeout(() => {
                        soundManagerRef.current?.playWinSound(spinResult.data!.payout.length);
                    }, 500);

                    // Add the new win to the winners list
                    const newWinner = {
                        playerName: steamProfile.name,
                        steamId: steamProfile.steamId,
                        payout: spinResult.data.payout.map(({ quantity, full_name }) => ({ quantity, full_name })),
                        timestamp: new Date().toISOString(),
                        profilePicture: steamProfile.avatarUrl,
                        bonusType: spinResult.data.needsBonusTypeSelection ? undefined : ('normal' as const),
                        bonusAmount: spinResult.data.bonusSpinsAwarded,
                    };
                    setWinners((prev) => [newWinner, ...prev]);

                    // Auto-hide the overlay after 2.5 seconds
                    setTimeout(() => {
                        setShowOverlay(false);
                        setShowConfetti(false);
                    }, 2500);
                }
            }
        } catch (err) {
            setError('Failed to spin. Please try again.');
        } finally {
            setSpinning(false);
        }
    };

    const handleBonusTypeSelection = async (type: 'normal' | 'sticky') => {
        if (!steamProfile?.steamId || !steamProfile.code) return;

        try {
            const response = await setBonusType(steamProfile.steamId, steamProfile.code, type);
            if (!response.success) {
                setError(response.error || 'Failed to set bonus type.');
                return;
            }

            // Update free spins count
            if (response.data) {
                setFreeSpins(response.data);
            }

            // Update the most recent winner with the selected bonus type
            setWinners((prev) => {
                if (prev.length === 0) return prev;
                const [mostRecent, ...rest] = prev;
                return [
                    {
                        ...mostRecent,
                        bonusType: type,
                        bonusAmount: response.data || mostRecent.bonusAmount,
                    },
                    ...rest,
                ];
            });

            // Close the bonus modal
            setShowBonusModal(false);

            // Start auto spins if free spins are available
            if (response.data && response.data > 0) {
                setAutoSpinning(true);
            }
        } catch (err) {
            setError('Failed to set bonus type. Please try again.');
        }
    };

    // Effect to check for pending bonus on mount
    useEffect(() => {
        const checkForPendingBonus = async () => {
            if (!steamProfile?.steamId || !steamProfile.code) return;

            try {
                const response = await checkPendingBonus(steamProfile.steamId, steamProfile.code);
                if (response.success && response.data?.pending) {
                    setShowBonusModal(true);
                    setShowConfetti(true);
                    // Only play sound if user has interacted with the page
                    if (document.visibilityState === 'visible' && document.hasFocus()) {
                        setTimeout(() => {
                            soundManagerRef.current?.playBonusWon();
                        }, 1000);
                    }
                }
            } catch (err) {
                console.error('Error checking pending bonus:', err);
            }
        };

        checkForPendingBonus();
    }, [steamProfile]);

    // Define the three main sections
    const slot_grid = (
        <div className="z-50 w-full p-4">
            <div className="relative flex flex-col items-center space-y-2">
                <SlotGrid soundManagerRef={soundManagerRef} />
            </div>
        </div>
    );

    const slot_controls = (
        <SlotControls
            onSpin={handleSpin}
            onToggleMute={() => setSoundEnabled(!soundEnabled)}
            onToggleAutoSpin={() => setAutoSpinning(!autoSpinning)}
            isMuted={!soundEnabled}
            isAutoSpinning={autoSpinning}
            credits={credits}
            freeSpins={freeSpins}
            isLoading={spinning}
            steamProfile={
                steamProfile
                    ? {
                          name: steamProfile.name,
                          avatarUrl: steamProfile.avatarUrl,
                          steamId: steamProfile.steamId,
                      }
                    : undefined
            }
        />
    );

    const slot_recent_winners = (
        <SlotRecentWinners winners={winners} isLoading={isLoadingWinners} error={winnersError || undefined} onRefresh={fetchWinners} />
    );

    return (
        <div className="relative flex h-[calc(100dvh-50px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-stone-800 text-white">
            <SlotContainer slot_grid={slot_grid} slot_controls={slot_controls} slot_recent_winners={slot_recent_winners} />

            {/* Sound Manager */}
            <SlotSoundManager
                isMuted={!soundEnabled}
                volume={volume}
                onVolumeChange={setVolume}
                onMuteToggle={() => setSoundEnabled(!soundEnabled)}
                ref={soundManagerRef}
            />

            {/* Modals */}
            {!isVerified && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                    <SteamSignInModal
                        steamInput={steamInput}
                        setSteamInput={setSteamInput}
                        code={authCode}
                        setCode={setAuthCode}
                        onVerify={verifyUser}
                        error={error}
                    />
                </div>
            )}

            {/* Win Overlay */}
            <AnimatePresence>
                {showOverlay && result && (
                    <div
                        ref={winOverlayRef}
                        className="absolute inset-0 z-50 flex items-center justify-center"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            maxWidth: '600px',
                            height: 'auto',
                            pointerEvents: 'none',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="rounded-lg bg-stone-700 bg-opacity-90 p-8 text-center"
                        >
                            <h2 className="mb-4 text-4xl font-bold">You Won!</h2>
                            <div className="space-y-2">
                                {result.payout?.map((item, index) => (
                                    <div key={index} className="flex items-center justify-center space-x-2">
                                        <span className="text-2xl">{item.quantity}x</span>
                                        <span className="text-2xl">{item.full_name}</span>
                                        <Image src={SYMBOL_IMAGE_PATHS[item.item]} alt={item.full_name} width={32} height={32} />
                                    </div>
                                ))}
                                {result.bonusSpinsAwarded > 0 && (
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="text-2xl text-yellow-400">{result.bonusSpinsAwarded}x Free Spins</span>
                                        <Image src="/rust_icons/bonus_symbol.png" alt="Bonus Spins" width={32} height={32} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confetti Overlay */}
            <SlotConfettiOverlay
                isVisible={showConfetti}
                onComplete={() => setShowConfetti(false)}
                config={{
                    numberOfPieces: 200,
                    gravity: 0.2,
                    initialVelocityX: 5,
                    initialVelocityY: 20,
                }}
            />

            {/* Bonus Type Selection Modal */}
            <AnimatePresence>
                {showBonusModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-800 bg-opacity-50">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="rounded-lg bg-stone-900 p-8 text-white shadow-lg"
                        >
                            <h2 className="mb-2 text-center text-4xl font-bold text-primary_light">You Won Free Spins!</h2>
                            <h3 className="mb-6 text-center text-2xl">Select Your Bonus Type</h3>
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
                    </div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            {error && <div className="fixed bottom-4 left-4 z-50 rounded-lg bg-red-500 p-4 text-white">{error}</div>}
        </div>
    );
};

export default DefaultSlotContainer;
