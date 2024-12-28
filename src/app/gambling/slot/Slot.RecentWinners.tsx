'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getRecentSlotWinners } from './Slot.Actions';
import { motion, AnimatePresence } from 'framer-motion';

// Map symbols to image paths
const ITEM_ICON_PATHS: Record<string, string> = {
    scrap: '/rust_icons/scrap_icon.png',
    metal_fragments: '/rust_icons/metal_fragments_icon.png',
    high_quality_metal: '/rust_icons/hqm_icon.png',
    'smg.thompson': '/rust_icons/thompson_icon.png',
    'rifle.m39': '/rust_icons/m39_icon.png',
    'rifle.ak': '/rust_icons/ak47_icon.png',
};

interface Winner {
    player_name: string;
    steam_id: string;
    payout: { item: string; full_name: string; quantity: number }[];
    free_spins_won: number;
    bonus_type: string;
    timestamp: string;
    profile_picture_url: string | null;
}

interface Props {
    shouldRefetch: boolean;
    onRefetchComplete: () => void;
    spinning: boolean;
}

export default function RecentSlotWinners({ shouldRefetch, onRefetchComplete, spinning }: Props) {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const response = await getRecentSlotWinners();
                if (response.success && response.data) {
                    setWinners(response.data);
                    setError(null);
                } else {
                    setError(response.error || 'Failed to fetch winners');
                }
            } catch (err) {
                setError('An error occurred while fetching winners');
            }
        };

        // Initial fetch
        fetchWinners();

        // Set up interval for periodic updates
        const interval = setInterval(fetchWinners, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    // Refetch when shouldRefetch is true
    useEffect(() => {
        if (shouldRefetch) {
            const fetchWinners = async () => {
                try {
                    const response = await getRecentSlotWinners();
                    if (response.success && response.data) {
                        setWinners(response.data);
                        setError(null);
                    } else {
                        setError(response.error || 'Failed to fetch winners');
                    }
                    onRefetchComplete();
                } catch (err) {
                    setError('An error occurred while fetching winners');
                    onRefetchComplete();
                }
            };

            fetchWinners();
        }
    }, [shouldRefetch, onRefetchComplete]);

    return (
        <div className="flex h-full flex-col space-y-2">
            <h2 className="text-lg font-bold">Recent Winners</h2>
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {winners.map((winner, index) => (
                        <motion.div
                            key={`${winner.steam_id}-${winner.timestamp}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="mb-2 flex items-start space-x-2 rounded-lg bg-stone-800 p-2"
                        >
                            <Image
                                src={winner.profile_picture_url || '/steam_icon_small.png'}
                                alt="Winner Avatar"
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                            <div className="flex-1">
                                <span className="font-bold">{winner.player_name}</span>
                                <div className="mt-1 space-y-1">
                                    {winner.payout.map((item, i) => (
                                        <div key={i} className="flex items-center space-x-2">
                                            <Image
                                                src={ITEM_ICON_PATHS[item.item] || '/rust_icons/scrap_icon.png'}
                                                alt={item.full_name}
                                                width={24}
                                                height={24}
                                            />
                                            <span className="text-sm">
                                                {item.quantity}x {item.full_name}
                                            </span>
                                        </div>
                                    ))}
                                    {winner.free_spins_won > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <Image src="/rust_icons/bonus_symbol.png" alt="Bonus Spins" width={24} height={24} />
                                            <span className="text-sm text-yellow-400">
                                                {winner.free_spins_won}x {winner.bonus_type === 'sticky' ? 'Sticky' : 'Normal'} Free Spins
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
