'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Steam Auth
import { useSteamUser } from '@/stores/Store.SteamUser';
import SteamSignInModal from '@/components/SteamSignInModal';

// Wheel Game Logic / State
import { spinWheel, checkPendingBonus } from './Wheel.Actions';
import { setSlotBonusType } from '@/app/games/rusty-slots/RustySlots.Actions';
import { useWheelStore } from '@/stores/Store.Games.Wheel';

// Slot Game Components
import { SlotContainer } from '@/components/games/base/BaseGame.Container';
import { BaseGameControls } from '@/components/games/base/BaseGame.Controls';
import { BaseGameConfettiOverlay } from '@/components/games/base/BaseGame.ConfettiOverlay';

// Wheel Game Components
import { WheelDisplay } from '@/components/games/wheel/Wheel.Display';
import { WheelRecentWinners } from '@/components/games/wheel/Wheel.RecentWinners';
import { WheelSoundManager, WheelSoundManagerRef } from '@/components/games/wheel/Wheel.SoundManager';
import { SPIN_COST, WheelPayout, ITEM_IMAGE_PATHS } from '@/app/games/wheel/Wheel.Constants';

// Overlays
import { ModalBonus } from '@/components/overlays/templates/Modal.Bonus';
import { ModalWin } from '@/components/overlays/templates/Modal.Win';
import { ModalBonusInProgress } from '@/components/overlays/templates/Modal.BonusInProgress';

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
        updateCreditsFromServerResponse,
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
        setShowOverlay,
        showBonusModal,
        setShowBonusModal,
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
    const row1Ref = useRef<HTMLDivElement>(null);

    // Initialize user data and check bonus status
    useEffect(() => {
        const initializeUser = async () => {
            console.log('Initializing user with:', { steamId, authCode, isVerified });
            try {
                if (steamId && authCode) {
                    // Only load user data once on initial mount
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
        // We need these dependencies for the effect to work properly
        // Only run this effect once on mount
    }, [steamId, authCode, isVerified, loadUserData, setIsVerified, setSteamError, setShowBonusModal]);

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

            // Update free spins count only
            updateCreditsFromServerResponse(credits, spinsAwarded);

            // Navigate to slot machine without bonus type parameter
            router.push('/games/rusty-slots');
        } catch (error) {
            console.error('Error handling bonus selection:', error);
            setPendingBonusType(null);
            setSteamError(error instanceof Error ? error.message : 'Failed to set bonus type. Please try again.');
            setShowBonusModal(true); // Show the modal again on error
        }
    };

    // Update handleSpin to handle bonus wins
    const handleSpin = useCallback(async () => {
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

            const { result: wheelResult, totalRotation, credits: updatedCredits } = spinResult.data!;

            // Immediately disable auto-spin if it's a bonus win
            if (wheelResult.payout.displayName === '3x Bonus') {
                setAutoSpinning(false);
            }

            setCurrentRotation(currentRotation + totalRotation);
            setResult(wheelResult);

            // Update local credits state directly from server response
            updateCreditsFromServerResponse(updatedCredits);

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
    }, [
        isVerified,
        isSpinning,
        credits,
        currentRotation,
        authCode,
        setSteamError,
        setCurrentRotation,
        setResult,
        setSpinning,
        setShowOverlay,
        setAutoSpinning,
        updateCreditsFromServerResponse,
        steamProfile,
    ]);

    // Handle auto-spin logic
    useEffect(() => {
        if (isAutoSpinning && !isSpinning && credits !== null && credits >= 5) {
            autoSpinTimeoutRef.current = setTimeout(() => {
                handleSpin();
            }, autoSpinInterval);
        }
    }, [isAutoSpinning, isSpinning, credits, autoSpinInterval, handleSpin]);

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

    // Add an effect to ensure volume is set on mount
    useEffect(() => {
        if (soundManagerRef.current) {
            soundManagerRef.current.stopAllSounds();
        }
    }, []); // Empty dependency array means this runs once on mount

    return (
        <div className="relative flex h-[calc(100dvh-50px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-stone-800 text-st_white">
            <SlotContainer
                slot_grid={wheel_display}
                slot_controls={wheel_controls}
                slot_recent_winners={wheel_recent_winners}
                row1Ref={row1Ref}
            />
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
            <ModalWin<{ payout: { displayName: string; inGameName: string } }>
                isOpen={showWinOverlay}
                onClose={() => setShowWinOverlay(false)}
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
            {/* Bonus Modal */}
            <ModalBonus<'normal' | 'sticky'>
                isOpen={showBonusModal}
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

            {/* Bonus In Progress Overlay */}
            <ModalBonusInProgress
                isOpen={bonusInProgress}
                onClose={() => setBonusInProgress(false)}
                bonusType={bonusType}
                spinsRemaining={spinsRemaining}
                containerRef={row1Ref}
            />

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
