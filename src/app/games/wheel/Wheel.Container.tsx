'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

// Steam Auth
import { useSteamUser } from '@/stores/steam_user_store';
import SteamSignInModal from '@/components/SteamSignInModal';

// Wheel Game Logic / State
import { spinWheel, createBonusSpinRecord, checkPendingBonus } from './Wheel.Actions';
import { setSlotBonusType } from '@/app/games/rusty-slots/RustySlots.Actions';
import { useWheelStore } from './Wheel.Store';

// Slot Game Components
import { SlotContainer } from '@/components/games/base/BaseGame.Container';
import { BaseGameControls } from '@/components/games/base/BaseGame.Controls';
import { BaseGameConfettiOverlay } from '@/components/games/base/BaseGame.ConfettiOverlay';

// Wheel Game Components
import { WheelDisplay } from '@/components/games/wheel/Wheel.Display';
import { WheelRecentWinners } from '@/components/games/wheel/Wheel.RecentWinners';
import { WheelSoundManager, WheelSoundManagerRef } from '@/components/games/wheel/Wheel.SoundManager';

import { SPIN_COST, WheelPayout, ITEM_IMAGE_PATHS } from './Wheel.Constants';
import { BonusInProgressOverlay } from '@/components/games/wheel/Wheel.BonusInProgressOverlay';
import { BaseGameBonusModal } from '@/components/games/base/BaseGame.BonusModal';
import { BaseGameWinOverlay } from '@/components/games/base/BaseGame.WinOverlay';

