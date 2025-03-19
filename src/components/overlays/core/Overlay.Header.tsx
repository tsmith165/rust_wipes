'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OverlayTitle, OverlayTitleProps } from './Overlay.Title';
import { OverlaySubtitle, OverlaySubtitleProps } from './Overlay.Subtitle';

export interface OverlayHeaderProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    onClose?: () => void;
    className?: string;
    titleProps?: Omit<OverlayTitleProps, 'children'>;
    titleSize?: 'sm' | 'md' | 'lg' | 'xl';
    subtitleProps?: Omit<OverlaySubtitleProps, 'children'>;
    showBorder?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_CLASSES = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
};

// Animation variants for the close button
const closeButtonVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    tap: { scale: 0.95 },
};

export const OverlayHeader: React.FC<OverlayHeaderProps> = ({
    title,
    subtitle,
    onClose,
    className,
    titleProps,
    titleSize,
    subtitleProps,
    showBorder = false,
    padding = 'md',
}) => {
    if (!title && !subtitle && !onClose) return null;

    return (
        <motion.div
            className={cn(
                'relative flex flex-col items-center',
                PADDING_CLASSES[padding],
                showBorder && 'border-b border-stone-700/30',
                className,
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {title &&
                (typeof title === 'string' ? (
                    <OverlayTitle {...titleProps} size={titleSize}>
                        {title}
                    </OverlayTitle>
                ) : (
                    title
                ))}
            {subtitle && (typeof subtitle === 'string' ? <OverlaySubtitle {...subtitleProps}>{subtitle}</OverlaySubtitle> : subtitle)}
            {onClose && (
                <motion.button
                    onClick={onClose}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:text-primary_light md:right-3 md:top-2"
                    variants={closeButtonVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ duration: 0.2 }}
                    aria-label="Close"
                >
                    <X size={18} strokeWidth={2} />
                </motion.button>
            )}
        </motion.div>
    );
};
