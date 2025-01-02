'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OverlayHeader } from './Overlay.Header';
import { OverlayContents } from './Overlay.Contents';

export interface OverlayProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: React.ReactNode;
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
}

type OverlayFormat = 'pill' | 'card' | 'fullscreen';
type OverlayPosition = 'none' | 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const SIZE_CLASSES = {
    sm: 'w-[50dvw]',
    md: 'w-[70dvw]',
    lg: 'w-[80dvw]',
    xl: 'w-[90dvw]',
    fit: 'w-fit',
};

const getPositionClasses = (position: OverlayPosition, containerRef: React.RefObject<HTMLDivElement | null> | undefined): string => {
    const positionType = containerRef?.current ? 'absolute' : 'fixed';

    const positions: Record<OverlayPosition, string> = {
        none: '',
        center: `${positionType}`,
        top: `${positionType} top-4 left-1/2 -translate-x-1/2`,
        bottom: `${positionType} bottom-4 left-1/2 -translate-x-1/2`,
        left: `${positionType} left-4 top-1/2 -translate-y-1/2`,
        right: `${positionType} right-4 top-1/2 -translate-y-1/2`,
        'top-left': `${positionType} top-4 left-4`,
        'top-right': `${positionType} top-4 right-4`,
        'bottom-left': `${positionType} bottom-4 left-4`,
        'bottom-right': `${positionType} bottom-4 right-4`,
    };

    return positions[position] || positions.center;
};

const getFormatClasses = (format: OverlayFormat): string => {
    const formats: Record<OverlayFormat, string> = {
        pill: 'rounded-3xl',
        card: 'rounded-lg',
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
            transition: { duration: 0.2 },
        };
    }

    return {
        initial: { opacity: 0, scale: isCenter ? 0.95 : 1, y: isCenter ? 0 : 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: isCenter ? 0.95 : 1, y: isCenter ? 0 : 20 },
        transition: { duration: 0.2 },
    };
};

export const OverlayContainer: React.FC<OverlayProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    format = 'card',
    size = 'md',
    position = 'center',
    animation,
    showCloseButton = true,
    className,
    children,
    containerRef,
}) => {
    const positionClasses = getPositionClasses(position, containerRef);
    const formatClasses = getFormatClasses(format);
    const sizeClasses = getSizeClasses(size);
    const defaultAnimation = getDefaultAnimation(format, position);
    const finalAnimation = animation || defaultAnimation;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={cn('z-50 bg-stone-900 shadow-lg', sizeClasses, positionClasses, formatClasses, className)}
                        {...finalAnimation}
                    >
                        <div className="flex h-full flex-col">
                            <OverlayHeader title={title} subtitle={subtitle} onClose={showCloseButton ? onClose : undefined} />
                            <OverlayContents>{children}</OverlayContents>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
