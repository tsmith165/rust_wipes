'use client';

import React from 'react';
import Image from 'next/image';
import type { MachineCharacterProps } from './types';

export default function MachineCharacter({ imagePath, position }: MachineCharacterProps) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-end">
            <div className={`relative w-full ${position === 'right' ? '' : '-scale-x-100'}`}>
                <Image
                    src={imagePath}
                    alt={`${position} character`}
                    priority
                    width={512}
                    height={512}
                    className="h-auto w-full object-contain"
                />
            </div>
        </div>
    );
}
