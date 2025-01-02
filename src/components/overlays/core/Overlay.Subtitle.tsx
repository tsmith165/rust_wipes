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
    animation?: boolean;
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

export const OverlaySubtitle: React.FC<OverlaySubtitleProps> = ({
    children,
    size = 'md',
    color = 'text-stone-400',
    align = 'left',
    className,
    animation = true,
}) => {
    const Component = animation ? motion.p : 'p';
    const animationProps = animation
        ? {
              initial: { opacity: 0, y: -5 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.2, delay: 0.2 },
          }
        : {};

    return (
        <Component className={cn(SIZE_CLASSES[size], ALIGN_CLASSES[align], color, className)} {...animationProps}>
            {children}
        </Component>
    );
};
