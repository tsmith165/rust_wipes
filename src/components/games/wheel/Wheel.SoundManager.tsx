'use client';

import React from 'react';
import { RustySlotsSoundManager } from '@/components/games/rusty-slots/RustySlots.SoundManager';
import { cn } from '@/lib/utils';

export interface WheelSoundManager {
    playHandlePull: () => void;
    playSpinStart: () => void;
    playSpinEnd: () => void;
    playWinSound: (prizeType: string) => void;
    playBonusWon: () => void;
    stopAllSounds: () => void;
    playTickSound: (speed: 'fast' | 'medium' | 'slow') => void;
}

interface WheelSoundManagerProps {
    isMuted: boolean;
    volume: number;
    onVolumeChange: (volume: number) => void;
    onMuteToggle: () => void;
    className?: string;
}

// Update sound paths for different prizes
const WHEEL_SOUND_PATHS = {
    TICK_FAST: '/sounds/slot-spin_start-1.mp3',
    TICK_MEDIUM: '/sounds/slot-handle_pull-1.mp3',
    TICK_SLOW: '/sounds/slot-spin_end-1.mp3',
    NO_PAYOUT: '/sounds/slot-no_payout-1.mp3', // P2 Pistol (Yellow)
    WIN_1: '/sounds/slot-win-1.mp3', // M92 Pistol (Green)
    WIN_2: '/sounds/slot-win-2.mp3', // M92 Pistol (Blue)
    WIN_3: '/sounds/slot-win-3.mp3', // Thompson (Purple)
    MAJOR_WIN: '/sounds/slot-major_win-1.mp3', // 3x Bonus (Red)
} as const;

