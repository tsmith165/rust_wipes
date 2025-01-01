'use client';

import React, { useEffect, useState } from 'react';
import { OverlayContainer } from '../Overlay.Container';
import { GiveawayProgress } from './GiveawayProgress';
import { PlayerList } from './PlayerList';
import { getGiveawayData, type GiveawayData } from '@/actions/Giveaway.Actions';
import Link from 'next/link';

interface GiveawayOverlayProps {
    isOpen: boolean;
    onClose?: () => void;
    position?: 'top-right' | 'top' | 'top-left' | 'middle-right' | 'middle' | 'middle-left' | 'bottom-left' | 'bottom' | 'bottom-right';
    className?: string;
}

export const GiveawayOverlay: React.FC<GiveawayOverlayProps> = ({ isOpen, onClose, position = 'middle-right', className }) => {
    const [data, setData] = useState<GiveawayData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchData = async (page: number = 0) => {
        try {
            const result = await getGiveawayData(page);
            setData(result);
        } catch (error) {
            console.error('Failed to fetch giveaway data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData(currentPage);
            // Refresh data every 5 minutes
            const interval = setInterval(() => fetchData(currentPage), 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [isOpen, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const subtitle = (
        <span>
            First 100 players to play on any of our servers get a free{' '}
            <Link href="/kits?type=monthly&kit=4" className="text-primary_light underline transition-colors hover:text-primary">
                Captain Kit
            </Link>
            !
        </span>
    );

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
                    <GiveawayProgress current={data?.qualifiedCount ?? 0} total={100} loading={loading} />
                    <PlayerList
                        players={data?.topPlayers ?? []}
                        loading={loading}
                        onPageChange={handlePageChange}
                        totalPlayers={data?.totalPlayers ?? 0}
                    />
                </div>
            </OverlayContainer>
        </div>
    );
};
