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
    subtitleProps,
    showBorder = true,
    padding = 'md',
}) => {
    if (!title && !subtitle && !onClose) return null;

    return (
        <div className={cn('relative', PADDING_CLASSES[padding], showBorder && 'border-b border-stone-800', className)}>
            {title && (typeof title === 'string' ? <OverlayTitle {...titleProps}>{title}</OverlayTitle> : title)}
            {subtitle && (typeof subtitle === 'string' ? <OverlaySubtitle {...subtitleProps}>{subtitle}</OverlaySubtitle> : subtitle)}
            {onClose && (
                <motion.button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    ✕
                </motion.button>
            )}
        </div>
    );
};