export function WheelContainer() {
    const router = useRouter();

    // Steam User Store
    const {
        steamInput,
        setSteamInput,
        authCode,
        setAuthCode,
        profile: steamProfile,
        verifyUser,
        credits,
        loadUserData,
        steamId,
        setIsVerified,
        isVerified,
        error: steamError,
        setError: setSteamError,
    } = useSteamUser();

    // Wheel Game Store
    const {
        isSpinning,
        setSpinning,
        isAutoSpinning,
        setAutoSpinning,
        currentRotation,
        setCurrentRotation,
        result,
        setResult,
        soundEnabled,
        setSoundEnabled,
        volume,
        setVolume,
        showOverlay,
        setShowOverlay,
        showBonusModal,
        setShowBonusModal,
        pendingBonusType,
        setPendingBonusType,
    } = useWheelStore();

    // Local state
    const [shouldRefetchWinners, setShouldRefetchWinners] = useState(false);
    const [showWinOverlay, setShowWinOverlay] = useState(false);
    const [bonusInProgress, setBonusInProgress] = useState(false);
    const [bonusType, setBonusType] = useState<'normal' | 'sticky'>('normal');
    const [spinsRemaining, setSpinsRemaining] = useState(0);
    const [autoSpinInterval, setAutoSpinInterval] = useState<number>(0);

    // Refs
    const soundManagerRef = useRef<WheelSoundManagerRef>(null);

    // Add row1Ref for win overlay positioning
    const row1Ref = useRef<HTMLDivElement>(null);

    // Initialize user data and check bonus status
    useEffect(() => {
        const initializeUser = async () => {
            try {
                if (steamId && authCode) {
                    await loadUserData();

                    // Only check bonus status if user is verified
                    if (isVerified) {
                        // Check bonus status
                        const response = await checkPendingBonus(steamId, authCode);
                        if (response.success && response.data) {
                            const { pending, spins_remaining, bonus_type } = response.data;
                            if (pending) {
                                setShowBonusModal(true);
                            } else if (spins_remaining > 0 && bonus_type) {
                                setBonusInProgress(true);
                                setBonusType(bonus_type as 'normal' | 'sticky');
                                setSpinsRemaining(spins_remaining);
                            }
                        }
                    }
                } else {
                    setIsVerified(false);
                }
            } catch (error) {
                console.error('Error initializing user:', error);
                setSteamError(error instanceof Error ? error.message : 'Failed to initialize user');
                setIsVerified(false);
            }
        };

        initializeUser();
    }, [steamId, authCode, isVerified, loadUserData, setIsVerified, setSteamError]);

    // Add auto-spin timeout ref
    const autoSpinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle auto-spin cleanup
    useEffect(() => {
        return () => {
            if (autoSpinTimeoutRef.current) {
                clearTimeout(autoSpinTimeoutRef.current);
            }
        };
    }, []);

    // Add helper function for safe sound playing
    const playSoundSafely = (soundFunction: () => void) => {
        if (document.visibilityState === 'visible' && document.hasFocus()) {
            try {
                soundFunction();
            } catch (err) {
                console.error('Failed to play sound:', err);
            }
        }
    };

    // Handle spin
    const handleSpin = async () => {
        if (!steamProfile?.steamId || !steamProfile.code || isSpinning) return;

        try {
            setSpinning(true);

            // Stop all currently playing sounds
            soundManagerRef.current?.stopAllSounds();

            // Play spin start sound safely
            playSoundSafely(() => soundManagerRef.current?.playSpinStart());

            // Get spin result
            const spinResult = await spinWheel(steamProfile.steamId, steamProfile.code, currentRotation);

            if (!spinResult?.success || !spinResult.data) {
                setSteamError(spinResult?.error || 'An error occurred during the spin.');
                setSpinning(false);
                return;
            }

            const spinResultData = spinResult.data;

            // Update rotation cumulatively
            setCurrentRotation(currentRotation + spinResultData.totalRotation);

            // Update result with proper type conversion
            setResult({
                start: spinResultData.result.start,
                end: spinResultData.result.end,
                color: spinResultData.result.color,
                payout: spinResultData.result.payout,
            });

            // Wait for wheel animation to complete (5 seconds)
            setTimeout(() => {
                setSpinning(false);
                setShowOverlay(true);
                setShowWinOverlay(true);
                setShowConfetti(true);
                setShouldRefetchWinners(true);

                // Update credits after spin completes
                loadUserData();

                // Handle bonus case
                if (spinResultData.bonusAwarded) {
                    // Stop auto-spinning when bonus is won
                    setAutoSpinning(false);
                    setShowBonusModal(true);
                    playSoundSafely(() => soundManagerRef.current?.playBonusWon());
                } else {
                    // Play win sound based on payout type
                    playSoundSafely(() => soundManagerRef.current?.playWinSound(spinResultData.result.payout.displayName));
                }

                // Hide overlay and confetti after delay
                setTimeout(() => {
                    setShowOverlay(false);
                    setShowWinOverlay(false);
                    setShowConfetti(false);
                }, 2500);

                // Stop auto-spin if credits are too low
                if (credits !== null && credits < 5) {
                    setAutoSpinning(false);
                }
            }, 5000); // Match wheel animation duration
        } catch (err) {
            console.error('Error spinning wheel:', err);
            setSteamError('Failed to spin. Please try again.');
            setSpinning(false);
            setAutoSpinning(false);
        }
    };

    // Handle auto-spin logic
    useEffect(() => {
        if (isAutoSpinning && !isSpinning && credits !== null && credits >= 5) {
            const spinDelay = 3000; // 3 seconds between spins
            autoSpinTimeoutRef.current = setTimeout(() => {
                if (!isSpinning) {
                    handleSpin();
                }
            }, spinDelay);
        }

        return () => {
            if (autoSpinTimeoutRef.current) {
                clearTimeout(autoSpinTimeoutRef.current);
                autoSpinTimeoutRef.current = null;
            }
        };
    }, [isAutoSpinning, isSpinning, credits, handleSpin]);

    // Add confetti state
    const [showConfetti, setShowConfetti] = useState(false);

    // Handle bonus selection
    const handleBonusSelect = async (type: 'normal' | 'sticky') => {
        if (!steamProfile?.steamId || !steamProfile.code) return;

        try {
            const response = await setSlotBonusType(steamProfile.steamId, steamProfile.code, type);
            if (!response.success) {
                setSteamError(response.error || 'Failed to set bonus type.');
                return;
            }

            // Create a fake spin record to show in recent winners
            await createBonusSpinRecord(steamProfile.steamId, steamProfile.code, 3);

            // Close the bonus modal
            setShowBonusModal(false);

            // Trigger winners refetch
            setShouldRefetchWinners(true);
        } catch (err) {
            console.error('Error selecting bonus type:', err);
            setSteamError('Failed to set bonus type. Please try again.');
        }
    };

    // Add cleanup function near other sound-related code
    const cleanupCurrentSpin = () => {
        if (soundManagerRef.current) {
            soundManagerRef.current.stopAllSounds();
        }
        setShowWinOverlay(false);
    };

    // Define the three main sections
    const wheel_display = (
        <div className="z-10 w-full p-4">
            <div className="relative flex flex-col items-center space-y-2">
                <WheelDisplay
                    soundManagerRef={soundManagerRef}
                    onSpinComplete={() => {
                        setSpinning(false);
                        if (result) {
                            setShowOverlay(true);
                        }
                    }}
                />
            </div>
        </div>
    );

    const wheel_controls = (
        <div className="z-20">
            <BaseGameControls
                onSpin={handleSpin}
                onToggleMute={() => setSoundEnabled(!soundEnabled)}
                onToggleAutoSpin={() => {
                    setAutoSpinning(!isAutoSpinning);
                    setAutoSpinInterval(3000); // Set fixed 3 second interval
                }}
                onVolumeChange={setVolume}
                volume={volume}
                isMuted={!soundEnabled}
                isAutoSpinning={isAutoSpinning}
                credits={credits ?? 0}
                freeSpins={0}
                isLoading={isSpinning}
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
        </div>
    );

    const wheel_recent_winners = (
        <WheelRecentWinners shouldRefetch={shouldRefetchWinners} onRefetchComplete={() => setShouldRefetchWinners(false)} />
    );

    // Sound manager component
    const sound_manager = <WheelSoundManager ref={soundManagerRef} isMuted={!soundEnabled} volume={volume} />;

    return (
        <div className="relative flex h-[calc(100dvh-50px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-stone-800 text-white">
            {/* Main Container */}
            <SlotContainer
                slot_grid={wheel_display}
                slot_controls={wheel_controls}
                slot_recent_winners={wheel_recent_winners}
                row1Ref={row1Ref}
            />

            {/* Sound Manager */}
            {sound_manager}

            {/* Sign-In Modal */}
            {!isVerified && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                    <SteamSignInModal
                        steamInput={steamInput}
                        setSteamInput={setSteamInput}
                        code={authCode}
                        setCode={setAuthCode}
                        onVerify={verifyUser}
                        error={steamError}
                    />
                </div>
            )}

            {/* Win Overlay */}
            <AnimatePresence>
                {showWinOverlay && result && (
                    <BaseGameWinOverlay
                        result={result}
                        showConfetti={showConfetti}
                        onConfettiComplete={() => setShowConfetti(false)}
                        containerRef={row1Ref}
                        mapResultToWinItems={(result) => [
                            {
                                displayName: result.payout.displayName,
                                imagePath: ITEM_IMAGE_PATHS[result.payout.displayName as WheelPayout],
                                inGameName: result.payout.inGameName,
                            },
                        ]}
                    />
                )}
            </AnimatePresence>

            {/* Bonus Modal */}
            <AnimatePresence>
                {showBonusModal && (
                    <BaseGameBonusModal<'normal' | 'sticky'>
                        isVisible={showBonusModal}
                        onSelect={handleBonusSelect}
                        onClose={() => setShowBonusModal(false)}
                        title="You Won a Bonus!"
                        subtitle="Choose Your Bonus Type"
                        options={[
                            {
                                type: 'normal',
                                imagePath: '/rust_icons/normal_bonus_banner.png',
                                imageAlt: 'Normal Bonus',
                                description: 'More spins, lower volatility. Multipliers do not stick for all spins.',
                                imageWidth: 300,
                                imageHeight: 100,
                                mobileImageWidth: 150,
                                mobileImageHeight: 50,
                            },
                            {
                                type: 'sticky',
                                imagePath: '/rust_icons/sticky_bonus_banner.png',
                                imageAlt: 'Sticky Bonus',
                                description: 'Less spins, higher volatility. Multipliers will stay in place for all spins.',
                                imageWidth: 300,
                                imageHeight: 100,
                                mobileImageWidth: 150,
                                mobileImageHeight: 50,
                            },
                        ]}
                        showConfetti={showConfetti}
                        onConfettiComplete={() => setShowConfetti(false)}
                        containerRef={row1Ref}
                    />
                )}
            </AnimatePresence>

            {/* Bonus In Progress Overlay */}
            <BonusInProgressOverlay isVisible={bonusInProgress} bonusType={bonusType} spinsRemaining={spinsRemaining} />

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
        </div>
    );
}
