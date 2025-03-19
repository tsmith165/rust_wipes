'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface OverlayTitleProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
    animation?: boolean | 'fade' | 'slide' | 'scale';
    gradient?: boolean | 'primary' | 'st' | 'accent';
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}

const SIZE_CLASSES = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
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
    bold: 'font-bold',
};

const GRADIENT_CLASSES: Record<string, string> = {
    primary: 'bg-gradient-to-r from-primary_light to-amber-300 bg-clip-text text-transparent',
    st: 'bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent',
    accent: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent',
    default: 'bg-gradient-to-r from-primary_light to-amber-300 bg-clip-text text-transparent',
};

// Animation variants
const animationVariants = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 },
    },
    slide: {
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, type: 'spring', stiffness: 300, damping: 30 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3 },
    },
};

export const OverlayTitle: React.FC<OverlayTitleProps> = ({
    children,
    size = 'md',
    color = 'text-primary_light',
    align = 'left',
    className,
    animation = true,
    gradient = false,
    weight = 'semibold',
}) => {
    const Component = animation ? motion.h2 : 'h2';

    // Set animation props based on the animation type
    let animationProps = {};
    if (animation) {
        if (typeof animation === 'string' && animation in animationVariants) {
            animationProps = animationVariants[animation];
        } else {
            // Default animation
            animationProps = {
                initial: { opacity: 0, y: -10 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.3, delay: 0.1 },
            };
        }
    }

    // Handle gradient text
    const gradientClass = gradient
        ? typeof gradient === 'string' && gradient in GRADIENT_CLASSES
            ? GRADIENT_CLASSES[gradient]
            : GRADIENT_CLASSES['default']
        : '';

    return (
        <Component
            className={cn(SIZE_CLASSES[size], ALIGN_CLASSES[align], WEIGHT_CLASSES[weight], !gradient && color, gradientClass, className)}
            {...animationProps}
        >
            {children}
        </Component>
    );
};
