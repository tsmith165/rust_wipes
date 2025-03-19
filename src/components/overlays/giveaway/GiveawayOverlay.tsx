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

export const GiveawayOverlay: React.FC<GiveawayOverlayProps> = ({ isOpen, onClose, className }) => {
    const {
        fetchQualifiedCount,
        fetchAllTopPlayers,
        currentPage,
        playersByPage,
        qualifiedCount,
        totalPlayers,
        isLoading,
        setCurrentPage,
        allTopPlayers,
    } = useGiveawayStore();

    useEffect(() => {
        if (isOpen) {
            // Fetch all data at once
            fetchQualifiedCount();
            fetchAllTopPlayers();

            // Set up refresh interval
            const interval = setInterval(
                () => {
                    // Only refresh qualified count occasionally
                    if (Math.random() < 0.2) {
                        fetchQualifiedCount();
                    }
                },
                5 * 60 * 1000,
            );

            return () => clearInterval(interval);
        }
    }, [isOpen, fetchQualifiedCount, fetchAllTopPlayers]);

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

    // If not open, don't render anything
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '60px', // Position below navbar
                right: '20px', // Position at right with padding
                zIndex: 40, // Lower than MenuOverlay's z-index (50)
                width: '18rem', // Width similar to w-72
                maxWidth: '95vw', // Ensure it doesn't overflow on small screens
            }}
            className={`${className} pointer-events-auto`}
        >
            <div className="w-full rounded-3xl border border-stone-700/30 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 shadow-2xl shadow-stone-900/50">
                <div className="flex h-full flex-col gap-4 p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-primary_light">Kit Giveaway!</h2>
                            {subtitle}
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="ml-2 rounded-full p-1 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <GiveawayProgress current={qualifiedCount} total={100} loading={isLoading} />
                        <PlayerList
                            players={currentPlayers}
                            loading={isLoading}
                            onPageChange={setCurrentPage}
                            totalPlayers={totalPlayers}
                            currentPage={currentPage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
