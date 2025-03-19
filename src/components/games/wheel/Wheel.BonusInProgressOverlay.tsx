'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BonusInProgressOverlayProps {
    isVisible: boolean;
    bonusType: 'normal' | 'sticky';
    spinsRemaining: number;
}

export function BonusInProgressOverlay({ isVisible, bonusType, spinsRemaining }: BonusInProgressOverlayProps) {
    if (!isVisible) return null;

    const imagePath = bonusType === 'sticky' ? '/rust_icons/sticky_bonus_banner.png' : '/rust_icons/normal_bonus_banner.png';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center space-y-4 rounded-lg bg-stone-900 p-8 text-center">
                <Image src={imagePath} alt={`${bonusType} bonus`} width={300} height={150} className="rounded-lg" />
                <h2 className="text-2xl font-bold text-primary_light">
                    Slot {bonusType.charAt(0).toUpperCase() + bonusType.slice(1)} Bonus In Progress!
                </h2>
                <p className="text-lg text-st_white">You have {spinsRemaining} free spins remaining.</p>
                <Link
                    href="/games/rusty-slots"
                    className={cn(
                        'rounded-lg px-6 py-3 font-semibold text-st_white transition-colors',
                        'bg-primary_light hover:bg-primary_light/80',
                    )}
                >
                    Continue Bonus Spins
                </Link>
            </div>
        </div>
    );
}
