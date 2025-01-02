'use client';

import React, { useState } from 'react';
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

export const PlayerList: React.FC<PlayerListProps> = ({ players, loading, onPageChange, totalPlayers }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [currentPlayers, setCurrentPlayers] = useState<Player[]>(players);
    const playersPerPage = 3;
    const totalPages = Math.ceil(totalPlayers / playersPerPage);

    // Update currentPlayers when new players are received and not loading
    React.useEffect(() => {
        if (!loading && players.length > 0) {
            setCurrentPlayers(players);
        }
    }, [players, loading]);

    const handlePrevPage = () => {
        if (loading) return;
        const newPage = currentPage > 0 ? currentPage - 1 : totalPages - 1;
        setCurrentPage(newPage);
        onPageChange?.(newPage);
    };

    const handleNextPage = () => {
        if (loading) return;
        const newPage = currentPage < totalPages - 1 ? currentPage + 1 : 0;
        setCurrentPage(newPage);
        onPageChange?.(newPage);
    };

    if (loading && currentPlayers.length === 0) {
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
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                    >
                        {currentPlayers.map((player, index) => {
                            const rank = currentPage * playersPerPage + index + 1;
                            const hours = Math.floor(player.minutes_played / 60);
                            const minutes = player.minutes_played % 60;

                            return (
                                <motion.div
                                    key={`${player.steam_id}-${rank}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center justify-between rounded-md bg-stone-800/50 p-2 ${
                                        loading ? 'opacity-50' : ''
                                    }`}
                                    onClick={() => window.open(`https://steamcommunity.com/profiles/${player.steam_id}`, '_blank')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="min-w-[2rem] text-stone-400">{getRankEmoji(rank)}</span>
                                        <Image
                                            src={player.profile_picture || '/steam_icon_small.png'}
                                            alt={`${player.player_name}'s profile`}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                        />
                                        <span className="text-stone-200">{player.player_name}</span>
                                    </div>
                                    <span className="text-sm text-stone-400">
                                        {hours}h {minutes}m
                                    </span>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
