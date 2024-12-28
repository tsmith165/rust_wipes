'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getRecentSlotWinners } from './Slot.Actions';
import { DB_IMAGE_PATHS } from './Slot.Constants';

interface WinnerWithPictures {
    player_name: string;
    steam_id: string;
    payout: { item: string; full_name: string; quantity: number }[];
    free_spins_won: number;
    bonus_type: string;
    timestamp: string;
    profile_picture_url: string | null;
}

interface RecentSlotWinnersProps {
    spinning: boolean;
}

export default function RecentSlotWinners({ spinning }: RecentSlotWinnersProps) {
    const [winners, setWinners] = useState<WinnerWithPictures[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWinners = async () => {
        try {
            const response = await getRecentSlotWinners();
            if (response.success && response.data) {
                setWinners(response.data);
                setError(null);
            } else {
                setError(response.error || 'Failed to fetch winners');
            }
        } catch (error) {
            console.error('Error fetching winners:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWinners();
        const interval = setInterval(fetchWinners, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!spinning) {
            fetchWinners();
        }
    }, [spinning]);

    if (isLoading) {
        return <div className="h-full w-full animate-pulse bg-gray-800" />;
    }

    const getImagePath = (item: string) => {
        const path = DB_IMAGE_PATHS[item as keyof typeof DB_IMAGE_PATHS];
        if (!path) {
            console.warn(`No image path found for item: ${item}`);
            return DB_IMAGE_PATHS.scrap; // Default fallback
        }
        return path;
    };

    return (
        <div className="h-full w-full p-4">
            <h1 className="mb-2 text-center text-lg font-bold">Recent Winners</h1>
            {error && <p className="text-red-500">{error}</p>}
            <ul className="flex flex-col space-y-2 md:w-3/4 mx-auto">
                {winners.map((winner, index) => (
                    <li key={index} className="rounded-lg bg-stone-300 p-2">
                        <div className="flex items-center">
                            {winner.profile_picture_url ? (
                                <Image
                                    src={winner.profile_picture_url}
                                    alt={`${winner.player_name}'s profile`}
                                    width={32}
                                    height={32}
                                    className="mr-2 rounded-full"
                                />
                            ) : (
                                <div className="mr-2 h-8 w-8 rounded-full bg-gray-300" />
                            )}
                            <span className="font-semibold text-stone-800">{winner.player_name}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 pl-10">
                            {winner.payout.map((item, payoutIndex) => (
                                <div key={payoutIndex} className="flex items-center">
                                    <Image src={getImagePath(item.item)} alt={item.full_name} width={24} height={24} className="mr-1" />
                                    <span className="text-stone-800">x{item.quantity}</span>
                                </div>
                            ))}
                            {winner.free_spins_won > 0 && (
                                <div className="flex items-center">
                                    <Image src={DB_IMAGE_PATHS.bonus} alt="Free Spins" width={24} height={24} className="mr-1" />
                                    <span className="text-stone-800">
                                        {winner.free_spins_won} {winner.bonus_type} spins
                                    </span>
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
