'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FaCoins } from 'react-icons/fa';

interface CreditsDisplayProps {
    value: number;
    previousValue?: number;
    className?: string;
    animate?: boolean;
    showParticles?: boolean;
    onAnimationComplete?: () => void;
}

interface CreditParticleProps {
    startPosition: { x: number; y: number };
    endPosition: { x: number; y: number };
    value: number;
    duration?: number;
    className?: string;
}

const CreditParticle: React.FC<CreditParticleProps> = ({ startPosition, endPosition, value, duration = 1, className }) => {
    return (
        <motion.div
            initial={{
                x: startPosition.x,
                y: startPosition.y,
                opacity: 1,
                scale: 1,
            }}
            animate={{
                x: endPosition.x,
                y: endPosition.y,
                opacity: 0,
                scale: 0.5,
            }}
            transition={{
                duration,
                ease: 'easeOut',
            }}
            className={cn('absolute flex items-center justify-center text-sm font-bold text-yellow-400', className)}
        >
            <FaCoins className="mr-1 h-4 w-4" />+{value}
        </motion.div>
    );
};

const numberWithCommas = (x: number) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export function SlotCreditsDisplay({
    value,
    previousValue,
    className,
    animate = true,
    showParticles = true,
    onAnimationComplete,
}: CreditsDisplayProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const [particles, setParticles] = useState<Array<{ id: number; value: number }>>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const particleCount = useRef(0);

    useEffect(() => {
        if (!animate) {
            setDisplayValue(value);
            return;
        }

        // If there's a previous value and it's different from the current value
        if (previousValue !== undefined && previousValue !== value) {
            const diff = value - previousValue;
            const duration = 1000; // 1 second
            const steps = 20; // Number of steps in the animation
            const stepDuration = duration / steps;
            const stepValue = diff / steps;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                setDisplayValue((prev) => {
                    const next = prev + stepValue;
                    return currentStep === steps ? value : next;
                });

                if (currentStep === steps) {
                    clearInterval(interval);
                    onAnimationComplete?.();
                }
            }, stepDuration);

            // Create particles if showing a win
            if (showParticles && diff > 0 && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const newParticles = Array.from({ length: Math.min(5, Math.ceil(diff / 100)) }, () => ({
                    id: particleCount.current++,
                    value: Math.ceil(diff / 5),
                }));
                setParticles((prev) => [...prev, ...newParticles]);

                // Clean up particles after animation
                setTimeout(() => {
                    setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
                }, 1000);
            }

            return () => clearInterval(interval);
        } else {
            setDisplayValue(value);
        }
    }, [value, previousValue, animate, showParticles, onAnimationComplete]);

    return (
        <div ref={containerRef} className={cn('relative flex items-center', className)}>
            <FaCoins className="mr-2 h-6 w-6 text-yellow-400" />
            <motion.span
                key={displayValue}
                initial={animate ? { scale: 1.2, color: '#FBBF24' } : false}
                animate={{ scale: 1, color: '#FFFFFF' }}
                className="text-2xl font-bold"
            >
                {numberWithCommas(Math.floor(displayValue))}
            </motion.span>

            <AnimatePresence>
                {particles.map((particle) => (
                    <CreditParticle
                        key={particle.id}
                        startPosition={{ x: 0, y: 0 }}
                        endPosition={{
                            x: (Math.random() - 0.5) * 100,
                            y: -50 - Math.random() * 50,
                        }}
                        value={particle.value}
                        duration={1 + Math.random() * 0.5}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
