'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useSlotGame } from '@/stores/slot_game_store';

// Constants
const ITEM_SIZE_EXTRA_LARGE = 120;
const ITEM_SIZE_LARGE = 100;
const ITEM_SIZE_MEDIUM = 80;
const ITEM_SIZE_SMALL = 60;
const ITEM_SIZE_EXTRA_SMALL = 50;
const GAP = 2;

// Map symbols to image paths
const SYMBOL_IMAGE_PATHS: Record<string, string> = {
    ak47: '/rust_icons/ak47_icon.png',
    m39_rifle: '/rust_icons/m39_icon.png',
    thompson: '/rust_icons/thompson_icon.png',
    scrap: '/rust_icons/scrap_icon.png',
    metal_fragments: '/rust_icons/metal_fragments_icon.png',
    high_quality_metal: '/rust_icons/hqm_icon.png',
    bonus: '/rust_icons/bonus_symbol.png',
    '2x_multiplier': '/rust_icons/2x_multi.png',
    '3x_multiplier': '/rust_icons/3x_multi.png',
    '5x_multiplier': '/rust_icons/5x_multi.png',
};

export interface SlotGridProps {
    onSpinComplete?: () => void;
    className?: string;
    soundManagerRef?: React.RefObject<{
        playSpinEnd: () => void;
        playHandlePull: () => void;
        playSpinStart: () => void;
        playWinSound: (numWins: number) => void;
        playBonusWon: () => void;
        stopAllSounds: () => void;
    } | null>;
}

/**
 * Grid component for slot machines.
 * Handles the display and animation of symbols.
 */
export function SlotGrid({ onSpinComplete, className, soundManagerRef }: SlotGridProps) {
    const {
        currentGrid: grid,
        spinAmounts,
        spinKey,
        isSpinning,
        lastResult: result,
        winningCells = [],
        bonusCells = [],
        winningLines = [],
        currentWinningLine,
        currentWinningLineFlashCount,
    } = useSlotGame();

    const [itemSize, setItemSize] = React.useState({
        width: ITEM_SIZE_MEDIUM,
        height: ITEM_SIZE_MEDIUM,
    });

    // Update item size based on window size
    React.useLayoutEffect(() => {
        const updateSize = () => {
            const size = getScreenSize();
            setItemSize({ width: size, height: size });
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Helper function to calculate reel height
    const calculateReelHeight = (reelLength: number) => {
        return reelLength * itemSize.height + (reelLength - 1) * GAP;
    };

    // Generate points for winning lines
    const currentWinningLinePoints = currentWinningLine.map(
        ([x, y]) => `${x * (itemSize.width + GAP) + itemSize.width / 2},${y * (itemSize.height + GAP) + itemSize.height / 2}`,
    );

    return (
        <div
            className={cn('relative overflow-hidden rounded-lg bg-gray-700 p-2', className)}
            style={{
                height: `${5 * itemSize.height + 4 * GAP + 4 + 8}px`,
                width: `${5 * itemSize.width + 4 * GAP + 4 + 8}px`,
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={spinKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-5 gap-0"
                >
                    {grid.map((reel, i) => (
                        <motion.div
                            key={`reel-${i}-${reel.length}-${spinKey}`}
                            className="flex flex-col items-center"
                            animate={
                                isSpinning && spinAmounts.length > 0
                                    ? {
                                          y: [0, -(calculateReelHeight(reel.length) - calculateReelHeight(5))],
                                      }
                                    : {
                                          y: -(calculateReelHeight(reel.length) - calculateReelHeight(5)),
                                      }
                            }
                            transition={
                                isSpinning
                                    ? {
                                          duration: 2 + i * 0.5,
                                          ease: [0.45, 0.05, 0.55, 0.95],
                                          times: [0, 1],
                                          onComplete: () => {
                                              // Play tick sound for each reel stopping
                                              soundManagerRef?.current?.playSpinEnd();
                                              // Call onSpinComplete when the last reel finishes
                                              if (i === grid.length - 1) {
                                                  onSpinComplete?.();
                                              }
                                          },
                                      }
                                    : {
                                          duration: 0,
                                      }
                            }
                        >
                            {reel.map((symbol, j) => {
                                const displayedIndex = j - (reel.length - 5);
                                const isDisplayed = displayedIndex >= 0 && displayedIndex < 5;

                                return (
                                    <div
                                        key={j}
                                        className="relative flex items-center justify-center"
                                        style={{
                                            height: `${itemSize.height}px`,
                                            width: `${itemSize.width}px`,
                                            marginBottom: j < reel.length - 1 ? `${GAP}px` : '0px',
                                        }}
                                    >
                                        {/* Highlight for winning and bonus cells */}
                                        {isDisplayed && winningCells.some((cell) => cell[0] === i && cell[1] === displayedIndex) && (
                                            <motion.div
                                                className="absolute inset-0 z-10 bg-red-500"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0, 0.5, 0] }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    repeatType: 'reverse',
                                                }}
                                            />
                                        )}
                                        {isDisplayed && bonusCells.some((cell) => cell[0] === i && cell[1] === displayedIndex) && (
                                            <motion.div
                                                className="absolute inset-0 z-10 bg-green-500"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0, 0.5, 0] }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    repeatType: 'reverse',
                                                }}
                                            />
                                        )}
                                        {SYMBOL_IMAGE_PATHS[symbol] ? (
                                            <Image
                                                src={SYMBOL_IMAGE_PATHS[symbol]}
                                                alt={symbol}
                                                width={itemSize.width - 10}
                                                height={itemSize.height - 10}
                                                className="z-50"
                                            />
                                        ) : (
                                            <span className="z-50 text-4xl">{symbol}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Winning Lines */}
            {!isSpinning && winningLines.length > 0 && (
                <div className="absolute inset-0">
                    <svg className="absolute inset-0 z-50 h-full w-full">
                        <motion.polyline
                            points={currentWinningLinePoints.join(' ')}
                            fill="none"
                            stroke={'#32CD32'}
                            strokeWidth="4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: 1,
                                opacity: currentWinningLineFlashCount % 2 === 0 ? 1 : 0,
                            }}
                            transition={{
                                pathLength: { duration: 0.5, ease: 'easeInOut' },
                                opacity: { duration: 0.3 },
                            }}
                        />
                    </svg>
                </div>
            )}
        </div>
    );
}

// Helper function to determine screen size
function getScreenSize(): number {
    if (typeof window === 'undefined') return ITEM_SIZE_MEDIUM;

    if (window.innerWidth >= 1300 && window.innerHeight > ITEM_SIZE_EXTRA_LARGE * 5 + 100) {
        return ITEM_SIZE_EXTRA_LARGE;
    } else if (window.innerWidth >= 800 && window.innerHeight > ITEM_SIZE_LARGE * 5 + 100) {
        return ITEM_SIZE_LARGE;
    } else if (window.innerWidth >= 600 && window.innerHeight > ITEM_SIZE_MEDIUM * 5 + 100) {
        return ITEM_SIZE_MEDIUM;
    } else if (window.innerWidth >= 400 && window.innerHeight > ITEM_SIZE_SMALL * 5 + 100) {
        return ITEM_SIZE_SMALL;
    } else {
        return ITEM_SIZE_EXTRA_SMALL;
    }
}
