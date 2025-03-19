'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface WheelBonusModalProps {
    isVisible: boolean;
    onClose: () => void;
    onBonusSelect: (type: 'normal' | 'sticky') => void;
}

export function WheelBonusModal({ isVisible, onClose, onBonusSelect }: WheelBonusModalProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative w-full max-w-lg rounded-lg bg-stone-800 p-6 text-st_white shadow-lg"
                    >
                        <div className="mb-6 text-center">
                            <h2 className="mb-2 text-2xl font-bold text-primary_light">Choose Your Bonus Type</h2>
                            <p className="text-gray-300">Select a bonus type to continue to the slot machine</p>
                        </div>

                        <div className="flex w-full flex-col items-center justify-center space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                            {/* Normal Bonus Button */}
                            <button onClick={() => onBonusSelect('normal')} className="group relative w-fit">
                                <Image
                                    src="/rust_icons/normal_bonus_banner.png"
                                    alt="Normal Bonus"
                                    width={300}
                                    height={100}
                                    className="rounded-lg"
                                />
                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-stone-900 bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-70">
                                    <p className="px-4 text-center opacity-0 group-hover:opacity-100">
                                        More spins, lower volatility. Multipliers do not stick for all spins.
                                    </p>
                                </div>
                            </button>

                            {/* Sticky Bonus Button */}
                            <button onClick={() => onBonusSelect('sticky')} className="group relative w-fit">
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

                        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-st_white">
                            ✕
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
