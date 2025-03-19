'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface OverlaySubtitleProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
    animation?: boolean | 'fade' | 'slide' | 'scale';
    weight?: 'light' | 'normal' | 'medium' | 'semibold';
    opacity?: number;
}

const SIZE_CLASSES = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
};

const ALIGN_CLASSES = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

const WEIGHT_CLASSES = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
};

const OPACITY_CLASSES: Record<string, string> = {
    '90': 'opacity-90',
    '80': 'opacity-80',
    '70': 'opacity-70',
    '60': 'opacity-60',
    '50': 'opacity-50',
};

// Animation variants
const animationVariants = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 },
    },
    slide: {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, type: 'spring', stiffness: 300, damping: 30 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3 },
    },
};

export const OverlaySubtitle: React.FC<OverlaySubtitleProps> = ({
    children,
    size = 'md',
    color = 'text-stone-400',
    align = 'left',
    className,
    animation = true,
    weight = 'normal',
    opacity,
}) => {
    const Component = animation ? motion.p : 'p';

    // Set animation props based on the animation type
    let animationProps = {};
    if (animation) {
        if (typeof animation === 'string' && animation in animationVariants) {
            animationProps = animationVariants[animation];
        } else {
            // Default animation
            animationProps = {
                initial: { opacity: 0, y: -5 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.3, delay: 0.2 },
            };
        }
    }

    // Get opacity class if provided
    const opacityClass = opacity ? OPACITY_CLASSES[opacity.toString()] || '' : '';

    return (
        <Component
            className={cn(SIZE_CLASSES[size], ALIGN_CLASSES[align], WEIGHT_CLASSES[weight], color, opacityClass, className)}
            {...animationProps}
        >
            {children}
        </Component>
    );
};
