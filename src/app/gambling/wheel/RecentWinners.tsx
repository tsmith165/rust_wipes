'use client';

import { useState, useEffect } from 'react';
import { getRecentWinners } from './wheelActions';

interface Winner {
    player_name: string;
    result: string;
    timestamp: string;
}

export default function RecentWinners() {
    const [winners, setWinners] = useState<Winner[]>([]);

    const fetchWinners = async () => {
        try {
            const newWinners = await getRecentWinners();
            setWinners((prevWinners) => {
                // Check if there are any new winners
                const hasNewWinners = newWinners.some(
                    (newWinner) =>
                        !prevWinners.some(
                            (prevWinner) =>
                                prevWinner.player_name === newWinner.player_name &&
                                prevWinner.result === newWinner.result &&
                                prevWinner.timestamp === newWinner.timestamp,
                        ),
                );

                // Only update state if there are new winners
                return hasNewWinners ? newWinners : prevWinners;
            });
        } catch (error) {
            console.error('Error fetching recent winners:', error);
        }
    };

    useEffect(() => {
        fetchWinners(); // Fetch winners immediately on mount

        const interval = setInterval(fetchWinners, 5000); // Then every 5 seconds

        return () => clearInterval(interval); // Clean up on unmount
    }, []);

    return (
        <div className="rounded bg-white p-4 shadow">
            <h2 className="mb-4 text-xl font-bold">Recent Winners</h2>
            <ul>
                {winners.map((winner, index) => (
                    <li key={index} className="mb-2">
                        <span className="font-semibold">{winner.player_name}</span> won {winner.result}
                        {/* Display the timestamp 
                        <br />
                        <small>{new Date(winner.timestamp).toLocaleString()}</small>
                        */}
                    </li>
                ))}
            </ul>
        </div>
    );
}
