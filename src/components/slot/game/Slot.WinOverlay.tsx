'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { SpinResult } from '@/app/gambling/slots/default/Default.Actions';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface SlotWinOverlayProps {
    result: SpinResult | null;
    showConfetti: boolean;
    onConfettiComplete?: () => void;
}

export function SlotWinOverlay({ result, showConfetti, onConfettiComplete }: SlotWinOverlayProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);

    if (!result || !result.payout || result.payout.length === 0) {
        return null;
    }

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-stone-800 bg-opacity-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="m-4 flex h-fit w-[calc(80dvw)] items-center justify-center rounded-lg bg-black bg-opacity-70 p-8 sm:!w-[calc(100dvw*0.75/3)]"
            >
                <div className="text-center">
                    <h2 className="mb-4 text-4xl font-bold">You Won!</h2>
                    {result.payout.map((item, index) => (
                        <p key={index} className="text-2xl">
                            {item.quantity}x {item.full_name}
                        </p>
                    ))}
                    {result.bonusSpinsAwarded > 0 && <p className="text-2xl text-yellow-400">{result.bonusSpinsAwarded} Free Spins Won!</p>}
                </div>
            </motion.div>
            {showConfetti && containerRef.current && (
                <Confetti
                    className="pointer-events-none fixed inset-0"
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.2}
                    initialVelocityX={5}
                    initialVelocityY={20}
                    width={containerRef.current.clientWidth}
                    height={containerRef.current.clientHeight}
                    onConfettiComplete={onConfettiComplete}
                />
            )}
        </div>
    );
}