function WheelSoundManagerBase(
    { isMuted, volume, onVolumeChange, onMuteToggle, className }: WheelSoundManagerProps,
    ref: React.ForwardedRef<WheelSoundManager>,
) {
    // Sound refs
    const tickFastRef = React.useRef<HTMLAudioElement | null>(null);
    const tickMediumRef = React.useRef<HTMLAudioElement | null>(null);
    const tickSlowRef = React.useRef<HTMLAudioElement | null>(null);
    const noPayoutRef = React.useRef<HTMLAudioElement | null>(null);
    const win1Ref = React.useRef<HTMLAudioElement | null>(null);
    const win2Ref = React.useRef<HTMLAudioElement | null>(null);
    const win3Ref = React.useRef<HTMLAudioElement | null>(null);
    const majorWinRef = React.useRef<HTMLAudioElement | null>(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Fade intervals for smooth transitions
    const fadeIntervals = React.useRef<Record<string, NodeJS.Timeout>>({});

    // Function to fade sound volume
    const fadeSound = React.useCallback(
        (audioRef: React.MutableRefObject<HTMLAudioElement | null>, targetVolume: number, duration = 500) => {
            if (!audioRef.current) return;

            const audio = audioRef.current;
            const startVolume = audio.volume;
            const volumeDiff = targetVolume - startVolume;
            const steps = 20;
            const stepDuration = duration / steps;
            const volumeStep = volumeDiff / steps;

            // Clear any existing fade interval for this audio element
            if (fadeIntervals.current[audio.src]) {
                clearInterval(fadeIntervals.current[audio.src]);
            }

            let currentStep = 0;
            fadeIntervals.current[audio.src] = setInterval(() => {
                currentStep++;
                if (currentStep >= steps) {
                    audio.volume = targetVolume;
                    clearInterval(fadeIntervals.current[audio.src]);
                    if (targetVolume === 0) {
                        audio.pause();
                        audio.currentTime = 0;
                    }
                } else {
                    audio.volume = startVolume + volumeStep * currentStep;
                }
            }, stepDuration);
        },
        [],
    );

    // Load wheel-specific sounds
    React.useEffect(() => {
        const loadSound = async (path: string): Promise<HTMLAudioElement> => {
            const audio = new Audio(path);
            return new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
                audio.addEventListener('error', (e) => reject(e), { once: true });
                audio.load();
            });
        };

        const loadWheelSounds = async () => {
            try {
                const [tickFast, tickMedium, tickSlow, noPayout, win1, win2, win3, majorWin] = await Promise.all([
                    loadSound(WHEEL_SOUND_PATHS.TICK_FAST),
                    loadSound(WHEEL_SOUND_PATHS.TICK_MEDIUM),
                    loadSound(WHEEL_SOUND_PATHS.TICK_SLOW),
                    loadSound(WHEEL_SOUND_PATHS.NO_PAYOUT),
                    loadSound(WHEEL_SOUND_PATHS.WIN_1),
                    loadSound(WHEEL_SOUND_PATHS.WIN_2),
                    loadSound(WHEEL_SOUND_PATHS.WIN_3),
                    loadSound(WHEEL_SOUND_PATHS.MAJOR_WIN),
                ]);

                tickFastRef.current = tickFast;
                tickMediumRef.current = tickMedium;
                tickSlowRef.current = tickSlow;
                noPayoutRef.current = noPayout;
                win1Ref.current = win1;
                win2Ref.current = win2;
                win3Ref.current = win3;
                majorWinRef.current = majorWin;

                setIsLoaded(true);
                setError(null);
            } catch (err) {
                console.error('Error loading wheel sounds:', err);
                setError(null);
            }
        };

        loadWheelSounds();

        return () => {
            // Cleanup
            Object.values(fadeIntervals.current).forEach(clearInterval);
            [tickFastRef, tickMediumRef, tickSlowRef, noPayoutRef, win1Ref, win2Ref, win3Ref, majorWinRef].forEach((ref) => {
                if (ref.current) {
                    ref.current.pause();
                    ref.current.currentTime = 0;
                }
            });
        };
    }, []);

    // Forward ref to base SlotSoundManager
    const slotSoundManagerRef = React.useRef<{
        playHandlePull: () => void;
        playSpinStart: () => void;
        playSpinEnd: () => void;
        playWinSound: (numWins: number) => void;
        playBonusWon: () => void;
        stopAllSounds: () => void;
    }>(null);

    // Expose play functions through ref
    React.useImperativeHandle(
        ref,
        () => ({
            playHandlePull: () => {
                if (isMuted) return;
                slotSoundManagerRef.current?.playHandlePull();
            },
            playSpinStart: () => {
                if (isMuted) return;
                if (!isLoaded) {
                    slotSoundManagerRef.current?.playSpinStart();
                    return;
                }
                tickFastRef.current?.play();
            },
            playSpinEnd: () => {
                if (isMuted) return;
                if (!isLoaded) {
                    slotSoundManagerRef.current?.playSpinEnd();
                    return;
                }
                tickSlowRef.current?.play();
            },
            playWinSound: (prizeType: string) => {
                if (isMuted) return;

                // Stop any currently playing sounds first
                const allRefs = [tickFastRef, tickMediumRef, tickSlowRef, noPayoutRef, win1Ref, win2Ref, win3Ref, majorWinRef];
                allRefs.forEach((ref) => {
                    if (ref.current && !ref.current.paused) {
                        fadeSound(ref, 0, 200);
                    }
                });

                // Map prize types to appropriate sounds
                const soundRef = (() => {
                    switch (prizeType) {
                        case 'P2 Pistol':
                            return noPayoutRef;
                        case 'M92 Pistol (Green)':
                            return win1Ref;
                        case 'M92 Pistol (Blue)':
                            return win2Ref;
                        case 'Thompson':
                            return win3Ref;
                        case '3x Bonus':
                            return majorWinRef;
                        default:
                            return win1Ref;
                    }
                })();

                if (soundRef.current) {
                    soundRef.current.currentTime = 0;
                    soundRef.current.volume = volume;
                    soundRef.current.play().catch(console.error);
                }
            },
            playBonusWon: () => {
                if (isMuted) return;
                slotSoundManagerRef.current?.playBonusWon();
            },
            stopAllSounds: () => {
                const allRefs = [tickFastRef, tickMediumRef, tickSlowRef, noPayoutRef, win1Ref, win2Ref, win3Ref, majorWinRef];
                allRefs.forEach((ref) => {
                    if (ref.current && !ref.current.paused) {
                        fadeSound(ref, 0, 200); // Quick fade out
                    }
                });
            },
            playTickSound: (speed: 'fast' | 'medium' | 'slow') => {
                if (isMuted) return;
                if (!isLoaded) {
                    switch (speed) {
                        case 'fast':
                            slotSoundManagerRef.current?.playSpinStart();
                            break;
                        case 'medium':
                            slotSoundManagerRef.current?.playHandlePull();
                            break;
                        case 'slow':
                            slotSoundManagerRef.current?.playSpinEnd();
                            break;
                    }
                    return;
                }
                const soundRef = {
                    fast: tickFastRef,
                    medium: tickMediumRef,
                    slow: tickSlowRef,
                }[speed];
                if (soundRef.current) {
                    soundRef.current.currentTime = 0;
                    soundRef.current.volume = volume;
                    soundRef.current.play().catch(console.error);
                }
            },
        }),
        [isMuted, isLoaded],
    );

    return (
        <RustySlotsSoundManager
            ref={slotSoundManagerRef}
            isMuted={isMuted}
            volume={volume}
            onVolumeChange={onVolumeChange}
            onMuteToggle={onMuteToggle}
            className={cn(className, error ? 'pb-6' : '')}
        />
    );
}

export const WheelSoundManager = React.forwardRef(WheelSoundManagerBase);
