'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Types for theme customization
interface BonusModalTheme {
    backgroundColor?: string;
    textColor?: string;
    titleSize?: string;
    subtitleSize?: string;
    padding?: string;
    width?: string;
    borderRadius?: string;
}

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

interface BaseGameBonusModalProps<T extends string> {
    isVisible?: boolean;
    onSelect: (type: T) => void;
    onClose?: () => void;
    showConfetti?: boolean;
    onConfettiComplete?: () => void;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    title?: string;
    subtitle?: string;
    options: BonusOption<T>[];
    theme?: BonusModalTheme;
    className?: string;
}

/**
 * BaseGame.BonusModal - A reusable modal component for bonus selection in games
 *
 * Features:
 * - Flexible theming system
 * - Responsive design with mobile support
 * - Confetti animation integration
 * - Framer Motion animations
 * - Dynamic positioning relative to container
 */
export function BaseGameBonusModal<T extends string>({
    isVisible = true,
    onSelect,
    onClose,
    showConfetti = false,
    onConfettiComplete,
    containerRef,
    title = 'Select Your Bonus',
    subtitle,
    options,
    theme = {},
    className,
}: BaseGameBonusModalProps<T>) {
    // Default container ref if none provided
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
    const defaultTheme: Required<BonusModalTheme> = {
        backgroundColor: 'bg-stone-950',
        textColor: 'text-white',
        titleSize: 'text-2xl xs:text-4xl',
        subtitleSize: 'text-lg xs:text-2xl',
        padding: 'p-3 xs:p-6',
        width: 'max-w-lg',
        borderRadius: 'rounded-lg',
    };

    // Merge default theme with provided theme
    const finalTheme = { ...defaultTheme, ...theme };

    return (
        <AnimatePresence>
            {isVisible && (
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
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
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
                        style={{ pointerEvents: 'auto' }}
                    >
                        {/* Close button if onClose provided */}
                        {onClose && (
                            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white">
                                ✕
                            </button>
                        )}

                        {/* Title Section */}
                        <h2 className={cn('mb-1 text-center font-bold text-primary_light xs:mb-2', finalTheme.titleSize)}>{title}</h2>
                        {subtitle && <h3 className={cn('mb-3 text-center xs:mb-6', finalTheme.subtitleSize)}>{subtitle}</h3>}

                        {/* Options Grid */}
                        <div className="flex w-full flex-col items-center justify-center space-y-2 xs:flex-row xs:space-x-2 xs:space-y-0">
                            {options.map((option, index) => (
                                <button key={index} onClick={() => onSelect(option.type)} className="group relative w-fit">
                                    {/* Mobile Image */}
                                    {option.mobileImageWidth && option.mobileImageHeight && (
                                        <Image
                                            src={option.imagePath}
                                            alt={option.imageAlt}
                                            width={option.mobileImageWidth}
                                            height={option.mobileImageHeight}
                                            className="rounded-lg"
                                        />
                                    )}
                                    {/* Desktop Image */}
                                    <Image
                                        src={option.imagePath}
                                        alt={option.imageAlt}
                                        width={option.imageWidth}
                                        height={option.imageHeight}
                                        className={cn('rounded-lg', option.mobileImageWidth ? 'hidden xs:block' : '')}
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-stone-900 bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-70">
                                        <p className="px-2 text-center text-sm opacity-0 group-hover:opacity-100 xs:px-4 lg:text-base">
                                            {option.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Confetti Overlay */}
                    {showConfetti && (
                        <Confetti
                            width={dimensions.width}
                            height={dimensions.height}
                            recycle={false}
                            numberOfPieces={200}
                            onConfettiComplete={onConfettiComplete}
                        />
                    )}
                </div>
            )}
        </AnimatePresence>
    );
}
