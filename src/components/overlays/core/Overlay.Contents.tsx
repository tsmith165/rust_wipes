'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OverlayContentsProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    maxHeight?: string;
    fadeIn?: boolean;
    staggerChildren?: boolean;
}

const PADDING_CLASSES = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
};

// Animation variants for contents
const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.4,
            when: 'beforeChildren',
            staggerChildren: 0.1,
        },
    },
};

export const OverlayContents: React.FC<OverlayContentsProps> = ({
    children,
    className,
    padding = 'none',
    maxHeight = 'max-h-[70vh]',
    fadeIn = true,
    staggerChildren = false,
}) => {
    const contentProps = fadeIn
        ? {
              variants: staggerChildren ? contentVariants : undefined,
              initial: staggerChildren ? 'hidden' : { opacity: 0 },
              animate: staggerChildren ? 'visible' : { opacity: 1 },
              transition: staggerChildren ? undefined : { delay: 0.2, duration: 0.3 },
          }
        : {};

    return (
        <motion.div
            className={cn(
                'scrollbar-thin scrollbar-track-stone-800 scrollbar-thumb-stone-600 flex-1 overflow-y-auto',
                PADDING_CLASSES[padding],
                maxHeight,
                className,
            )}
            {...contentProps}
        >
            {children}
        </motion.div>
    );
};
