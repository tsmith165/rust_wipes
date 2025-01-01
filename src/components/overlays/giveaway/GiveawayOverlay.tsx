'use client';

import React, { useEffect } from 'react';
import { OverlayContainer } from '../Overlay.Container';
import { GiveawayProgress } from './GiveawayProgress';
import { PlayerList } from './PlayerList';
import Link from 'next/link';
import { useGiveawayStore } from '@/stores/giveaway_store';

interface GiveawayOverlayProps {
    isOpen: boolean;
    onClose?: () => void;
    position?: 'top-right' | 'top' | 'top-left' | 'middle-right' | 'middle' | 'middle-left' | 'bottom-left' | 'bottom' | 'bottom-right';
    className?: string;
}

export const GiveawayOverlay: React.FC<GiveawayOverlayProps> = ({ isOpen, onClose, position = 'middle-right', className }) => {
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
        <span>
            First 100 players with 10 hours of playtime on any of our servers get a free{' '}
            <Link href="/kits?type=monthly&kit=4" className="text-primary_light underline transition-colors hover:text-primary">
                Captain Kit
            </Link>
            !
        </span>
    );

    const currentPlayers = playersByPage.get(currentPage) ?? [];

    return (
        <div className={`relative ${className}`}>
            <OverlayContainer
                isOpen={isOpen}
                onClose={onClose}
                title={<span className="text-primary_light">Kit Giveaway!</span>}
                subtitle={subtitle}
                format="pill"
                position={position}
                width="w-72"
                showBackground={false}
                isRelative={true}
                className="bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 shadow-2xl shadow-stone-900/50"
            >
                <div className="space-y-4">
                    <GiveawayProgress current={qualifiedCount} total={100} loading={isLoading} />
                    <PlayerList players={currentPlayers} loading={isLoading} onPageChange={setCurrentPage} totalPlayers={totalPlayers} />
                </div>
            </OverlayContainer>
        </div>
    );
};
