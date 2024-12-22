'use client';

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PlayerCountPanelProps {
    player_count_data: Array<{
        timestamp: string;
        players: number;
    }>;
}

const PlayerCountPanel: React.FC<PlayerCountPanelProps> = ({ player_count_data }) => {
    const formatTimestampForName = (timestamp: string) => {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(date);
    };

    const labels = player_count_data.map((item) => formatTimestampForName(item.timestamp));
    const playerCounts = player_count_data.map((item) => item.players);

    const data = {
        labels,
        datasets: [
            {
                label: 'Players',
                data: playerCounts,
                borderColor: 'rgb(130, 202, 157)',
                backgroundColor: 'rgba(130, 202, 157, 0.5)',
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-stone-800 p-2.5">
            <h3 className="mb-2 text-xl font-bold text-primary_light">Player Count History</h3>
            <div className="relative h-[350px] w-full">
                <Line options={options} data={data} />
            </div>
        </div>
    );
};

export default PlayerCountPanel;
