'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OverlayBackgroundProps {
    onClick?: () => void;
    style?: 'default' | 'blur' | 'dim' | 'none';
    color?: string;
    opacity?: number;
    className?: string;
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

const STYLE_PRESETS = {
    default: 'bg-stone-950/50',
    blur: 'bg-stone-950/30 backdrop-blur-sm',
    dim: 'bg-stone-950/70',
    none: 'pointer-events-none',
};

export const OverlayBackground: React.FC<OverlayBackgroundProps> = ({
    onClick,
    style = 'default',
    color,
    opacity,
    className,
    containerRef,
}) => {
    const baseClasses = containerRef?.current ? 'absolute' : 'fixed';
    const styleClass = STYLE_PRESETS[style];
    const customColor = color ? `bg-[${color}]` : '';
    const customOpacity = opacity !== undefined ? `bg-opacity-${opacity}` : '';

    return (
        <motion.div
            className={cn(baseClasses, 'inset-0 z-40', styleClass, customColor, customOpacity, className)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClick}
        />
    );
};
