'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ITEM_IMAGE_PATHS, WheelPayout } from '@/app/games/wheel/Wheel.Constants';
import type { WheelResult } from '@/app/games/wheel/Wheel.Constants';

interface WheelWinOverlayProps {
    result: WheelResult | null;
    isVisible: boolean;
    onComplete?: () => void;
}

const getItemImagePath = (displayName: string): string => {
    return ITEM_IMAGE_PATHS[displayName as WheelPayout] || '/rust_icons/scrap_icon.png';
};

/**
 * Win overlay component for the wheel.
 * Displays the winning result with animation and item image.
 */
export function WheelWinOverlay({ result, isVisible, onComplete }: WheelWinOverlayProps) {
    return (
        <AnimatePresence onExitComplete={onComplete}>
            {isVisible && result && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-800 bg-opacity-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="m-4 flex h-fit w-[calc(80dvw)] items-center justify-center rounded-lg bg-black bg-opacity-70 p-8 sm:!w-[calc(100dvw*0.75/3)]"
                    >
                        <div className="text-center">
                            <h2 className="mb-4 text-4xl font-bold">You Won!</h2>
                            <div className="flex items-center justify-center space-x-4">
                                <Image
                                    src={getItemImagePath(result.payout.displayName)}
                                    alt={result.payout.displayName}
                                    width={64}
                                    height={64}
                                />
                                <span className="text-3xl font-bold">{result.payout.displayName}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
