'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getRecentWinners } from '@/app/games/wheel/Wheel.Actions';
import { COLOR_CODES, ITEM_IMAGE_PATHS, WheelPayout } from '@/app/games/wheel/Wheel.Constants';
import type { WinnerWithPictures } from '@/app/games/wheel/Wheel.Actions';

interface WheelRecentWinnersProps {
    shouldRefetch: boolean;
    onRefetchComplete: () => void;
    className?: string;
}

// Add helper function at the top with other utility functions
const getItemImagePath = (fullName: string): string => {
    return ITEM_IMAGE_PATHS[fullName as WheelPayout] || '/rust_icons/scrap_icon.png';
};

// Add helper to check if win is too recent
const isTooRecent = (timestamp: string): boolean => {
    const winTime = new Date(timestamp).getTime();
    const now = new Date().getTime();
    return now - winTime < 5000; // 5 seconds in milliseconds
};

/**
 * Recent winners component for the wheel.
 * Displays recent winning spins with animations and Steam profile integration.
 */
export function WheelRecentWinners({ shouldRefetch, onRefetchComplete }: WheelRecentWinnersProps) {
    const [winners, setWinners] = useState<WinnerWithPictures[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchWinners = async () => {
        setIsLoading(true);
        try {
            const response = await getRecentWinners();
            if (response.success && response.data) {
                // Filter out any wins that are too recent
                const currentWinners = response.data;
                const [, older] = currentWinners.reduce<[WinnerWithPictures[], WinnerWithPictures[]]>(
                    (acc, winner) => {
                        if (isTooRecent(winner.timestamp)) {
                            acc[0].push(winner);
                        } else {
                            acc[1].push(winner);
                        }
                        return acc;
                    },
                    [[], []],
                );

                // Show only older wins
                setWinners(older);
                setError(null);
            } else {
                setError(response.error || 'Failed to fetch winners');
            }
        } catch (err) {
            console.error('Error fetching winners:', err);
            setError('An error occurred while fetching winners');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch and periodic updates
    useEffect(() => {
        fetchWinners();
        const interval = setInterval(() => {
            fetchWinners();
        }, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, []);

    // Refetch when requested
    useEffect(() => {
        if (shouldRefetch) {
            fetchWinners().then(onRefetchComplete);
        }
    }, [shouldRefetch, onRefetchComplete]);

    return (
        <div className="flex h-full flex-col space-y-2">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Recent Winners</h2>
                <motion.button
                    onClick={() => !isLoading && fetchWinners()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full p-2 text-st_white transition-colors hover:bg-stone-700 ${
                        isLoading ? 'cursor-wait opacity-50' : ''
                    }`}
                    disabled={isLoading}
                >
                    <svg className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                </motion.button>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-500 bg-opacity-10 p-3 text-sm text-red-500"
                >
                    {error}
                </motion.div>
            )}

            <div className="flex-1 space-y-4 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {isLoading && winners.length === 0 ? (
                        // Loading placeholders
                        Array.from({ length: 3 }).map((_, index) => (
                            <motion.div
                                key={`placeholder-${index}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="animate-pulse rounded-lg bg-stone-800 p-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="h-8 w-8 rounded-full bg-stone-600" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/4 rounded bg-stone-600" />
                                        <div className="h-3 w-1/3 rounded bg-stone-600" />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : winners.length > 0 ? (
                        winners.map((winner) => (
                            <motion.div
                                key={`${winner.steam_id}-${winner.timestamp}`}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="rounded-lg bg-stone-800 p-4 shadow-lg"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Image
                                            src={winner.profile_picture_url || '/steam_icon_small.png'}
                                            alt={`${winner.player_name}'s profile`}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <span
                                                className="cursor-pointer font-bold hover:text-primary"
                                                onClick={() =>
                                                    window.open(`https://steamcommunity.com/profiles/${winner.steam_id}`, '_blank')
                                                }
                                            >
                                                {winner.player_name}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <Image
                                                    src={getItemImagePath(winner.payout[0].full_name)}
                                                    alt={winner.payout[0].full_name}
                                                    width={24}
                                                    height={24}
                                                />
                                                <span className="text-sm" style={{ color: COLOR_CODES[winner.color] }}>
                                                    {winner.payout[0].full_name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(winner.timestamp).toLocaleString()}</span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex h-full items-center justify-center text-gray-400"
                        >
                            No recent winners
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
