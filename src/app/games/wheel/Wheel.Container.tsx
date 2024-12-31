'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
import { WheelBonusModal } from '@/components/games/wheel/Wheel.BonusModal';
import { WheelDisplay } from '@/components/games/wheel/Wheel.Display';
import { WheelWinOverlay } from '@/components/games/wheel/Wheel.WinOverlay';
import { WheelRecentWinners } from '@/components/games/wheel/Wheel.RecentWinners';
import { WheelSoundManager } from '@/components/games/wheel/Wheel.SoundManager';

import { SPIN_COST, WheelPayout } from './Wheel.Constants';
import { BonusInProgressOverlay } from '@/components/games/wheel/Wheel.BonusInProgressOverlay';

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

    // Refs
    const soundManagerRef = useRef<WheelSoundManager | null>(null);

    // Initialize user data and check bonus status
    useEffect(() => {
        const initializeUser = async () => {
            try {
                if (steamId && authCode) {
                    await loadUserData();
                    // Check bonus status
                    const response = await checkPendingBonus(steamId, authCode);
                    if (response.success && response.data) {
                        const { pending, amount, spins_remaining, bonus_type } = response.data;
                        if (pending) {
                            setShowBonusModal(true);
                        } else if (spins_remaining > 0 && bonus_type) {
                            setBonusInProgress(true);
                            setBonusType(bonus_type as 'normal' | 'sticky');
                            setSpinsRemaining(spins_remaining);
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
    }, [steamId, authCode, loadUserData, setIsVerified, setSteamError]);

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

    // Handle auto-spin logic
    useEffect(() => {
        if (isAutoSpinning && !isSpinning && credits !== null && credits >= 5) {
            autoSpinTimeoutRef.current = setTimeout(() => {
                handleSpin();
            }, 1000);
        }
    }, [isAutoSpinning, isSpinning, credits]);

    // Add confetti state
    const [showConfetti, setShowConfetti] = useState(false);

    // Handle bonus selection
    const handleBonusSelect = async (type: 'normal' | 'sticky') => {
        if (!steamProfile?.steamId || !authCode) {
            setSteamError('Steam authentication required');
            return;
        }

        try {
            setPendingBonusType(type);
            setShowBonusModal(false);

            // Set bonus type using server action
            const response = await setSlotBonusType(steamProfile.steamId, authCode, type);
            if (!response.success) {
                throw new Error(response.error || 'Failed to set bonus type');
            }

            // Wait for the bonus spins to be set up
            const spinsAwarded = response.data;
            if (spinsAwarded === undefined || spinsAwarded === 0) {
                throw new Error('No free spins were awarded');
            }

            // Create fake spin record using server action
            const recordResponse = await createBonusSpinRecord(steamProfile.steamId, authCode, spinsAwarded);
            if (!recordResponse.success) {
                throw new Error(recordResponse.error || 'Failed to create bonus spin record');
            }

            // Update local state
            await loadUserData();

            // Navigate to slot machine without bonus type parameter
            router.push('/games/rusty-slots');
        } catch (error) {
            console.error('Error handling bonus selection:', error);
            setPendingBonusType(null);
            setSteamError(error instanceof Error ? error.message : 'Failed to set bonus type. Please try again.');
            setShowBonusModal(true); // Show the modal again on error
        }
    };

    // Add cleanup function near other sound-related code
    const cleanupCurrentSpin = () => {
        if (soundManagerRef.current) {
            soundManagerRef.current.stopAllSounds();
        }
        setShowWinOverlay(false);
    };

    // Update handleSpin to handle bonus wins
    const handleSpin = async () => {
        if (!isVerified || isSpinning || credits < SPIN_COST) return;

        // Stop all currently playing sounds
        soundManagerRef.current?.stopAllSounds();

        // Reset states
        setSpinning(true);
        setShowWinOverlay(false);
        setShowConfetti(false);

        try {
            soundManagerRef.current?.playSpinStart();

            const spinResult = await spinWheel(steamProfile!.steamId, authCode, currentRotation);

            if (!spinResult.success) {
                setSteamError(spinResult.error || 'Failed to spin wheel');
                setAutoSpinning(false);
                return;
            }

            const { result: wheelResult, totalRotation, finalDegree, credits: updatedCredits } = spinResult.data!;

            // Immediately disable auto-spin if it's a bonus win
            if (wheelResult.payout.displayName === '3x Bonus') {
                setAutoSpinning(false);
            }

            setCurrentRotation(currentRotation + totalRotation);
            setResult(wheelResult);

            // Update local credits state
            await loadUserData();

            // Start with fast ticks
            let tickInterval = setInterval(() => {
                soundManagerRef.current?.playTickSound('fast');
            }, 50);

            // After 2 seconds, switch to medium ticks
            setTimeout(() => {
                clearInterval(tickInterval);
                tickInterval = setInterval(() => {
                    soundManagerRef.current?.playTickSound('medium');
                }, 100);

                // After 2 more seconds, switch to slow ticks
                setTimeout(() => {
                    clearInterval(tickInterval);
                    tickInterval = setInterval(() => {
                        soundManagerRef.current?.playTickSound('slow');
                    }, 200);

                    // Clear ticks and show results after 1 more second
                    setTimeout(() => {
                        clearInterval(tickInterval);
                        setSpinning(false);
                        setShowOverlay(true);
                        setShowWinOverlay(true);
                        setShowConfetti(true);
                        setShouldRefetchWinners(true);

                        // Play appropriate win sound
                        if (wheelResult.payout.displayName === '3x Bonus') {
                            soundManagerRef.current?.playBonusWon();
                            setShowBonusModal(true);
                        } else {
                            // Play win sound based on payout type
                            soundManagerRef.current?.playWinSound(wheelResult.payout.displayName);
                        }

                        // Stop auto-spin if credits are too low
                        if (updatedCredits < SPIN_COST) {
                            setAutoSpinning(false);
                        }

                        // Hide overlay and confetti after delay
                        setTimeout(() => {
                            setShowOverlay(false);
                            setShowWinOverlay(false);
                            setShowConfetti(false);
                        }, 2500);
                    }, 1000);
                }, 2000);
            }, 2000);
        } catch (error) {
            console.error('Error spinning wheel:', error);
            setSteamError(error instanceof Error ? error.message : 'An error occurred while spinning the wheel');
            setSpinning(false);
            setAutoSpinning(false);
        }
    };

    // Define the three main sections
    const wheel_display = (
        <div className="z-50 w-full p-4">
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
    );

    const wheel_controls = (
        <BaseGameControls
            onSpin={handleSpin}
            onToggleMute={() => {
                setSoundEnabled(!soundEnabled);
                if (soundEnabled) {
                    soundManagerRef.current?.stopAllSounds();
                }
            }}
            onToggleAutoSpin={() => setAutoSpinning(!isAutoSpinning)}
            isMuted={!soundEnabled}
            isAutoSpinning={isAutoSpinning}
            credits={credits}
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
    );

    const wheel_recent_winners = (
        <WheelRecentWinners shouldRefetch={shouldRefetchWinners} onRefetchComplete={() => setShouldRefetchWinners(false)} />
    );

    // Sound manager component
    const sound_manager = (
        <WheelSoundManager
            ref={soundManagerRef}
            isMuted={!soundEnabled}
            volume={volume}
            onVolumeChange={setVolume}
            onMuteToggle={() => setSoundEnabled(!soundEnabled)}
        />
    );

    return (
        <div className="relative flex h-[calc(100dvh-50px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-stone-800 text-white">
            <SlotContainer slot_grid={wheel_display} slot_controls={wheel_controls} slot_recent_winners={wheel_recent_winners} />
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
            <WheelWinOverlay result={result} isVisible={showWinOverlay} onComplete={() => setShowWinOverlay(false)} />

            {/* Bonus Modal */}
            <WheelBonusModal isVisible={showBonusModal} onClose={() => setShowBonusModal(false)} onBonusSelect={handleBonusSelect} />

            {/* Bonus In Progress Overlay */}
            <BonusInProgressOverlay isVisible={bonusInProgress} bonusType={bonusType} spinsRemaining={spinsRemaining} />

            {/* Confetti Overlay */}
            <BaseGameConfettiOverlay
                isVisible={showConfetti}
                onComplete={() => setShowConfetti(false)}
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
