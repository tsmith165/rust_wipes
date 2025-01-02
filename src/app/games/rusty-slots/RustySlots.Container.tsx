'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Steam Sign in
import SteamSignInModal from '@/components/SteamSignInModal';
import { useSteamUser } from '@/stores/Store.SteamUser';

// Slot actions / state
import { useSlotGame } from '@/stores/Store.Games.RustySlots';
import { spinSlotMachine, setSlotBonusType, checkPendingBonus, getRecentSlotWinners } from './RustySlots.Actions';

// Slot Constants
import { BASE_PAYOUTS, SYMBOL_IMAGE_PATHS } from '@/app/games/rusty-slots/RustySlots.Constants';

// Slot Utils
import { getRandomSymbol } from '@/app/games/rusty-slots/RustySlots.Utils';

// Slot Components
import { SlotContainer } from '@/components/games/base/BaseGame.Container';
import { SlotGrid } from '@/components/games/rusty-slots/RustySlots.Grid';
import { BaseGameControls } from '@/components/games/base/BaseGame.Controls';
import { RustySlotsSoundManager } from '@/components/games/rusty-slots/RustySlots.SoundManager';
import { SlotRecentWinners } from '@/components/games/rusty-slots/RustySlots.RecentWinners';
import { BaseGameConfettiOverlay } from '@/components/games/base/BaseGame.ConfettiOverlay';

// Overlays
import { ModalBonus } from '@/components/overlays/templates/Modal.Bonus';
import { ModalWin } from '@/components/overlays/templates/Modal.Win';

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

