'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimationSyncProps {
    duration: number;
    delay?: number;
    onStart?: () => void;
    onComplete?: () => void;
    children: React.ReactNode;
}

interface AnimationGroupProps {
    children: React.ReactElement<{ onAnimationComplete?: () => void }>[];
    className?: string;
    onAllComplete?: () => void;
}

export function SlotAnimationSync({ duration, delay = 0, onStart, onComplete, children }: AnimationSyncProps) {
    const hasStarted = useRef<boolean>(false);

    useEffect(() => {
        if (!hasStarted.current) {
            hasStarted.current = true;
            onStart?.();
        }

        const timer = setTimeout(
            () => {
                onComplete?.();
            },
            (delay + duration) * 1000,
        );

        return () => clearTimeout(timer);
    }, [duration, delay, onStart, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
                duration: duration / 2,
                delay: delay,
                ease: 'easeInOut',
            }}
        >
            {children}
        </motion.div>
    );
}

export function SlotAnimationGroup({ children, className, onAllComplete }: AnimationGroupProps) {
    const completedAnimations = useRef<Set<string>>(new Set());
    const totalAnimations = useRef<number>(React.Children.count(children));

    const handleAnimationComplete = (id: string) => {
        completedAnimations.current.add(id);
        if (completedAnimations.current.size === totalAnimations.current) {
            onAllComplete?.();
        }
    };

    useEffect(() => {
        // Reset on new children
        completedAnimations.current.clear();
        totalAnimations.current = React.Children.count(children);
    }, [children]);

    return (
        <div className={cn('relative', className)}>
            <AnimatePresence mode="wait">
                {React.Children.map(children, (child, index) => {
                    if (!React.isValidElement(child)) return null;

                    return React.cloneElement(child, {
                        key: `animation-${index}`,
                        onAnimationComplete: () => handleAnimationComplete(`animation-${index}`),
                    } as Partial<typeof child.props>);
                })}
            </AnimatePresence>
        </div>
    );
}

export function useAnimationSync(duration: number, delay: number = 0) {
    const isAnimating = useRef<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const startAnimation = (onStart?: () => void, onComplete?: () => void) => {
        if (isAnimating.current) return;

        isAnimating.current = true;
        onStart?.();

        timeoutRef.current = setTimeout(
            () => {
                isAnimating.current = false;
                onComplete?.();
            },
            (delay + duration) * 1000,
        );
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        isAnimating: isAnimating.current,
        startAnimation,
    };
}
