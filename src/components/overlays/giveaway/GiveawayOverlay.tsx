'use client';

import React, { useEffect } from 'react';
import { OverlayContainer } from '../core/Overlay.Container';
import { GiveawayProgress } from './GiveawayProgress';
import { PlayerList } from './PlayerList';
import Link from 'next/link';
import { useGiveawayStore } from '@/stores/Store.Giveaway';

interface GiveawayOverlayProps {
    isOpen: boolean;
    onClose?: () => void;
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    className?: string;
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const GiveawayOverlay: React.FC<GiveawayOverlayProps> = ({ isOpen, onClose, position = 'top-right', className, containerRef }) => {
    const { fetchQualifiedCount, fetchPlayerPage, currentPage, playersByPage, qualifiedCount, totalPlayers, isLoading, setCurrentPage } =
        useGiveawayStore();

    useEffect(() => {
        if (isOpen) {
            // Fetch initial data
            fetchQualifiedCount();
            fetchPlayerPage(currentPage);

            // Refresh player data every 5 minutes
            const interval = setInterval(
                () => {
                    fetchPlayerPage(currentPage);
                    // Also refresh qualified count occasionally
                    if (Math.random() < 0.2) {
                        // 20% chance to refresh qualified count
                        fetchQualifiedCount();
                    }
                },
                5 * 60 * 1000,
            );

            return () => clearInterval(interval);
        }
    }, [isOpen, currentPage, fetchQualifiedCount, fetchPlayerPage]);

    const subtitle = (
        <span className="text-stone-300">
            First 100 players to be online for 10 hours on any of our servers get a free{' '}
            <Link href="/kits?type=monthly&kit=4" className="text-blue-400 underline transition-colors hover:text-blue-600">
                Captain Kit
            </Link>
            !
        </span>
    );

    const currentPlayers = playersByPage.get(currentPage) ?? [];

    return (
        <div className={`${className} relative`}>
            <OverlayContainer
                isOpen={isOpen}
                onClose={onClose}
                title={'Kit Giveaway!'}
                titleSize="xl"
                subtitle={subtitle}
                format="pill"
                position={position}
                size={{ width: 'w-72' }}
                className="bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 shadow-2xl shadow-stone-900/50"
                containerRef={containerRef}
                showBackdrop={false}
                useFlexPositioning={false}
            >
                <div className="space-y-4">
                    <GiveawayProgress current={qualifiedCount} total={100} loading={isLoading} />
                    <PlayerList players={currentPlayers} loading={isLoading} onPageChange={setCurrentPage} totalPlayers={totalPlayers} />
                </div>
            </OverlayContainer>
        </div>
    );
};
