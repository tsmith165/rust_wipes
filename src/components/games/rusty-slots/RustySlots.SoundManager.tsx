'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';

interface RustySlotsSoundManagerProps {
    isMuted: boolean;
    volume: number;
}

export interface RustySlotsSoundManagerRef {
    playHandlePull: () => void;
    playSpinStart: () => void;
    playSpinEnd: () => void;
    playWinSound: (numWins: number) => void;
    playBonusWon: () => void;
    stopAllSounds: () => void;
}

export const RustySlotsSoundManager = forwardRef<RustySlotsSoundManagerRef, RustySlotsSoundManagerProps>(function RustySlotsSoundManager(
    { isMuted, volume },
    ref,
) {
    // Audio refs
    const handlePullRef = useRef<HTMLAudioElement>(null);
    const spinStartRef = useRef<HTMLAudioElement>(null);
    const spinEndRef = useRef<HTMLAudioElement>(null);
    const win1Ref = useRef<HTMLAudioElement>(null);
    const win2Ref = useRef<HTMLAudioElement>(null);
    const win3Ref = useRef<HTMLAudioElement>(null);
    const bonusWonRef = useRef<HTMLAudioElement>(null);

    useImperativeHandle(ref, () => ({
        playHandlePull() {
            if (isMuted) return;
            if (handlePullRef.current) {
                handlePullRef.current.volume = volume;
                handlePullRef.current.currentTime = 0;
                handlePullRef.current.play();
            }
        },
        playSpinStart() {
            if (isMuted) return;
            if (spinStartRef.current) {
                spinStartRef.current.volume = volume;
                spinStartRef.current.currentTime = 0;
                spinStartRef.current.play();
            }
        },
        playSpinEnd() {
            if (isMuted) return;
            if (spinEndRef.current) {
                spinEndRef.current.volume = volume;
                spinEndRef.current.currentTime = 0;
                spinEndRef.current.play();
            }
        },
        playWinSound(numWins: number) {
            if (isMuted) return;
            const soundRef = numWins === 1 ? win1Ref : numWins === 2 ? win2Ref : win3Ref;
            if (soundRef.current) {
                soundRef.current.volume = volume;
                soundRef.current.currentTime = 0;
                soundRef.current.play();
            }
        },
        playBonusWon() {
            if (isMuted) return;
            if (bonusWonRef.current) {
                bonusWonRef.current.volume = volume;
                bonusWonRef.current.currentTime = 0;
                bonusWonRef.current.play();
            }
        },
        stopAllSounds() {
            [handlePullRef, spinStartRef, spinEndRef, win1Ref, win2Ref, win3Ref, bonusWonRef].forEach((ref) => {
                if (ref.current) {
                    ref.current.pause();
                    ref.current.currentTime = 0;
                }
            });
        },
    }));

    return (
        <>
            <audio ref={handlePullRef} src="/sounds/slot-handle_pull-1.mp3" preload="auto" />
            <audio ref={spinStartRef} src="/sounds/slot-spin_start-1.mp3" preload="auto" />
            <audio ref={spinEndRef} src="/sounds/slot-spin_end-1.mp3" preload="auto" />
            <audio ref={win1Ref} src="/sounds/slot-win-1.mp3" preload="auto" />
            <audio ref={win2Ref} src="/sounds/slot-win-2.mp3" preload="auto" />
            <audio ref={win3Ref} src="/sounds/slot-win-3.mp3" preload="auto" />
            <audio ref={bonusWonRef} src="/sounds/slot-major_win-1.mp3" preload="auto" />
        </>
    );
});
