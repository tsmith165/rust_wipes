'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { SYMBOL_IMAGE_PATHS, WINNING_LINES } from './Slot.Constants';
import { useMachineStore } from '@/stores/machine_store';
import type { SlotGameProps } from './types';

export default function SlotGame({
    reels,
    spinAmounts,
    spinKey,
    winningCells,
    bonusCells,
    winningLines,
    currentWinningLine,
    currentWinningLineFlashCount,
    ITEM_HEIGHT,
    ITEM_WIDTH,
    GAP,
    VISIBLE_ITEMS,
    lineType,
    lineFlashCount,
}: SlotGameProps) {
    const { spinning } = useMachineStore();
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateWindowSize();
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

    // Helper function to calculate the total height of the reel content
    const calculateReelHeight = (reelLength: number) => {
        return reelLength * ITEM_HEIGHT + (reelLength - 1) * GAP;
    };

    // Helper function to calculate line points with padding adjustment
    const calculateLinePoints = (points: number[][]) => {
        const PADDING = 2; // p-2 padding
        return points
            .map(([x, y]) => {
                const xPos = x * (ITEM_WIDTH + GAP) + ITEM_WIDTH / 2 + PADDING;
                const yPos = y * (ITEM_HEIGHT + GAP) + ITEM_HEIGHT / 2 + PADDING;
                return `${xPos},${yPos}`;
            })
            .join(' ');
    };

    // Get current winning line points
    let currentWinningLinePoints = currentWinningLine && currentWinningLine.length > 0 ? calculateLinePoints(currentWinningLine) : '';

    return (
        <div
            className="relative flex items-center justify-center overflow-hidden rounded-lg bg-gray-700 p-2"
            style={{
                height: `${VISIBLE_ITEMS * ITEM_HEIGHT + (VISIBLE_ITEMS - 1) * GAP + 4 + 8}px`,
                width: `${5 * ITEM_WIDTH + 4 * GAP + 4 + 8}px`,
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={spinKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="grid grid-cols-5 gap-0"
                >
                    {reels.map((reel, i) => (
                        <motion.div
                            key={`reel-${i}-${reel.length}-${spinKey}`}
                            className="flex flex-col items-center"
                            animate={
                                spinning && spinAmounts.length > 0
                                    ? {
                                          y: -(calculateReelHeight(reel.length) - calculateReelHeight(VISIBLE_ITEMS)),
                                      }
                                    : {}
                            }
                            transition={{
                                duration: 2 + i * 0.5,
                                ease: 'easeInOut',
                            }}
                            style={{
                                y: spinning ? 0 : -(calculateReelHeight(reel.length) - calculateReelHeight(VISIBLE_ITEMS)),
                            }}
                        >
                            {reel.map((item, j) => {
                                const displayedIndex = j - (reel.length - VISIBLE_ITEMS);
                                const isDisplayed = displayedIndex >= 0 && displayedIndex < VISIBLE_ITEMS;

                                return (
                                    <div
                                        key={j}
                                        className="relative flex items-center justify-center"
                                        style={{
                                            height: `${ITEM_HEIGHT}px`,
                                            width: `${ITEM_WIDTH}px`,
                                            marginBottom: j < reel.length - 1 ? `${GAP}px` : '0px',
                                        }}
                                    >
                                        {isDisplayed && winningCells.some((cell) => cell[0] === i && cell[1] === displayedIndex) && (
                                            <div className="absolute inset-0 z-10 bg-red-500 opacity-50" />
                                        )}
                                        {isDisplayed && bonusCells.some((cell) => cell[0] === i && cell[1] === displayedIndex) && (
                                            <div className="absolute inset-0 z-10 bg-green-500 opacity-50" />
                                        )}
                                        {SYMBOL_IMAGE_PATHS[item] ? (
                                            <Image
                                                src={SYMBOL_IMAGE_PATHS[item]}
                                                alt={item}
                                                width={ITEM_WIDTH - 10}
                                                height={ITEM_HEIGHT - 10}
                                                className="z-30"
                                            />
                                        ) : (
                                            <span className="z-30 text-4xl">{item}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Winning Lines */}
            {!spinning && winningLines && winningLines.length > 0 && (
                <div className="absolute inset-0 z-50">
                    <svg className="h-full w-full">
                        <polyline
                            points={currentWinningLinePoints}
                            fill="none"
                            stroke="#32CD32"
                            strokeWidth="4"
                            opacity={currentWinningLineFlashCount % 2 === 0 ? 1 : 0}
                        />
                    </svg>
                </div>
            )}

            {/* Pattern Lines */}
            {!spinning && lineType && (
                <div className="absolute inset-0 z-50">
                    {WINNING_LINES[lineType].map((line, index) => (
                        <svg key={`${lineType}-${index}`} className="absolute inset-0 h-full w-full">
                            <polyline
                                points={calculateLinePoints(line)}
                                fill="none"
                                stroke="#32CD32"
                                strokeWidth="4"
                                opacity={lineFlashCount % 2 === 0 ? 1 : 0}
                            />
                        </svg>
                    ))}
                </div>
            )}
        </div>
    );
}
