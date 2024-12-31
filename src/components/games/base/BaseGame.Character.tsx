'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface BaseGameCharacterProps {
    side: 'left' | 'right';
    className?: string;
    imagePath?: string;
    imageAlt?: string;
}

/**
 * Character display component for slot machines.
 * Can be positioned on either side and optionally mirrored.
 */
export function BaseGameCharacter({
    side,
    className,
    imagePath = '/rust_hazmat_icon_large.png',
    imageAlt = 'Rust Hazmat Icon',
}: BaseGameCharacterProps) {
    return (
        <div
            className={cn('z-100 hidden h-full w-1/4 items-end', side === 'left' ? 'justify-end' : 'justify-start', 'md:!flex', className)}
        >
            <Image
                src={imagePath}
                alt={`${imageAlt} ${side.charAt(0).toUpperCase() + side.slice(1)}`}
                width={512}
                height={512}
                className={cn('h-auto w-auto', side === 'right' && 'scale-x-[-1]')}
                priority
            />
        </div>
    );
}
