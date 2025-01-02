'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { OverlayContainer } from '../core/Overlay.Container';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface BonusOption<T extends string> {
    type: T;
    imagePath: string;
    imageAlt: string;
    description: string;
    imageWidth: number;
    imageHeight: number;
    mobileImageWidth?: number;
    mobileImageHeight?: number;
}

interface ModalBonusProps<T extends string> {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: T) => void;
    options: BonusOption<T>[];
    title?: string;
    subtitle?: string;
    showConfetti?: boolean;
    onConfettiComplete?: () => void;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    className?: string;
}

export function ModalBonus<T extends string>({
    isOpen,
    onClose,
    onSelect,
    options,
    title = 'Select Your Bonus',
    subtitle,
    showConfetti = false,
    onConfettiComplete,
    containerRef,
    className,
}: ModalBonusProps<T>) {
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

    return (
        <>
            <OverlayContainer
                isOpen={isOpen}
                onClose={onClose}
                title={title}
                subtitle={subtitle}
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
            >
                <div className="flex h-fit w-full flex-col items-center justify-center space-y-2 p-4 xs:flex-row xs:space-x-2 xs:space-y-0">
                    {options.map((option, index) => (
                        <motion.button
                            key={index}
                            onClick={() => onSelect(option.type)}
                            className="group relative w-fit"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {/* Mobile Image */}
                            {option.mobileImageWidth && option.mobileImageHeight && (
                                <Image
                                    src={option.imagePath}
                                    alt={option.imageAlt}
                                    width={option.mobileImageWidth}
                                    height={option.mobileImageHeight}
                                    className="h-fit w-fit rounded-lg xs:hidden"
                                />
                            )}
                            {/* Desktop Image */}
                            <Image
                                src={option.imagePath}
                                alt={option.imageAlt}
                                width={option.imageWidth}
                                height={option.imageHeight}
                                className={cn('h-fit w-fit rounded-lg', option.mobileImageWidth ? 'hidden xs:!block' : '')}
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-stone-900 bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-70">
                                <p className="px-2 text-center text-sm text-stone-200 opacity-0 group-hover:opacity-100 xs:px-4 lg:text-base">
                                    {option.description}
                                </p>
                            </div>
                        </motion.button>
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
