'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { BiSolidDownArrow } from 'react-icons/bi';
import { cn } from '@/lib/utils';
import { useWheelStore } from '@/stores/Store.Games.Wheel';
import { WHEEL_SLOTS, COLOR_CODES, ITEM_IMAGE_PATHS, PAYOUTS } from '@/app/games/wheel/Wheel.Constants';
import { WheelSoundManagerRef } from './Wheel.SoundManager';

interface WheelDisplayProps {
    onSpinComplete: () => void;
    className?: string;
    soundManagerRef: React.RefObject<WheelSoundManagerRef | null>;
}

interface WheelSize {
    width: string;
    height: string;
    maxWidth: string;
    maxHeight: string;
}

const DEFAULT_SIZE: WheelSize = {
    width: '60vw',
    height: '60vw',
    maxWidth: '70vh',
    maxHeight: '70vh',
};

const FORCE_SHOW_ICONS = true; // Dev variable to force icon visibility

/**
 * Wheel display component for the gambling wheel.
 * Handles the visualization and animation of the wheel.
 */
export function WheelDisplay({ onSpinComplete, className, soundManagerRef }: WheelDisplayProps) {
    const { isSpinning, currentRotation, spinKey } = useWheelStore();
    const [wheelSize, setWheelSize] = useState<WheelSize>(DEFAULT_SIZE);
    const [isClient, setIsClient] = useState(false);

    // Update wheel size based on viewport
    useEffect(() => {
        setIsClient(true);
        const updateSize = () => {
            const isMobile = window.innerWidth < 768;
            setWheelSize({
                width: isMobile ? '90vw' : '60vw',
                height: isMobile ? '90vw' : '60vw',
                maxWidth: isMobile ? '60vh' : '70vh',
                maxHeight: isMobile ? '60vh' : '70vh',
            });
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Generate wheel gradient
    const wheelGradient = `conic-gradient(${WHEEL_SLOTS.map(
        (color, index) => `${COLOR_CODES[color]} ${index * (360 / WHEEL_SLOTS.length)}deg ${(index + 1) * (360 / WHEEL_SLOTS.length)}deg`,
    ).join(', ')})`;

    return (
        <div className={cn('relative flex h-full w-full items-center justify-center p-4', className)}>
            <div className="relative flex h-fit flex-col items-center space-y-2">
                {/* Wheel Container */}
                <div className="relative flex h-full w-full items-center justify-start">
                    <div className="relative h-fit w-[3/4]">
                        {/* Only render wheel on client side */}
                        {isClient && (
                            <motion.div
                                key={spinKey}
                                className="relative w-fit rounded-full"
                                style={{
                                    ...wheelSize,
                                    background: wheelGradient,
                                }}
                                animate={{ rotate: currentRotation }}
                                transition={{
                                    duration: 5,
                                    ease: [0.45, 0.05, 0.55, 0.95],
                                    onComplete: () => {
                                        if (isSpinning) {
                                            soundManagerRef?.current?.playSpinEnd();
                                            onSpinComplete?.();
                                        }
                                    },
                                }}
                            >
                                {/* Wheel Segments with Icons */}
                                {WHEEL_SLOTS.map((color, index) => (
                                    <div
                                        key={index}
                                        className={FORCE_SHOW_ICONS ? 'absolute' : 'invisible absolute lg:visible'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            transform: `rotate(${index * (360 / WHEEL_SLOTS.length) + 360 / WHEEL_SLOTS.length / 2}deg)`,
                                        }}
                                    >
                                        <div className="absolute left-1/2 top-[30px] -translate-x-1/2 -translate-y-1/2 transform">
                                            <Image
                                                src={ITEM_IMAGE_PATHS[PAYOUTS[color].displayName]}
                                                alt={PAYOUTS[color].displayName}
                                                width={32}
                                                height={32}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* Ticker */}
                        <div className="absolute left-1/2 top-[-15px] -translate-x-1/2 transform text-primary_light">
                            <BiSolidDownArrow size={32} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
