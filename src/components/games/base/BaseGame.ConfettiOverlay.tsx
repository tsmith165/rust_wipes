'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface BaseGameConfettiOverlayProps {
    isVisible: boolean;
    onComplete?: () => void;
    containerRef?: React.RefObject<HTMLDivElement | null>;
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

export function BaseGameConfettiOverlay({ isVisible, onComplete, containerRef, config = {} }: BaseGameConfettiOverlayProps) {
    const defaultContainerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0, top: 0, left: 0 });
    const activeRef = containerRef || defaultContainerRef;

    // Update dimensions on mount and window resize
    React.useEffect(() => {
        const updateDimensions = () => {
            if (activeRef.current) {
                const rect = activeRef.current.getBoundingClientRect();
                setDimensions({
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        window.addEventListener('scroll', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            window.removeEventListener('scroll', updateDimensions);
        };
    }, [activeRef]);

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
        <div
            ref={defaultContainerRef}
            style={{
                position: 'fixed',
                top: dimensions.top,
                left: dimensions.left,
                width: dimensions.width,
                height: dimensions.height,
                pointerEvents: 'none',
                zIndex: 100,
            }}
            className={cn(className)}
        >
            <Confetti
                width={width}
                height={height}
                numberOfPieces={numberOfPieces}
                gravity={gravity}
                initialVelocityX={initialVelocityX}
                initialVelocityY={initialVelocityY}
                recycle={recycle}
                onConfettiComplete={onComplete}
                confettiSource={{
                    x: width / 2,
                    y: height / 2,
                    w: 0,
                    h: 0,
                }}
            />
        </div>
    );
}
