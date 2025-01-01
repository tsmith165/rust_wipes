'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OverlayBackground } from './Overlay.Background';
import { OverlayHeader } from './Overlay.Header';
import { OverlayContents } from './Overlay.Contents';
import { cn } from '@/lib/utils';

type OverlayFormat = 'pill' | 'sidebar';
type OverlayPosition =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'middle-left'
    | 'middle'
    | 'middle-right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right';

export interface OverlayProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string | React.ReactNode;
    subtitle?: string | React.ReactNode;
    format?: 'pill' | 'sidebar';
    position?: 'top-right' | 'top' | 'top-left' | 'middle-right' | 'middle' | 'middle-left' | 'bottom-left' | 'bottom' | 'bottom-right';
    width?: string;
    children?: React.ReactNode;
    showBackground?: boolean;
    isRelative?: boolean;
    className?: string;
}

const getPositionClasses = (position: OverlayPosition, isRelative: boolean): string => {
    const positions = {
        'top-left': isRelative ? 'absolute top-4 left-4' : 'fixed top-4 left-4',
        top: isRelative ? 'absolute top-4 left-1/2 -translate-x-1/2' : 'fixed top-4 left-1/2 -translate-x-1/2',
        'top-right': isRelative ? 'absolute top-4 right-4' : 'fixed top-4 right-4',
        'middle-left': isRelative ? 'absolute top-1/2 left-4 -translate-y-1/2' : 'fixed top-1/2 left-4 -translate-y-1/2',
        middle: isRelative
            ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        'middle-right': isRelative ? 'absolute top-1/2 right-4 -translate-y-1/2' : 'fixed top-1/2 right-4 -translate-y-1/2',
        'bottom-left': isRelative ? 'absolute bottom-4 left-4' : 'fixed bottom-4 left-4',
        bottom: isRelative ? 'absolute bottom-4 left-1/2 -translate-x-1/2' : 'fixed bottom-4 left-1/2 -translate-x-1/2',
        'bottom-right': isRelative ? 'absolute bottom-4 right-4' : 'fixed bottom-4 right-4',
    };
    return positions[position];
};

const getFormatClasses = (format: OverlayFormat): string => {
    const formats = {
        pill: 'rounded-xl max-w-md',
        sidebar: 'h-full rounded-none',
    };
    return formats[format];
};

const getAnimationVariants = (format: OverlayFormat, position: OverlayPosition) => {
    if (format === 'sidebar') {
        const isRight = position.includes('right');
        return {
            hidden: {
                x: isRight ? '100%' : '-100%',
                opacity: 0,
            },
            visible: {
                x: 0,
                opacity: 1,
                transition: {
                    type: 'spring',
                    damping: 25,
                    stiffness: 200,
                },
            },
            exit: {
                x: isRight ? '100%' : '-100%',
                opacity: 0,
            },
        };
    }

    // Pill format animations
    return {
        hidden: {
            y: position.includes('bottom') ? 20 : -20,
            opacity: 0,
            scale: 0.95,
        },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
            },
        },
        exit: {
            y: position.includes('bottom') ? 20 : -20,
            opacity: 0,
            scale: 0.95,
        },
    };
};

export const OverlayContainer: React.FC<OverlayProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    format = 'pill',
    position = 'top-right',
    width = 'w-96',
    children,
    showBackground = true,
    className,
    isRelative = false,
}) => {
    const positionClasses = getPositionClasses(position, isRelative);
    const formatClasses = getFormatClasses(format);
    const variants = getAnimationVariants(format, position);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {showBackground && <OverlayBackground onClose={onClose} />}
                    <motion.div
                        className={cn('z-50 bg-stone-900 shadow-lg', width, positionClasses, formatClasses, className)}
                        variants={variants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="flex h-full flex-col">
                            <OverlayHeader title={title} subtitle={subtitle} onClose={onClose} />
                            <OverlayContents>{children}</OverlayContents>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
