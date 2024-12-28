'use client';

import React from 'react';
import type { MachineBackgroundProps } from './types';

export default function MachineBackground({}: MachineBackgroundProps) {
    return (
        <div className="absolute inset-0 z-0">
            {/* Add any background patterns or effects here */}
            <div className="h-full w-full bg-gradient-to-b from-stone-800 to-stone-900" />
        </div>
    );
}
