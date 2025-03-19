'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { OverlayContainer } from '../core/Overlay.Container';

interface ModalBonusInProgressProps {
    isOpen: boolean;
    onClose: () => void;
    bonusType: 'normal' | 'sticky';
    spinsRemaining: number;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    className?: string;
}

/**
 * Modal.BonusInProgress - A reusable bonus progress overlay component
 *
 * Features:
 * - Uses OverlayContainer for consistent styling
 * - Responsive design with mobile support
 * - Framer Motion animations
 * - Dynamic positioning relative to container
 * - Image support for bonus type banners
 */
export function ModalBonusInProgress({ isOpen, onClose, bonusType, spinsRemaining, containerRef, className }: ModalBonusInProgressProps) {
    const imagePath = bonusType === 'sticky' ? '/rust_icons/sticky_bonus_banner.png' : '/rust_icons/normal_bonus_banner.png';

    return (
        <OverlayContainer
            isOpen={isOpen}
            onClose={onClose}
            format="card"
            size="fit"
            position="center"
            animation={{
                initial: { opacity: 0, scale: 0.95 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.95 },
                transition: { duration: 0.2 },
            }}
            className={cn('bg-stone-900/95', className)}
            containerRef={containerRef}
            showCloseButton={false}
        >
            <div className="flex flex-col items-center space-y-4 p-4 text-center xs:p-8">
                <Image
                    src={imagePath}
                    alt={`${bonusType} bonus`}
                    width={300}
                    height={150}
                    className="h-[75px] w-[150px] rounded-lg xs:h-[150px] xs:w-[300px]"
                />
                <h2 className="text-xl font-bold text-primary_light xs:text-2xl">
                    Slot {bonusType.charAt(0).toUpperCase() + bonusType.slice(1)} Bonus In Progress!
                </h2>
                <p className="text-base text-stone-200 xs:text-lg">You have {spinsRemaining} free spins remaining.</p>
                <Link
                    href="/games/rusty-slots"
                    className={cn(
                        'rounded-lg px-4 py-2 text-sm font-semibold text-st_white transition-colors xs:px-6 xs:py-3 xs:text-base',
                        'bg-primary_light hover:bg-primary_light/80',
                    )}
                >
                    Continue Bonus Spins
                </Link>
            </div>
        </OverlayContainer>
    );
}
