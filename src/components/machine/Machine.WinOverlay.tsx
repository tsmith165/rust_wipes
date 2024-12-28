'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface WinOverlayProps {
    showOverlay: boolean;
    showConfetti: boolean;
    result: {
        payout: { quantity: number; full_name: string }[];
        bonusSpinsAwarded: number;
    } | null;
}

export default function MachineWinOverlay({ showOverlay, showConfetti, result }: WinOverlayProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <AnimatePresence>
                {showOverlay && result && (
                    <div className="absolute flex h-full w-full items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute m-16 flex h-fit w-[calc(75dvw)] items-center justify-center rounded-lg bg-black bg-opacity-70 p-16 sm:!w-[calc(100dvw*0.75/3)]"
                        >
                            <div className="text-center">
                                <h2 className="mb-4 text-4xl font-bold">You Won!</h2>
                                {result.payout.map((item, index) => (
                                    <p key={index} className="text-2xl">
                                        {item.quantity}x {item.full_name}
                                    </p>
                                ))}
                                {result.bonusSpinsAwarded > 0 && <p className="text-2xl text-yellow-400">Free Spins Won!</p>}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {showConfetti && (
                <Confetti
                    className="absolute flex h-fit w-full items-center justify-center rounded-lg p-8 md:!w-[calc(75dvw-50px)]"
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.2}
                    initialVelocityX={5}
                    initialVelocityY={20}
                    width={1000}
                    height={600}
                />
            )}
        </>
    );
}
