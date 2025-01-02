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
    animation?: boolean;
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

export const OverlayTitle: React.FC<OverlayTitleProps> = ({
    children,
    size = 'md',
    color = 'text-primary_light',
    align = 'left',
    className,
    animation = true,
}) => {
    const Component = animation ? motion.h2 : 'h2';
    const animationProps = animation
        ? {
              initial: { opacity: 0, y: -10 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.2, delay: 0.1 },
          }
        : {};

    console.log('Overlay Title size', size);

    return (
        <Component className={cn('font-semibold', SIZE_CLASSES[size], ALIGN_CLASSES[align], color, className)} {...animationProps}>
            {children}
        </Component>
    );
};
