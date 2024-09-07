'use client';

import { useState, useEffect } from 'react';
import { getRecentWinners } from './wheelActions';
import { COLOR_CODES, WheelColor } from './wheelConstants';

interface Winner {
    player_name: string;
    result: string;
    timestamp: string;
    color: WheelColor;
}

interface RecentWinnersProps {
    shouldRefetch: boolean;
    onRefetchComplete: () => void;
}

export default function RecentWinners({ shouldRefetch, onRefetchComplete }: RecentWinnersProps) {
    const [winners, setWinners] = useState<Winner[]>([]);

    const fetchWinners = async () => {
        try {
            const newWinners = await getRecentWinners();
            setWinners(newWinners);
        } catch (error) {
            console.error('Error fetching recent winners:', error);
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
        <div className="rounded-lg bg-stone-600 p-4 shadow">
            <h2 className="mb-2 text-lg font-bold">Recent Winners</h2>
            <ul className="space-y-1">
                {winners.map((winner, index) => (
                    <li key={index} className="text-sm">
                        <span className="font-semibold">{winner.player_name}</span> won{' '}
                        <span style={{ color: COLOR_CODES[winner.color] }}>{winner.result}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
