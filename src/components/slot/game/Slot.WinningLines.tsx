'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WINNING_LINES } from '@/app/gambling/slot/Slot.Constants';

interface WinningLinesProps {
    lines: number[][][];
    itemSize: { width: number; height: number };
    gap: number;
    className?: string;
    animate?: boolean;
    onLineHover?: (lineIndex: number) => void;
}

interface LinePatternProps {
    pattern: number[][];
    itemSize: { width: number; height: number };
    gap: number;
    color: string;
    opacity?: number;
    isHighlighted?: boolean;
    isAnimating?: boolean;
}

interface LineDescriptionProps {
    pattern: number[][];
    payout: { quantity: number; full_name: string }[];
    className?: string;
    isVisible?: boolean;
}

interface PatternPreviewProps {
    patterns: Record<string, number[][][]>;
    itemSize: { width: number; height: number };
    gap: number;
    className?: string;
    onPatternClick?: (patternType: string) => void;
}

const LinePattern: React.FC<LinePatternProps> = ({
    pattern,
    itemSize,
    gap,
    color,
    opacity = 1,
    isHighlighted = false,
    isAnimating = false,
}) => {
    const points = pattern
        .map(([x, y]) => `${x * (itemSize.width + gap) + itemSize.width / 2},${y * (itemSize.height + gap) + itemSize.height / 2}`)
        .join(' ');

    return (
        <motion.polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={isHighlighted ? '6' : '4'}
            initial={isAnimating ? { pathLength: 0, opacity: 0 } : false}
            animate={isAnimating ? { pathLength: 1, opacity } : { opacity }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className={cn('transition-all duration-200', isHighlighted && 'drop-shadow-glow filter')}
        />
    );
};

const LineDescription: React.FC<LineDescriptionProps> = ({ pattern, payout, className, isVisible = true }) => {
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
                'absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-stone-800 p-3 text-sm text-white shadow-lg',
                className,
            )}
        >
            <div className="space-y-1">
                <div className="font-semibold">Pattern Payout:</div>
                {payout.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                        <span>{item.full_name}:</span>
                        <span className="font-mono">{item.quantity}x</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const PatternPreview: React.FC<PatternPreviewProps> = ({ patterns, itemSize, gap, className, onPatternClick }) => {
    const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);

    return (
        <div className={cn('grid grid-cols-2 gap-4', className)}>
            {Object.entries(patterns).map(([type, pattern]) => (
                <motion.div
                    key={type}
                    className="relative cursor-pointer rounded-lg bg-stone-800 p-4"
                    whileHover={{ scale: 1.05 }}
                    onHoverStart={() => setHoveredPattern(type)}
                    onHoverEnd={() => setHoveredPattern(null)}
                    onClick={() => onPatternClick?.(type)}
                >
                    <svg className="h-full w-full">
                        <LinePattern
                            pattern={pattern[0]} // Show first pattern of each type
                            itemSize={itemSize}
                            gap={gap}
                            color={hoveredPattern === type ? '#32CD32' : '#666'}
                            isHighlighted={hoveredPattern === type}
                            isAnimating={hoveredPattern === type}
                        />
                    </svg>
                    <div className="mt-2 text-center text-sm capitalize text-white">{type.replace('_', ' ')}</div>
                </motion.div>
            ))}
        </div>
    );
};

export function SlotWinningLines({ lines, itemSize, gap, className, animate = true, onLineHover }: WinningLinesProps) {
    const [hoveredLine, setHoveredLine] = useState<number | null>(null);
    const [showAllLines, setShowAllLines] = useState(true);

    useEffect(() => {
        // Animate lines sequentially when component mounts
        if (animate) {
            setShowAllLines(false);
            const timer = setTimeout(() => setShowAllLines(true), 500);
            return () => clearTimeout(timer);
        }
    }, [animate]);

    return (
        <div className={cn('relative', className)}>
            <svg className="h-full w-full">
                <AnimatePresence>
                    {lines.map((line, index) => (
                        <LinePattern
                            key={index}
                            pattern={line}
                            itemSize={itemSize}
                            gap={gap}
                            color="#32CD32"
                            opacity={hoveredLine === null || hoveredLine === index ? 1 : 0.3}
                            isHighlighted={hoveredLine === index}
                            isAnimating={!showAllLines && animate}
                        />
                    ))}
                </AnimatePresence>
            </svg>

            {/* Pattern Preview */}
            <div className="absolute bottom-4 left-4 right-4">
                <PatternPreview
                    patterns={WINNING_LINES}
                    itemSize={itemSize}
                    gap={gap}
                    onPatternClick={(type) => console.log(`Selected pattern type: ${type}`)}
                />
            </div>
        </div>
    );
}
