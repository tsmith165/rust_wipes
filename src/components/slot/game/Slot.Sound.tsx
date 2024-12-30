'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Define sound paths
const SOUND_PATHS = {
    spin: '/sounds/slot-spin_start-1.mp3',
    spinEnd: '/sounds/slot-spin_end-1.mp3',
    win1: '/sounds/slot-win-1.mp3',
    win2: '/sounds/slot-win-2.mp3',
    win3: '/sounds/slot-win-3.mp3',
    bonus: '/sounds/slot-bonus_won-1.mp3',
    handlePull: '/sounds/slot-handle_pull-1.mp3',
} as const;

export interface SoundEffects {
    spin: HTMLAudioElement;
    spinEnd: HTMLAudioElement;
    win1: HTMLAudioElement;
    win2: HTMLAudioElement;
    win3: HTMLAudioElement;
    bonus: HTMLAudioElement;
    handlePull: HTMLAudioElement;
    volume: number;
    setVolume: (value: number) => void;
    preload: () => Promise<void>;
    fadeIn: (sound: keyof typeof SOUND_PATHS, duration?: number) => void;
    fadeOut: (sound: keyof typeof SOUND_PATHS, duration?: number) => void;
}

export interface SoundControlsProps {
    isMuted: boolean;
    volume: number;
    onVolumeChange: (value: number) => void;
    onMuteToggle: () => void;
    className?: string;
}

/**
 * Sound manager component for slot machines.
 * Handles playing and stopping sound effects with volume control and fading.
 */
export function SlotSound({ isMuted, volume, onVolumeChange, onMuteToggle, className }: SoundControlsProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const audioRefs = useRef<Record<keyof typeof SOUND_PATHS, HTMLAudioElement | null>>({
        spin: null,
        spinEnd: null,
        win1: null,
        win2: null,
        win3: null,
        bonus: null,
        handlePull: null,
    });
    const fadeIntervals = useRef<Record<string, NodeJS.Timeout>>({});

    // Initialize audio elements
    useEffect(() => {
        const loadAudio = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const loadPromises = Object.entries(SOUND_PATHS).map(async ([key, path]) => {
                    const audio = new Audio(path);
                    audio.preload = 'auto';
                    audio.volume = volume;

                    // Wait for the audio to be loaded
                    await new Promise((resolve, reject) => {
                        audio.addEventListener('canplaythrough', resolve, { once: true });
                        audio.addEventListener('error', reject, { once: true });
                        audio.load();
                    });

                    audioRefs.current[key as keyof typeof SOUND_PATHS] = audio;
                });

                await Promise.all(loadPromises);
                setIsLoading(false);
            } catch (err) {
                console.error('Error loading audio:', err);
                setError('Failed to load sound effects');
                setIsLoading(false);
            }
        };

        loadAudio();

        // Cleanup
        return () => {
            Object.values(audioRefs.current).forEach((audio) => {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
            Object.values(fadeIntervals.current).forEach(clearInterval);
        };
    }, [volume]);

    // Handle volume changes
    useEffect(() => {
        Object.values(audioRefs.current).forEach((audio) => {
            if (audio) {
                audio.volume = isMuted ? 0 : volume;
            }
        });
    }, [volume, isMuted]);

    const fadeSound = (sound: keyof typeof SOUND_PATHS, targetVolume: number, duration: number = 500, onComplete?: () => void) => {
        const audio = audioRefs.current[sound];
        if (!audio) return;

        // Clear any existing fade interval for this sound
        if (fadeIntervals.current[sound]) {
            clearInterval(fadeIntervals.current[sound]);
        }

        const startVolume = audio.volume;
        const volumeDiff = targetVolume - startVolume;
        const steps = Math.max(duration / 50, 1); // Update every 50ms
        const volumeStep = volumeDiff / steps;
        let currentStep = 0;

        fadeIntervals.current[sound] = setInterval(() => {
            currentStep++;
            const newVolume = Math.max(0, Math.min(1, startVolume + volumeStep * currentStep));
            audio.volume = newVolume;

            if (currentStep >= steps) {
                clearInterval(fadeIntervals.current[sound]);
                if (targetVolume === 0) {
                    audio.pause();
                    audio.currentTime = 0;
                }
                onComplete?.();
            }
        }, 50);
    };

    const playSound = async (sound: keyof typeof SOUND_PATHS, fadeIn: boolean = true) => {
        if (isMuted || !audioRefs.current[sound]) return;

        try {
            const audio = audioRefs.current[sound]!;
            audio.currentTime = 0;

            if (fadeIn) {
                audio.volume = 0;
                await audio.play();
                fadeSound(sound, volume);
            } else {
                audio.volume = volume;
                await audio.play();
            }
        } catch (err) {
            console.error(`Error playing ${sound}:`, err);
            setError(`Failed to play sound effect: ${sound}`);
        }
    };

    return (
        <div className={cn('flex items-center space-x-4', className)}>
            {/* Mute Toggle */}
            <motion.button
                onClick={onMuteToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                    'rounded-full p-2 transition-colors',
                    isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700',
                    isLoading && 'cursor-wait opacity-50',
                )}
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                    <div className="h-6 w-6 bg-white" /* Replace with proper icon */ />
                )}
            </motion.button>

            {/* Volume Slider */}
            <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className={cn(
                    'h-2 w-24 cursor-pointer appearance-none rounded-lg bg-stone-700',
                    'range-slider:h-4 range-slider:w-4 range-slider:rounded-full range-slider:bg-white range-slider:transition-all',
                    'range-slider:hover:scale-110',
                    isLoading && 'cursor-wait opacity-50',
                )}
                disabled={isLoading}
            />

            {/* Error Message */}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
