'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SlotContainerProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Base container component for slot machines.
 * Handles the overall layout and background.
 */
export function SlotContainer({ children, className }: SlotContainerProps) {
    return (
        <div className="relative flex h-[calc(100dvh-50px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-stone-800 text-white">
            {/* Main Content Layer */}
            <div className={cn('z-10 flex w-full flex-col items-center', className)}>
                {/* Slot Machine Section with Background Images */}
                <div className="flex w-full flex-row items-center justify-center">{children}</div>
            </div>
        </div>
    );
}
