'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface BaseGameConfettiOverlayProps {
    isVisible: boolean;
    onComplete?: () => void;
    config?: {
        numberOfPieces?: number;
        gravity?: number;
        initialVelocityX?: number;
        initialVelocityY?: number;
        width?: number;
        height?: number;
        recycle?: boolean;
        className?: string;
    };
}

export function BaseGameConfettiOverlay({ isVisible, onComplete, config = {} }: BaseGameConfettiOverlayProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    // Update dimensions on mount and window resize
    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    if (!isVisible) return null;

    const {
        numberOfPieces = 200,
        gravity = 0.2,
        initialVelocityX = 5,
        initialVelocityY = 20,
        width = dimensions.width,
        height = dimensions.height,
        recycle = false,
        className,
    } = config;

    return (
        <div ref={containerRef} className={cn('pointer-events-none fixed inset-0', className)}>
            <Confetti
                width={width}
                height={height}
                numberOfPieces={numberOfPieces}
                gravity={gravity}
                initialVelocityX={initialVelocityX}
                initialVelocityY={initialVelocityY}
                recycle={recycle}
                onConfettiComplete={onComplete}
            />
        </div>
    );
}