export const RustySlotsContainer = function RustySlotsContainer() {
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
    const row1Ref = useRef<HTMLDivElement>(null);
    const soundManagerRef = useRef<{
        playHandlePull: () => void;
        playSpinStart: () => void;
        playSpinEnd: () => void;
        playWinSound: (numWins: number) => void;
        playBonusWon: () => void;
        stopAllSounds: () => void;
    } | null>(null);

    // Add a ref to track if a spin is in progress
    const spinInProgressRef = useRef(false);

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

    // Add helper function for safe sound playing
    const playSoundSafely = (soundFunction: () => void) => {
        if (document.visibilityState === 'visible' && document.hasFocus()) {
            try {
                soundFunction();
            } catch (err) {
                console.warn('Failed to play sound:', err);
            }
        }
    };

    // Update handleSpin
    const handleSpin = async () => {
        // Prevent multiple simultaneous spins
        if (spinInProgressRef.current) {
            console.log('Spin already in progress, ignoring...');
            return;
        }

        if (!steamProfile?.steamId || !steamProfile.code) return;

        try {
            spinInProgressRef.current = true;
            console.log('Starting spin...');

            // Stop all currently playing sounds
            soundManagerRef.current?.stopAllSounds();

            // Clear all win states
            setShowOverlay(false);
            setShowConfetti(false);
            setSpinning(true);
            slotGame.setWinningLinesVisibility(false);
            slotGame.setPossibleLinesVisibility(false);
            slotGame.setCurrentWinningLine([]);
            slotGame.setWinningLines([]);
            slotGame.setWinningCells([]);
            slotGame.setBonusCells([]);

            // Play handle pull sound safely
            playSoundSafely(() => soundManagerRef.current?.playHandlePull());

            // Shorter wait for handle pull sound
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Get spin result
            console.log('Fetching spin result...');
            const spinResult = await spinSlotMachine(steamProfile.steamId, steamProfile.code);

            if (!spinResult?.success || !spinResult.data) {
                setError(spinResult?.error || 'An error occurred during the spin.');
                setSpinning(false);
                return;
            }

            const spinResultData = spinResult.data;

            // Play spin start sound safely
            playSoundSafely(() => soundManagerRef.current?.playSpinStart());

            // Generate extended grid for animation
            const extendedGrid = spinResultData.finalVisibleGrid.map((finalReel, i) => {
                const spinSymbolsCount = 15 + i * 5; // Stagger the reel lengths
                const additionalSymbols = Array(spinSymbolsCount)
                    .fill(0)
                    .map(() => getRandomSymbol());
                return [...additionalSymbols, ...finalReel];
            });

            console.log('Starting grid animation');
            // Force a remount of the grid component with the extended grid
            slotGame.setSpinKey(spinKey + 1);
            slotGame.setGrid(extendedGrid);
            slotGame.setSpinAmounts(extendedGrid.map((reel) => reel.length - 5));

            // Wait for spin animations to complete
            const maxDuration = 2 + 4 * 0.5 + 0.5;
            await new Promise((resolve) => setTimeout(resolve, maxDuration * 1000));

            console.log('Animation complete, setting final state');
            // Set final grid state
            slotGame.setGrid(spinResultData.finalVisibleGrid);
            slotGame.setSpinAmounts([]);

            // Update game state with results
            slotGame.setLastResult(spinResultData);
            slotGame.setWinningCells(spinResultData.winningCells);
            slotGame.setBonusCells(spinResultData.bonusCells);
            slotGame.setWinningLines(spinResultData.winningLines);
            slotGame.setWinningLinesVisibility(true);

            // Handle no wins case
            if (!spinResultData.needsBonusTypeSelection && (!spinResultData.payout || spinResultData.payout.length === 0)) {
                setTimeout(() => {
                    playSoundSafely(() => soundManagerRef.current?.playSpinEnd());
                }, 200);
            }

            // Handle bonus case after spin completes
            if (spinResultData.needsBonusTypeSelection) {
                // Stop auto-spinning when bonus is won
                setAutoSpinning(false);

                // Wait for spin to complete and show highlighted cells for 1.5 seconds before showing bonus modal
                setTimeout(() => {
                    setShowBonusModal(true);
                    setShowConfetti(true);
                    playSoundSafely(() => soundManagerRef.current?.playBonusWon());
                }, 1500); // Wait 1.5 seconds after spin completes to show bonus modal
            }

            // Handle win case
            if (spinResultData.payout.length > 0 || (spinResultData.bonusSpinsAwarded > 0 && freeSpins && freeSpins > 0)) {
                setShowConfetti(true);
                setShowOverlay(true);

                setTimeout(() => {
                    if (spinResultData.payout.length > 0) {
                        playSoundSafely(() => soundManagerRef.current?.playWinSound(spinResultData.payout.length));
                    } else {
                        // Play bonus won sound for additional free spins during bonus round
                        playSoundSafely(() => soundManagerRef.current?.playBonusWon());
                    }
                }, 500);

                fetchWinners();

                setTimeout(() => {
                    setShowOverlay(false);
                    setShowConfetti(false);
                }, 2500);
            }
        } catch (err) {
            console.error('Spin error:', err);
            setError('Failed to spin. Please try again.');
        } finally {
            console.log('Spin complete');
            setSpinning(false);
            spinInProgressRef.current = false;
        }
    };

    const handleBonusTypeSelection = async (type: 'normal' | 'sticky') => {
        if (!steamProfile?.steamId || !steamProfile.code) return;

        try {
            const response = await setSlotBonusType(steamProfile.steamId, steamProfile.code, type);
            if (!response.success) {
                setError(response.error || 'Failed to set bonus type.');
                return;
            }

            // Update free spins count
            if (response.data) {
                setFreeSpins(response.data);
            }

            // Fetch winners to update with the selected bonus type
            fetchWinners();

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
            // Don't check for pending bonus if a spin is in progress
            if (!steamProfile?.steamId || !steamProfile.code || spinInProgressRef.current) return;

            try {
                const response = await checkPendingBonus(steamProfile.steamId, steamProfile.code);
                if (response.success && response.data?.pending) {
                    // Only show visual elements on initial load, no sounds
                    setShowBonusModal(true);
                    setShowConfetti(true);
                }
            } catch (err) {
                console.error('Error checking pending bonus:', err);
            }
        };

        checkForPendingBonus();
    }, [steamProfile]);

    const handleTogglePossibleLines = () => {
        // Stop all currently playing sounds
        soundManagerRef.current?.stopAllSounds();

        // Stop auto-spinning when showing possible lines
        if (!slotGame.possibleLines.isVisible) {
            setAutoSpinning(false);
        }

        slotGame.setPossibleLinesVisibility(!slotGame.possibleLines.isVisible);
    };

    // Define the three main sections
    const slot_grid = (
        <div className="z-50 w-full p-4">
            <div className="relative flex flex-col items-center space-y-2">
                <SlotGrid soundManagerRef={soundManagerRef} />
            </div>
        </div>
    );

    const slot_controls = (
        <BaseGameControls
            onSpin={handleSpin}
            onToggleMute={() => setSoundEnabled(!soundEnabled)}
            onToggleAutoSpin={() => setAutoSpinning(!autoSpinning)}
            onVolumeChange={setVolume}
            volume={volume}
            isMuted={!soundEnabled}
            isAutoSpinning={autoSpinning}
            credits={credits ?? 0}
            freeSpins={freeSpins ?? 0}
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

    const sound_manager = <RustySlotsSoundManager ref={soundManagerRef} isMuted={!soundEnabled} volume={volume} />;

    // Add an effect to ensure volume is set on mount
    useEffect(() => {
        if (soundManagerRef.current) {
            soundManagerRef.current.stopAllSounds();
        }
    }, []); // Empty dependency array means this runs once on mount

    return (
        <div className="relative flex h-[calc(100dvh-50px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-stone-800 text-white">
            <SlotContainer
                slot_grid={slot_grid}
                slot_controls={slot_controls}
                slot_recent_winners={slot_recent_winners}
                row1Ref={row1Ref}
            />

            {/* Sound Manager */}
            {sound_manager}

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
                <ModalWin<{ payout: Array<{ item: string; quantity: number; full_name: string }>; bonusSpinsAwarded: number }>
                    isOpen={showOverlay && result !== null}
                    onClose={() => setShowOverlay(false)}
                    result={result}
                    showConfetti={showConfetti}
                    onConfettiComplete={() => setShowConfetti(false)}
                    containerRef={row1Ref}
                    mapResultToWinItems={(result) => {
                        const winItems = [];

                        // Add payout items
                        if (result.payout) {
                            result.payout.forEach((item) => {
                                const baseItem = BASE_PAYOUTS[item.item];
                                winItems.push({
                                    quantity: item.quantity,
                                    displayName: item.full_name,
                                    imagePath: SYMBOL_IMAGE_PATHS[item.item],
                                    inGameName: baseItem?.item,
                                });
                            });
                        }

                        // Add bonus spins if awarded
                        if (result.bonusSpinsAwarded > 0) {
                            winItems.push({
                                quantity: result.bonusSpinsAwarded,
                                displayName: 'Free Spins',
                                imagePath: SYMBOL_IMAGE_PATHS.bonus,
                                inGameName: 'bonus_spins',
                            });
                        }

                        return winItems;
                    }}
                />
            </AnimatePresence>

            {/* Confetti Overlay */}
            <BaseGameConfettiOverlay
                isVisible={showConfetti}
                onComplete={() => setShowConfetti(false)}
                containerRef={row1Ref}
                config={{
                    numberOfPieces: 200,
                    gravity: 0.2,
                    initialVelocityX: 5,
                    initialVelocityY: 20,
                }}
            />

            {/* Bonus Type Selection Modal */}
            <AnimatePresence>
                {/* Bonus Type Selection Modal */}
                <ModalBonus<'normal' | 'sticky'>
                    isOpen={showBonusModal}
                    onSelect={handleBonusTypeSelection}
                    onClose={() => setShowBonusModal(false)}
                    showConfetti={showConfetti}
                    onConfettiComplete={() => setShowConfetti(false)}
                    containerRef={row1Ref}
                    title="You Won Free Spins!"
                    subtitle="Select Your Bonus Type"
                    options={[
                        {
                            type: 'normal',
                            imagePath: '/rust_icons/normal_bonus_banner.png',
                            imageAlt: 'Normal Bonus',
                            description: 'More spins, lower volatility. Multipliers do not stick for all spins.',
                            imageWidth: 300,
                            imageHeight: 100,
                            mobileImageWidth: 200,
                            mobileImageHeight: 75,
                        },
                        {
                            type: 'sticky',
                            imagePath: '/rust_icons/sticky_bonus_banner.png',
                            imageAlt: 'Sticky Bonus',
                            description: 'Less spins, higher volatility. Multipliers will stay in place for all spins.',
                            imageWidth: 300,
                            imageHeight: 100,
                            mobileImageWidth: 200,
                            mobileImageHeight: 75,
                        },
                    ]}
                />
            </AnimatePresence>

            {/* Error Message */}
            {error && <div className="fixed bottom-4 left-4 z-50 rounded-lg bg-red-500 p-4 text-white">{error}</div>}
        </div>
    );
};

export default RustySlotsContainer;
