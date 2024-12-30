'use client';

import React from 'react';
import { SlotCharacter } from './Slot.Character';
import type { SpinResult } from '@/app/gambling/slots/default/Default.Actions';

export interface SlotCharactersProps {
    spinning: boolean;
    result: SpinResult | null;
}

/**
 * Characters display component for slot machines.
 * Wraps two SlotCharacter components for left and right sides.
 */
export function SlotCharacters({ spinning, result }: SlotCharactersProps) {
    return (
        <div className="flex w-full justify-between">
            <SlotCharacter side="left" />
            <SlotCharacter side="right" />
        </div>
    );
}
