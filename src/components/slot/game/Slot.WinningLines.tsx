'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSlotGame } from '@/stores/slot_game_store';
import { WINNING_PATTERNS } from '@/app/gambling/slots/default/Default.Constants';
import { cn } from '@/lib/utils';

interface SlotWinningLinesProps {
    className?: string;
}

const LINE_COLORS = {
    horizontal: 'rgba(0, 255, 0, 0.5)', // Green
    vShaped: 'rgba(255, 0, 0, 0.5)', // Red
    invertedV: 'rgba(0, 0, 255, 0.5)', // Blue
    diagonal: 'rgba(255, 215, 0, 0.5)', // Gold
};

function getLineType(line: number[][]): keyof typeof LINE_COLORS {
    // Convert coordinates to y-values
    const yValues = line.map(([_, y]) => y);

    // Check if it's a horizontal line (all y values are the same)
    if (yValues.every((y) => y === yValues[0])) {
        return 'horizontal';
    }

    // Check for V-shaped and inverted-V patterns
    const midPoint = Math.floor(yValues.length / 2);
    const isVShaped =
        yValues.slice(0, midPoint).every((y, i) => i === 0 || y > yValues[i - 1]) &&
        yValues.slice(midPoint).every((y, i) => i === 0 || y < yValues[i - 1]);
    const isInvertedV =
        yValues.slice(0, midPoint).every((y, i) => i === 0 || y < yValues[i - 1]) &&
        yValues.slice(midPoint).every((y, i) => i === 0 || y > yValues[i - 1]);

    if (isVShaped) return 'vShaped';
    if (isInvertedV) return 'invertedV';

    // Default to diagonal for other patterns
    return 'diagonal';
}

export function SlotWinningLines({ className }: SlotWinningLinesProps) {
    const {
        winningLines: { lines: winLines, isVisible: winLinesVisible, currentLineIndex, flashCount },
        possibleLines: { lines: possibleLines, isVisible: possibleLinesVisible, currentGroup },
        gridDimensions: { itemSize, gap },
        cycleWinningLines,
        cyclePossibleLines,
    } = useSlotGame();

    // If neither type of lines should be visible, return null
    if ((!winLinesVisible || winLines.length === 0) && !possibleLinesVisible) return null;

    // Effect to cycle winning lines
    React.useEffect(() => {
        if (winLinesVisible && winLines.length > 0) {
            const interval = setInterval(() => {
                cycleWinningLines();
            }, 1000); // Increased to 1s to accommodate drawing + pause + fade
            return () => clearInterval(interval);
        }
    }, [winLinesVisible, winLines.length, cycleWinningLines]);

    // Add effect for cycling possible lines
    React.useEffect(() => {
        if (possibleLinesVisible) {
            const interval = setInterval(() => {
                cyclePossibleLines();
            }, 400); // 400ms instead of 500ms
            return () => clearInterval(interval);
        }
    }, [possibleLinesVisible, cyclePossibleLines]);

    // Generate path data for a line
    const generatePathFromLine = (line: number[][]) => {
        const points = line.map(([x, y]) => {
            const xPos = x * (itemSize.width + gap) + itemSize.width / 2;
            const yPos = y * (itemSize.height + gap) + itemSize.height / 2;
            return `${xPos},${yPos}`;
        });
        return `M ${points.join(' L ')}`;
    };

    return (
        <svg className={cn('absolute inset-0 z-50 h-full w-full', className)}>
            {/* Render current winning line */}
            {winLinesVisible && winLines.length > 0 && (
                <motion.path
                    key={`winning-line-${currentLineIndex}-${flashCount}`}
                    d={generatePathFromLine(winLines[currentLineIndex])}
                    stroke={LINE_COLORS[getLineType(winLines[currentLineIndex])]}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: [0, 1, 1, 0],
                        opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                        duration: 1,
                        times: [0, 0.4, 0.65, 1], // Draw in 40%, pause 25%, fade out 35%
                        ease: 'easeInOut',
                    }}
                    style={{
                        filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))',
                    }}
                />
            )}

            {/* Render possible lines */}
            {possibleLinesVisible &&
                possibleLines[currentGroup].map((line, index) => (
                    <motion.path
                        key={`possible-line-${currentGroup}-${index}`}
                        d={generatePathFromLine(line)}
                        stroke={LINE_COLORS[currentGroup]}
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: 1,
                            opacity: flashCount % 2 === 0 ? 1 : 0.3,
                        }}
                        transition={{
                            pathLength: { duration: 0.3, ease: 'easeInOut' },
                            opacity: { duration: 0.4 },
                        }}
                        style={{
                            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
                        }}
                    />
                ))}
        </svg>
    );
}
