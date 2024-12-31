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
import { WheelSoundManager, WheelSoundManagerRef } from '@/components/games/wheel/Wheel.SoundManager';

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
    const [autoSpinInterval, setAutoSpinInterval] = useState<number>(0);

    // Refs
    const soundManagerRef = useRef<WheelSoundManagerRef>(null);

    // Initialize user data and check bonus status
    useEffect(() => {
        const initializeUser = async () => {
            console.log('Initializing user with:', { steamId, authCode, isVerified });
            try {
                if (steamId && authCode) {
                    await loadUserData();

                    // Only check bonus status if user is verified
                    if (isVerified) {
                        // Check bonus status
                        const response = await checkPendingBonus(steamId, authCode);
                        console.log('Bonus check response:', response);
                        if (response.success && response.data) {
                            const { pending, spins_remaining, bonus_type } = response.data;
                            console.log('Bonus data:', { pending, spins_remaining, bonus_type });
                            if (pending) {
                                console.log('Setting showBonusModal to true');
                                setShowBonusModal(true);
                            } else if (spins_remaining > 0 && bonus_type) {
                                setBonusInProgress(true);
                                setBonusType(bonus_type as 'normal' | 'sticky');
                                setSpinsRemaining(spins_remaining);
                            }
                        }
                    }
                } else {
                    console.log('Missing steamId or authCode, setting isVerified to false');
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

    // Handle auto-spin logic
    useEffect(() => {
        if (isAutoSpinning && !isSpinning && credits !== null && credits >= 5) {
            autoSpinTimeoutRef.current = setTimeout(() => {
                handleSpin();
            }, autoSpinInterval);
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
        setAutoSpinInterval(3000);
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

            // After 5 seconds (matching wheel animation), show results
            setTimeout(() => {
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
            }, 5000);
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
            onToggleMute={() => setSoundEnabled(!soundEnabled)}
            onToggleAutoSpin={() => {
                setAutoSpinning(!isAutoSpinning);
                setAutoSpinInterval(0);
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
    );

    const wheel_recent_winners = (
        <WheelRecentWinners shouldRefetch={shouldRefetchWinners} onRefetchComplete={() => setShouldRefetchWinners(false)} />
    );

    // Sound manager component
    const sound_manager = <WheelSoundManager ref={soundManagerRef} isMuted={!soundEnabled} volume={volume} />;

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