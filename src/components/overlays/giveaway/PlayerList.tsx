'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Player {
    player_name: string;
    minutes_played: number;
    steam_id: string;
    profile_picture?: string | null;
}

interface PlayerListProps {
    players: Player[];
    loading?: boolean;
    onPageChange?: (page: number) => void;
    totalPlayers: number;
    currentPage?: number;
}

const getRankEmoji = (rank: number) => {
    switch (rank) {
        case 1:
            return '🥇';
        case 2:
            return '🥈';
        case 3:
            return '🥉';
        default:
            return `#${rank}`;
    }
};

export const PlayerList: React.FC<PlayerListProps> = ({ players, loading, onPageChange, totalPlayers, currentPage = 0 }) => {
    const [localPlayers, setLocalPlayers] = useState<Player[]>(players);
    const playersPerPage = 3;

    // Calculate total pages - use 10 as a fixed number of pages
    const maxPossiblePages = 10;
    const totalPages = Math.min(maxPossiblePages, Math.ceil(totalPlayers / playersPerPage));

    // Keep track of the current page for rank calculations
    const pageRef = useRef(currentPage);

    // Update pageRef when currentPage changes
    useEffect(() => {
        pageRef.current = currentPage;
    }, [currentPage]);

    // Update localPlayers when new players are received
    useEffect(() => {
        if (!loading && players.length > 0) {
            setLocalPlayers(players);
        }
    }, [players, loading]);

    const handlePrevPage = () => {
        if (loading) return;
        const newPage = currentPage > 0 ? currentPage - 1 : totalPages - 1;
        onPageChange?.(newPage);
    };

    const handleNextPage = () => {
        if (loading) return;
        const newPage = currentPage < totalPages - 1 ? currentPage + 1 : 0;
        onPageChange?.(newPage);
    };

    if (loading && localPlayers.length === 0) {
        return (
            <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-md bg-stone-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-stone-400">
                <button
                    onClick={handlePrevPage}
                    className="p-1 transition-colors hover:text-stone-200 disabled:opacity-50"
                    disabled={loading || totalPlayers <= playersPerPage}
                >
                    ←
                </button>
                <span>Top Players</span>
                <button
                    onClick={handleNextPage}
                    className="p-1 transition-colors hover:text-stone-200 disabled:opacity-50"
                    disabled={loading || totalPlayers <= playersPerPage}
                >
                    →
                </button>
            </div>
            <div className="space-y-2">
                {localPlayers.map((player, index) => {
                    // Calculate rank based on current page from store and index
                    const rank = pageRef.current * playersPerPage + index + 1;
                    const hours = Math.floor(player.minutes_played / 60);
                    const minutes = player.minutes_played % 60;

                    return (
                        <motion.div
                            key={`${player.steam_id}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex w-full items-center justify-between overflow-hidden rounded-md bg-stone-800/50 p-2 ${
                                loading ? 'opacity-50' : ''
                            }`}
                            onClick={() => window.open(`https://steamcommunity.com/profiles/${player.steam_id}`, '_blank')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                                <span className="min-w-[2rem] flex-shrink-0 text-stone-400">{getRankEmoji(rank)}</span>
                                <Image
                                    src={player.profile_picture || '/steam_icon_small.png'}
                                    alt={`${player.player_name}'s profile`}
                                    width={24}
                                    height={24}
                                    className="flex-shrink-0 rounded-full"
                                />
                                <span className="truncate text-stone-200" title={player.player_name}>
                                    {player.player_name}
                                </span>
                            </div>
                            <span className="ml-2 flex-shrink-0 whitespace-nowrap text-sm text-stone-400">
                                {hours}h {minutes}m
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Page indicator */}
            <div className="text-st mt-1 text-center text-xs">
                Page {currentPage + 1} of {totalPages}
            </div>
        </div>
    );
};
