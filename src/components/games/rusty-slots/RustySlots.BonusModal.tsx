'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface RustySlotsBonusModalProps {
    onSelect: (type: 'normal' | 'sticky') => void;
    showConfetti?: boolean;
    onConfettiComplete?: () => void;
}

export function RustySlotsBonusModal({ onSelect, showConfetti, onConfettiComplete }: RustySlotsBonusModalProps) {
    const modalRef = React.useRef<HTMLDivElement>(null);

    return (
        <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-stone-800 bg-opacity-50">
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative w-full max-w-lg rounded-lg bg-stone-800 p-6 text-st_white shadow-lg"
            >
                <h2 className="mb-2 text-center text-4xl font-bold text-primary_light">You Won Free Spins!</h2>
                <h3 className="mb-6 text-center text-2xl">Select Your Bonus Type</h3>
                <div className="flex w-full flex-col items-center justify-center space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    {/* Normal Bonus Button */}
                    <button onClick={() => onSelect('normal')} className="group relative w-fit">
                        <Image
                            src="/rust_icons/normal_bonus_banner.png"
                            alt="Normal Bonus"
                            width={300}
                            height={100}
                            className="rounded-lg"
                        />
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 flex w-fit items-center justify-center rounded-lg bg-stone-900 bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-70">
                            <p className="px-4 text-center opacity-0 group-hover:opacity-100">
                                More spins, lower volatility. Multipliers do not stick for all spins.
                            </p>
                        </div>
                    </button>

                    {/* Sticky Bonus Button */}
                    <button onClick={() => onSelect('sticky')} className="group relative w-fit">
                        <Image
                            src="/rust_icons/sticky_bonus_banner.png"
                            alt="Sticky Bonus"
                            width={300}
                            height={100}
                            className="rounded-lg"
                        />
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-stone-900 bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-70">
                            <p className="px-4 text-center opacity-0 group-hover:opacity-100">
                                Less spins, higher volatility. Multipliers will stay in place for all spins.
                            </p>
                        </div>
                    </button>
                </div>
            </motion.div>
            {showConfetti && modalRef.current && (
                <Confetti
                    width={modalRef.current.clientWidth}
                    height={modalRef.current.clientHeight}
                    recycle={false}
                    numberOfPieces={200}
                    onConfettiComplete={onConfettiComplete}
                />
            )}
        </div>
    );
}
