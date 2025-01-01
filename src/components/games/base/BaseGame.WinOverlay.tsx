'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Types for theme customization
interface WinOverlayTheme {
    backgroundColor?: string;
    textColor?: string;
    titleSize?: string;
    itemTextSize?: string;
    padding?: string;
    width?: string;
    borderRadius?: string;
}

// Generic win item interface
interface WinItem {
    quantity?: number;
    displayName: string;
    imagePath: string;
    inGameName?: string;
}

interface BaseGameWinOverlayProps<T extends { payout: any }> {
    result: T | null;
    showConfetti?: boolean;
    onConfettiComplete?: () => void;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    theme?: WinOverlayTheme;
    className?: string;
    mapResultToWinItems: (result: T) => WinItem[];
    title?: string;
}

/**
 * BaseGame.WinOverlay - A reusable win overlay component for games
 *
 * Features:
 * - Flexible theming system
 * - Responsive design with mobile support
 * - Confetti animation integration
 * - Framer Motion animations
 * - Dynamic positioning relative to container
 * - Image support for won items
 */
export function BaseGameWinOverlay<T extends { payout: any }>({
    result,
    showConfetti = false,
    onConfettiComplete,
    containerRef,
    theme = {},
    className,
    mapResultToWinItems,
    title = 'You Won!',
}: BaseGameWinOverlayProps<T>) {
    const defaultContainerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0, top: 0, left: 0 });
    const activeRef = containerRef || defaultContainerRef;

    // Update dimensions on mount and window resize
    React.useEffect(() => {
        const updateDimensions = () => {
            if (activeRef.current) {
                const rect = activeRef.current.getBoundingClientRect();
                setDimensions({
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        window.addEventListener('scroll', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            window.removeEventListener('scroll', updateDimensions);
        };
    }, [activeRef]);

    // Default theme values
    const defaultTheme: Required<WinOverlayTheme> = {
        backgroundColor: 'bg-stone-950',
        textColor: 'text-white',
        titleSize: 'text-2xl xs:text-4xl',
        itemTextSize: 'text-base xs:text-lg',
        padding: 'p-3 xs:p-6',
        width: 'max-w-lg',
        borderRadius: 'rounded-lg',
    };

    // Merge default theme with provided theme
    const finalTheme = { ...defaultTheme, ...theme };

    if (!result) {
        return null;
    }

    const winItems = mapResultToWinItems(result);

    if (winItems.length === 0) {
        return null;
    }

    return (
        <div
            ref={defaultContainerRef}
            style={{
                position: 'fixed',
                top: dimensions.top,
                left: dimensions.left,
                width: dimensions.width,
                height: dimensions.height,
                pointerEvents: 'none',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                    'radial-gradient-stone-600 relative w-fit',
                    finalTheme.backgroundColor,
                    finalTheme.textColor,
                    finalTheme.padding,
                    finalTheme.width,
                    finalTheme.borderRadius,
                    'shadow-lg',
                    className,
                )}
            >
                <div className="text-center">
                    <h2 className={cn('mb-4 font-bold text-primary_light', finalTheme.titleSize)}>{title}</h2>
                    <div className="flex flex-col space-y-2">
                        {winItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-center space-x-3">
                                <Image src={item.imagePath} alt={item.displayName} width={32} height={32} className="rounded-md" />
                                <span className={cn('font-medium', finalTheme.itemTextSize)}>
                                    {item.quantity ? `${item.quantity}x ` : ''}
                                    {item.displayName}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {showConfetti && (
                <Confetti
                    width={dimensions.width}
                    height={dimensions.height}
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.2}
                    initialVelocityX={5}
                    initialVelocityY={20}
                    onConfettiComplete={onConfettiComplete}
                />
            )}
        </div>
    );
}
