'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSlotGame } from '@/stores/slot_game_store';

interface SlotWinningLinesProps {
    className?: string;
}

export function SlotWinningLines({ className }: SlotWinningLinesProps) {
    const {
        winningLines: { lines, isVisible },
        currentWinningLine,
        currentWinningLineFlashCount,
        gridDimensions: { itemSize, gap },
    } = useSlotGame();

    if (!isVisible || lines.length === 0) return null;

    // Generate points for the current winning line
    const points = currentWinningLine
        .map(([x, y]) => `${x * (itemSize.width + gap) + itemSize.width / 2},${y * (itemSize.height + gap) + itemSize.height / 2}`)
        .join(' ');

    return (
        <svg className="absolute inset-0 z-50 h-full w-full">
            <motion.polyline
                points={points}
                fill="none"
                stroke="#32CD32"
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
    );
}
