'use client';

import { useState, useEffect } from 'react';
import { getRecentSlotWinners } from './slotMachineActions';
import Image from 'next/image';

interface PayoutItem {
    item: string;
    full_name: string;
    quantity: number;
}

interface Winner {
    player_name: string;
    payout: PayoutItem[];
    timestamp: string;
    profile_picture_url: string | null;
    free_spins_won: number; // Added property
}

interface RecentWinnersProps {
    shouldRefetch: boolean;
    onRefetchComplete: () => void;
    spinning: boolean; // Add spinning prop
}

const ITEM_ICON_PATHS: Record<string, string> = {
    scrap: '/rust_icons/scrap_icon.png',
    metal_fragments: '/rust_icons/metal_fragments_icon.png',
    high_quality_metal: '/rust_icons/hqm_icon.png',
    'pistol.semiauto': '/rust_icons/p2_icon.png',
    'pistol.m92': '/rust_icons/m92_icon.png',
    'smg.thompson': '/rust_icons/thompson_icon.png',
    'rifle.m39': '/rust_icons/m39_icon.png',
    'rifle.ak': '/rust_icons/ak47_icon.png',
    free_spin: '/rust_icons/bonus_symbol.png',
};

export default function RecentSlotWinners({ shouldRefetch, onRefetchComplete, spinning }: RecentWinnersProps) {
    const [winners, setWinners] = useState<Winner[]>([]);

    const fetchWinners = async () => {
        console.log('Fetching recent slot winners...');
        try {
            const fetchedWinners = await getRecentSlotWinners();

            if (!fetchedWinners.success) {
                console.error('Error fetching recent slot winners:', fetchedWinners.error);
                return;
            }

            if (!fetchedWinners.data) {
                console.error('No winners found');
                return;
            }

            const updatedWinners = fetchedWinners.data.map((winner) => {
                if (winner.free_spins_won > 0) {
                    return {
                        ...winner,
                        payout: [
                            ...winner.payout,
                            {
                                item: 'free_spin',
                                full_name: 'Bonus',
                                quantity: winner.free_spins_won,
                            },
                        ],
                    };
                }
                return winner;
            });

            setWinners(updatedWinners);
        } catch (error) {
            console.error('Error fetching recent winners:', error);
        }
    };

    useEffect(() => {
        if (!spinning) {
            fetchWinners();
        }

        const interval = setInterval(() => {
            if (!spinning) {
                // Only fetch if not spinning
                fetchWinners();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [spinning]);

    useEffect(() => {
        if (shouldRefetch && !spinning) {
            // Only refetch if not spinning
            fetchWinners();
            onRefetchComplete();
        }
    }, [shouldRefetch, onRefetchComplete, spinning]);

    return (
        <div className="rounded-lg bg-stone-600 p-4 shadow">
            <h2 className="mb-2 text-lg font-bold">Recent Winners</h2>
            <ul className="space-y-2">
                {winners.map((winner, index) => (
                    <li key={index} className="flex items-center text-sm">
                        {winner.profile_picture_url ? (
                            <Image
                                src={winner.profile_picture_url}
                                alt={`${winner.player_name}'s profile`}
                                width={32}
                                height={32}
                                className="mr-2 rounded-full"
                            />
                        ) : (
                            <div className="mr-2 h-8 w-8 rounded-full bg-gray-300"></div>
                        )}
                        <div>
                            <span className="font-semibold">{winner.player_name}</span> won:
                            <ul className="ml-4 list-disc">
                                {winner.payout.map((item, idx) => (
                                    <li key={idx} className="flex items-center">
                                        <Image
                                            src={ITEM_ICON_PATHS[item.item] || '/rust_icons/scrap_icon.png'}
                                            alt={item.full_name}
                                            width={24}
                                            height={24}
                                            className="mr-2"
                                        />
                                        {item.quantity}x {item.full_name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
