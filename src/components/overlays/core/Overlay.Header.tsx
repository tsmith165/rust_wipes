'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
        <div
            className={cn(
                'relative flex flex-col items-center',
                PADDING_CLASSES[padding],
                showBorder && 'border-b border-stone-800',
                className,
            )}
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
                    className="absolute right-3 top-1 text-stone-400 transition-colors hover:text-primary_light"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    ✕
                </motion.button>
            )}
        </div>
    );
};
