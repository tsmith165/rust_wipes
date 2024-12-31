'use client';

import React from 'react';
import { FaVolumeMute } from 'react-icons/fa';
import { FaVolumeHigh } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

interface RustySlotsSoundManagerProps {
    isMuted: boolean;
    volume: number;
    onVolumeChange: (volume: number) => void;
    onMuteToggle: () => void;
    className?: string;
}

const SOUND_PATHS = {
    HANDLE_PULL: '/sounds/slot-handle_pull-1.mp3',
    SPIN_START: '/sounds/slot-spin_start-1.mp3',
    SPIN_END: '/sounds/slot-spin_end-1.mp3',
    WIN_1: '/sounds/slot-win-1.mp3',
    WIN_2: '/sounds/slot-win-2.mp3',
    WIN_3: '/sounds/slot-win-3.mp3',
    BONUS_WON: '/sounds/slot-bonus_won-1.mp3',
} as const;

function slot_sound_manager(
    { isMuted, volume, onVolumeChange, onMuteToggle, className }: RustySlotsSoundManagerProps,
    ref: React.ForwardedRef<{
        playHandlePull: () => void;
        playSpinStart: () => void;
        playSpinEnd: () => void;
        playWinSound: (numWins: number) => void;
        playBonusWon: () => void;
        stopAllSounds: () => void;
    }>,
) {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [fadeIntervals, setFadeIntervals] = React.useState<Record<string, NodeJS.Timeout>>({});

    const handlePullRef = React.useRef<HTMLAudioElement | null>(null);
    const spinStartRef = React.useRef<HTMLAudioElement | null>(null);
    const spinEndRef = React.useRef<HTMLAudioElement | null>(null);
    const win1Ref = React.useRef<HTMLAudioElement | null>(null);
    const win2Ref = React.useRef<HTMLAudioElement | null>(null);
    const win3Ref = React.useRef<HTMLAudioElement | null>(null);
    const bonusWonRef = React.useRef<HTMLAudioElement | null>(null);

    // Preload sounds
    React.useEffect(() => {
        const loadSound = async (path: string): Promise<HTMLAudioElement> => {
            const audio = new Audio(path);
            return new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
                audio.addEventListener('error', (e) => reject(e), { once: true });
                audio.load();
            });
        };

        const loadAllSounds = async () => {
            try {
                const [handlePull, spinStart, spinEnd, win1, win2, win3, bonusWon] = await Promise.all([
                    loadSound(SOUND_PATHS.HANDLE_PULL),
                    loadSound(SOUND_PATHS.SPIN_START),
                    loadSound(SOUND_PATHS.SPIN_END),
                    loadSound(SOUND_PATHS.WIN_1),
                    loadSound(SOUND_PATHS.WIN_2),
                    loadSound(SOUND_PATHS.WIN_3),
                    loadSound(SOUND_PATHS.BONUS_WON),
                ]);

                handlePullRef.current = handlePull;
                spinStartRef.current = spinStart;
                spinEndRef.current = spinEnd;
                win1Ref.current = win1;
                win2Ref.current = win2;
                win3Ref.current = win3;
                bonusWonRef.current = bonusWon;

                setIsLoaded(true);
                setError(null);
            } catch (err) {
                console.error('Error loading sounds:', err);
                setError('Failed to load sound files');
            }
        };

        loadAllSounds();

        return () => {
            // Cleanup
            Object.values(fadeIntervals).forEach(clearInterval);
            [handlePullRef, spinStartRef, spinEndRef, win1Ref, win2Ref, win3Ref, bonusWonRef].forEach((ref) => {
                if (ref.current) {
                    ref.current.pause();
                    ref.current.currentTime = 0;
                }
            });
        };
    }, []);

    // Update volume for all sounds
    React.useEffect(() => {
        const refs = [handlePullRef, spinStartRef, spinEndRef, win1Ref, win2Ref, win3Ref, bonusWonRef];
        refs.forEach((ref) => {
            if (ref.current) {
                ref.current.volume = isMuted ? 0 : volume;
            }
        });
    }, [isMuted, volume]);

    const fadeSound = React.useCallback(
        (soundRef: React.MutableRefObject<HTMLAudioElement | null>, targetVolume: number, duration: number = 500) => {
            if (!soundRef.current) return;

            const audio = soundRef.current;
            const startVolume = audio.volume;
            const volumeDiff = targetVolume - startVolume;
            const steps = Math.max(duration / 50, 1); // Update every 50ms
            const volumeStep = volumeDiff / steps;
            let currentStep = 0;

            // Clear any existing fade interval for this sound
            const soundId = soundRef.current.src;
            if (fadeIntervals[soundId]) {
                clearInterval(fadeIntervals[soundId]);
            }

            const interval = setInterval(() => {
                currentStep++;
                const newVolume = Math.max(0, Math.min(1, startVolume + volumeStep * currentStep));
                if (audio) {
                    audio.volume = newVolume;
                }

                if (currentStep >= steps) {
                    clearInterval(interval);
                    if (targetVolume === 0) {
                        audio.pause();
                        audio.currentTime = 0;
                    }
                    const newFadeIntervals = { ...fadeIntervals };
                    delete newFadeIntervals[soundId];
                    setFadeIntervals(newFadeIntervals);
                }
            }, 50);

            setFadeIntervals((prev) => ({
                ...prev,
                [soundId]: interval,
            }));
        },
        [fadeIntervals],
    );

    // Expose play functions through a ref
    const playFunctions = React.useMemo(
        () => ({
            stopAllSounds: () => {
                [handlePullRef, spinStartRef, spinEndRef, win1Ref, win2Ref, win3Ref, bonusWonRef].forEach((ref) => {
                    if (ref.current && !ref.current.paused) {
                        fadeSound(ref, 0, 200);
                    }
                });
            },
            playHandlePull: () => {
                if (handlePullRef.current && !isMuted) {
                    handlePullRef.current.currentTime = 0;
                    handlePullRef.current.volume = volume;
                    handlePullRef.current.play().catch(console.error);
                }
            },
            playSpinStart: () => {
                if (spinStartRef.current && !isMuted) {
                    spinStartRef.current.currentTime = 0;
                    spinStartRef.current.volume = 0;
                    spinStartRef.current.play().catch(console.error);
                    fadeSound(spinStartRef, volume);
                }
            },
            playSpinEnd: () => {
                if (spinEndRef.current && !isMuted) {
                    if (spinStartRef.current && !spinStartRef.current.paused) {
                        fadeSound(spinStartRef, 0, 200);
                    }
                    spinEndRef.current.currentTime = 0;
                    spinEndRef.current.volume = volume;
                    spinEndRef.current.play().catch(console.error);
                }
            },
            playWinSound: (numWins: number) => {
                if (isMuted) return;
                const soundRef = numWins === 1 ? win1Ref : numWins === 2 ? win2Ref : win3Ref;
                if (soundRef.current) {
                    soundRef.current.currentTime = 0;
                    soundRef.current.volume = 0;
                    soundRef.current.play().catch(console.error);
                    fadeSound(soundRef, volume);
                }
            },
            playBonusWon: () => {
                if (bonusWonRef.current && !isMuted) {
                    bonusWonRef.current.currentTime = 0;
                    bonusWonRef.current.volume = 0;
                    bonusWonRef.current.play().catch(console.error);
                    fadeSound(bonusWonRef, volume);
                }
            },
        }),
        [isMuted, volume, fadeSound],
    );

    // Expose play functions through a ref
    React.useImperativeHandle(ref, () => playFunctions, [playFunctions]);

    return (
        <div className={cn('fixed bottom-4 right-4 z-50 flex items-center space-x-2', className)}>
            <button
                onClick={onMuteToggle}
                className="rounded-lg bg-stone-700 p-2 text-white transition-colors hover:bg-stone-600 disabled:opacity-50"
                disabled={!isLoaded}
            >
                {!isLoaded ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : isMuted ? (
                    <FaVolumeMute className="h-6 w-6" />
                ) : (
                    <FaVolumeHigh className="h-6 w-6" />
                )}
            </button>
            {!isMuted && (
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="h-2 w-24 cursor-pointer appearance-none rounded-lg bg-stone-600 disabled:opacity-50"
                    disabled={!isLoaded}
                />
            )}
            {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
    );
}

// Export the forwarded ref component
export const RustySlotsSoundManager = React.forwardRef<
    {
        playHandlePull: () => void;
        playSpinStart: () => void;
        playSpinEnd: () => void;
        playWinSound: (numWins: number) => void;
        playBonusWon: () => void;
        stopAllSounds: () => void;
    },
    RustySlotsSoundManagerProps
>(slot_sound_manager);
