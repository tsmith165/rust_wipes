'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BaseGameCharacter } from './BaseGame.Character';

export interface SlotContainerProps {
    slot_grid: React.ReactNode;
    slot_controls: React.ReactNode;
    slot_recent_winners: React.ReactNode;
    className?: string;
    row1Ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Base container component for slot machines.
 * Handles the overall layout and background.
 */
export function SlotContainer({ slot_grid, slot_controls, slot_recent_winners, className, row1Ref }: SlotContainerProps) {
    return (
        <div className="relative flex h-[calc(100dvh-50px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-stone-800 text-white">
            {/* Row 1: Characters and Slot Grid */}
            <div ref={row1Ref} className={cn('z-10 flex w-full flex-row items-center', className)}>
                <BaseGameCharacter side="left" />
                <div className="flex w-1/2 items-center justify-center">{slot_grid}</div>
                <BaseGameCharacter side="right" />
            </div>

            {/* Row 2: Controls */}
            <div className="w-full max-w-[1200px] px-4">
                <div className="rounded-lg bg-stone-700 p-4">{slot_controls}</div>
            </div>

            {/* Row 3: Recent Winners */}
            <div className="mt-4 w-full max-w-[1200px] px-4 pb-4">
                <div className="rounded-lg bg-stone-700 p-4">{slot_recent_winners}</div>
            </div>
        </div>
    );
}
