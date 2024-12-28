'use client';

import React from 'react';
import { useMachineStore } from '@/stores/machine_store';
import dynamic from 'next/dynamic';
import type { MachineGameContainerProps } from './types';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function MachineGameContainer({ children }: MachineGameContainerProps) {
    const { showConfetti, windowSize } = useMachineStore();

    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center space-y-4">
            {/* Game Content */}
            {children}

            {/* Confetti Effect */}
            {showConfetti && (
                <Confetti
                    className="absolute flex h-fit w-full items-center justify-center rounded-lg p-8"
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.2}
                    initialVelocityX={5}
                    initialVelocityY={20}
                    confettiSource={{
                        x: windowSize.width / 2,
                        y: windowSize.height / 2,
                        w: 0,
                        h: 0,
                    }}
                />
            )}
        </div>
    );
}
