'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OverlayHeader } from './Overlay.Header';
import { OverlayContents } from './Overlay.Contents';

export interface OverlayProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: React.ReactNode;
    titleSize?: 'sm' | 'md' | 'lg' | 'xl';
    subtitle?: React.ReactNode;
    format?: 'pill' | 'card' | 'fullscreen';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'fit' | { width: string; height?: string };
    position?: 'none' | 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    animation?: {
        initial?: object;
        animate?: object;
        exit?: object;
        transition?: object;
    };
    showCloseButton?: boolean;
    className?: string;
    children: React.ReactNode;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    showBackdrop?: boolean;
    preventBodyScroll?: boolean;
    backdropBlur?: boolean;
    useFlexPositioning?: boolean;
}

type OverlayFormat = 'pill' | 'card' | 'fullscreen';
type OverlayPosition = 'none' | 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// Responsive size classes that work better on mobile and desktop
const SIZE_CLASSES = {
    sm: 'w-[90%] sm:w-[400px]',
    md: 'w-[95%] sm:w-[600px]',
    lg: 'w-[95%] sm:w-[800px]',
    xl: 'w-[95%] sm:w-[1000px]',
    fit: 'w-fit',
};

const getPositionClasses = (position: OverlayPosition, containerRef: React.RefObject<HTMLDivElement | null> | undefined): string => {
    // Use absolute positioning when a container ref is provided, otherwise fixed
    const positionType = containerRef?.current ? 'absolute' : 'fixed';

    // For top positions, add extra spacing to account for navbar when using fixed positioning
    const topOffset = positionType === 'fixed' ? 'top-[54px]' : 'top-4';
    const topLeftOffset = positionType === 'fixed' ? 'top-[54px] left-4' : 'top-4 left-4';
    const topRightOffset = positionType === 'fixed' ? 'top-[54px] right-4' : 'top-4 right-4';

    const positions: Record<OverlayPosition, string> = {
        none: '',
        center: `${positionType} left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`,
        top: `${positionType} ${topOffset} left-1/2 -translate-x-1/2`,
        bottom: `${positionType} bottom-4 left-1/2 -translate-x-1/2`,
        left: `${positionType} left-4 top-1/2 -translate-y-1/2`,
        right: `${positionType} right-4 top-1/2 -translate-y-1/2`,
        'top-left': `${positionType} ${topLeftOffset}`,
        'top-right': `${positionType} ${topRightOffset}`,
        'bottom-left': `${positionType} bottom-4 left-4`,
        'bottom-right': `${positionType} bottom-4 right-4`,
    };

    return positions[position] || positions.center;
};

const getFormatClasses = (format: OverlayFormat): string => {
    const formats: Record<OverlayFormat, string> = {
        pill: 'rounded-3xl',
        card: 'rounded-xl',
        fullscreen: '',
    };
    return formats[format] || formats.card;
};

const getSizeClasses = (size: OverlayProps['size']): string => {
    if (!size) return SIZE_CLASSES.md;
    if (typeof size === 'string') return SIZE_CLASSES[size] || SIZE_CLASSES.md;
    return cn(size.width, size.height);
};

const getDefaultAnimation = (format: string, position: string) => {
    const isCenter = position === 'center';

    if (format === 'fullscreen') {
        return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.3, ease: 'easeInOut' },
        };
    }

    return {
        initial: { opacity: 0, scale: isCenter ? 0.95 : 1, y: isCenter ? 0 : 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: isCenter ? 0.98 : 1, y: isCenter ? 0 : 10 },
        transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 30 },
    };
};

// Animation variants for the backdrop
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

export const OverlayContainer: React.FC<OverlayProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    format = 'card',
    size = 'md',
    titleSize = 'md',
    position = 'center',
    animation,
    showCloseButton = true,
    className,
    children,
    containerRef,
    showBackdrop = true,
    preventBodyScroll = true,
    backdropBlur = true,
    useFlexPositioning = true,
}) => {
    const positionClasses = getPositionClasses(position, containerRef);
    const formatClasses = getFormatClasses(format);
    const sizeClasses = getSizeClasses(size);
    const defaultAnimation = getDefaultAnimation(format, position);
    const finalAnimation = animation || defaultAnimation;

    // Handle body scroll locking when the overlay is open
    useEffect(() => {
        if (!preventBodyScroll) return;

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, preventBodyScroll]);

    // Handle clicking outside to close if onClose is provided
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    // Determine if we should use flex positioning or direct positioning
    const shouldUseFlexPositioning = useFlexPositioning && position === 'center';

    // The content of the overlay
    const overlayContent = (
        <div className="flex h-full flex-col gap-4 p-4">
            <OverlayHeader
                title={title}
                subtitle={subtitle}
                onClose={showCloseButton ? onClose : undefined}
                titleSize={titleSize}
                padding="none"
            />
            <OverlayContents>{children}</OverlayContents>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    {showBackdrop && (
                        <motion.div
                            className={cn(
                                'fixed inset-0 z-40 bg-black/60',
                                backdropBlur && 'backdrop-blur-sm',
                                shouldUseFlexPositioning && 'flex items-center justify-center',
                            )}
                            variants={backdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.2 }}
                            onClick={handleBackdropClick}
                            key="backdrop"
                        >
                            {/* If using flex positioning, render the overlay inside the backdrop */}
                            {shouldUseFlexPositioning && (
                                <motion.div
                                    className={cn(
                                        'z-50 max-h-[90%] border border-stone-700/30 bg-stone-950/95 shadow-xl',
                                        sizeClasses,
                                        formatClasses,
                                        className,
                                    )}
                                    {...finalAnimation}
                                    key="overlay-flex"
                                    onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching backdrop
                                >
                                    {overlayContent}
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* For directly positioned overlays or when backdrop is disabled */}
                    {(!shouldUseFlexPositioning || !showBackdrop) && (
                        <motion.div
                            className={cn(
                                'z-50 border border-stone-700/30 bg-stone-950/95 shadow-xl',
                                positionClasses,
                                sizeClasses,
                                formatClasses,
                                className,
                            )}
                            {...finalAnimation}
                            key="overlay-positioned"
                        >
                            {overlayContent}
                        </motion.div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
};
