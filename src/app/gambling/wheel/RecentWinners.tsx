'use client';

import { useState, useEffect } from 'react';
import { getRecentWinners } from './wheelActions';
import { COLOR_CODES, WheelColor } from './wheelConstants';
import Image from 'next/image';

interface Winner {
    player_name: string;
    result: string;
    timestamp: string;
    color: WheelColor;
    profile_picture_url: string | null;
}

interface RecentWinnersProps {
    shouldRefetch: boolean;
    onRefetchComplete: () => void;
}

export default function RecentWinners({ shouldRefetch, onRefetchComplete }: RecentWinnersProps) {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [error, setError] = useState<string | null>(null); // **Added: Error state**

    const fetchWinners = async () => {
        try {
            const response = await getRecentWinners();
            if (response.success) {
                if (!response.data) {
                    setError('Failed to fetch recent winners.');
                    return;
                }
                setWinners(response.data);
                setError(null);
            } else {
                setError(response.error || 'Failed to fetch recent winners.');
            }
        } catch (error) {
            console.error('Error fetching recent winners:', error);
            setError('An unexpected error occurred.');
        }
    };

    useEffect(() => {
        fetchWinners();
        const interval = setInterval(fetchWinners, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (shouldRefetch) {
            fetchWinners();
            onRefetchComplete();
        }
    }, [shouldRefetch, onRefetchComplete]);

    return (
        <div className="h-fit rounded-lg bg-stone-600 p-4 pt-0 shadow">
            <h2 className="mb-2 text-lg font-bold">Recent Winners</h2>
            {error && <p className="text-red-500">{error}</p>} {/* **Added: Display error message** */}
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
                            <span className="font-semibold">{winner.player_name}</span> won{' '}
                            <span style={{ color: COLOR_CODES[winner.color] }}>{winner.result}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
