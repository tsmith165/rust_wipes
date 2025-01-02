'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';

interface WheelSoundManagerProps {
    isMuted: boolean;
    volume: number;
}

export interface WheelSoundManagerRef {
    playSpinStart: () => void;
    playSpinEnd: () => void;
    playWinSound: (payoutType: string) => void;
    playBonusWon: () => void;
    stopAllSounds: () => void;
}

export const WheelSoundManager = forwardRef<WheelSoundManagerRef, WheelSoundManagerProps>(function WheelSoundManager(
    { isMuted, volume },
    ref,
) {
    // Audio refs
    const spinStartRef = useRef<HTMLAudioElement>(null);
    const winSoundRef = useRef<HTMLAudioElement>(null);

    // Set initial volume on mount and when volume changes
    React.useEffect(() => {
        const audioRefs = [spinStartRef, winSoundRef];
        audioRefs.forEach((ref) => {
            if (ref.current) {
                ref.current.volume = isMuted ? 0 : volume;
            }
        });
    }, [volume, isMuted]);

    useImperativeHandle(ref, () => ({
        playSpinStart() {
            if (isMuted) return;
            if (spinStartRef.current) {
                spinStartRef.current.volume = volume;
                spinStartRef.current.currentTime = 0;
                spinStartRef.current.playbackRate = 1.4; // Speed up the 7-second sound to match 5-second spin
                spinStartRef.current.play();
            }
        },
        playSpinEnd() {
            // No longer used - we'll stop the spinning sound in the win sound
            return;
        },
        playWinSound(payoutType: string) {
            if (isMuted) return;
            if (winSoundRef.current) {
                // Stop the spinning sound
                if (spinStartRef.current) {
                    spinStartRef.current.pause();
                    spinStartRef.current.currentTime = 0;
                }

                // Set the correct sound file based on payout type
                switch (payoutType) {
                    case 'P2 Pistol':
                        winSoundRef.current.src = '/sounds/slot-no_payout-1.mp3';
                        break;
                    case 'M92 Pistol':
                        winSoundRef.current.src = '/sounds/slot-win-1.mp3';
                        break;
                    case 'Thompson':
                        winSoundRef.current.src = '/sounds/slot-win-2.mp3';
                        break;
                    case 'AK47 Rifle':
                        winSoundRef.current.src = '/sounds/slot-win-3.mp3';
                        break;
                    case '3x Bonus':
                        winSoundRef.current.src = '/sounds/slot-major_win-1.mp3';
                        break;
                    default:
                        winSoundRef.current.src = '/sounds/slot-no_payout-1.mp3';
                }

                winSoundRef.current.volume = volume;
                winSoundRef.current.currentTime = 0;
                winSoundRef.current.play();
            }
        },
        playBonusWon() {
            if (isMuted) return;
            if (winSoundRef.current) {
                winSoundRef.current.src = '/sounds/slot-major_win-1.mp3';
                winSoundRef.current.volume = volume;
                winSoundRef.current.currentTime = 0;
                winSoundRef.current.play();
            }
        },
        stopAllSounds() {
            [spinStartRef, winSoundRef].forEach((ref) => {
                if (ref.current) {
                    ref.current.pause();
                    ref.current.currentTime = 0;
                }
            });
        },
    }));

    return (
        <>
            <audio ref={spinStartRef} src="/sounds/wheel-spinning-1.mp3" preload="auto" />
            <audio ref={winSoundRef} preload="auto" />
        </>
    );
});
