'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { OverlayContainer } from '../core/Overlay.Container';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Generic win item interface
interface WinItem {
    quantity?: number;
    displayName: string;
    imagePath: string;
    inGameName?: string;
}

interface ModalWinProps<T extends { payout: any }> {
    isOpen: boolean;
    onClose: () => void;
    result: T | null;
    showConfetti?: boolean;
    onConfettiComplete?: () => void;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    className?: string;
    mapResultToWinItems: (result: T) => WinItem[];
    title?: string;
}

/**
 * Modal.Win - A reusable win overlay component for games
 *
 * Features:
 * - Uses OverlayContainer for consistent styling
 * - Responsive design with mobile support
 * - Confetti animation integration
 * - Framer Motion animations
 * - Dynamic positioning relative to container
 * - Image support for won items
 */
export function ModalWin<T extends { payout: any }>({
    isOpen,
    onClose,
    result,
    showConfetti = false,
    onConfettiComplete,
    containerRef,
    className,
    mapResultToWinItems,
    title = 'You Won!',
}: ModalWinProps<T>) {
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    // Update dimensions when containerRef changes or window resizes
    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef?.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: rect.width,
                    height: rect.height,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [containerRef]);

    if (!result) {
        return null;
    }

    const winItems = mapResultToWinItems(result);

    if (winItems.length === 0) {
        return null;
    }

    return (
        <>
            <OverlayContainer
                isOpen={isOpen}
                onClose={onClose}
                title={title}
                format="card"
                size="fit"
                position="none"
                animation={{
                    initial: { opacity: 0, scale: 0.8 },
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 0.8 },
                    transition: { duration: 0.2 },
                }}
                className={cn('m-4 bg-stone-900/95', className)}
                containerRef={containerRef}
                showCloseButton={false}
            >
                <div className="flex flex-col space-y-2 p-4">
                    {winItems.map((item, index) => (
                        <motion.div
                            key={index}
                            className="flex items-center justify-center space-x-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Image src={item.imagePath} alt={item.displayName} width={32} height={32} className="rounded-md" />
                            <span className="text-base font-medium text-stone-200 xs:text-lg">
                                {item.quantity ? `${item.quantity}x ` : ''}
                                {item.displayName}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </OverlayContainer>

            {/* Confetti Overlay */}
            {showConfetti && containerRef?.current && (
                <Confetti
                    width={dimensions.width}
                    height={dimensions.height}
                    recycle={false}
                    numberOfPieces={200}
                    onConfettiComplete={onConfettiComplete}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                    }}
                />
            )}
        </>
    );
}
