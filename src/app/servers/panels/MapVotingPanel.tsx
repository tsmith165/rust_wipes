'use client';

import { MapOptions, MapVotes } from '@/db/schema';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    ChartOptions,
    ChartEvent,
    ActiveElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

interface MapVotingPanelProps {
    mapOptions: MapOptions[];
    mapVotes: MapVotes[];
}

export function MapVotingPanel({ mapOptions, mapVotes }: MapVotingPanelProps) {
    const chartData = {
        labels: mapOptions.map((option) => option.map_name.split('-')[1]),
        datasets: [
            {
                label: 'Votes',
                data: mapOptions.map((option) => mapVotes.filter((vote) => vote.map_id === option.id).length),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: '#D1D5DB',
                },
            },
            x: {
                ticks: {
                    color: '#D1D5DB',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return `Votes: ${context.raw}`;
                    },
                },
            },
        },
        onClick: (event: ChartEvent, elements: ActiveElement[], chart: ChartJS) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                if (index !== undefined && mapOptions[index]) {
                    window.open(mapOptions[index].rust_maps_url, '_blank');
                }
            } else {
                // Check if a label was clicked
                const points = chart.getElementsAtEventForMode(event.native as Event, 'nearest', { intersect: true }, true);
                if (points.length) {
                    const firstPoint = points[0];
                    const label = chart.data.labels?.[firstPoint.index];
                    const clickedMapOption = mapOptions.find((option) => option.map_name.split('-')[1] === label);
                    if (clickedMapOption) {
                        window.open(clickedMapOption.rust_maps_url, '_blank');
                    }
                }
            }
        },
    };

    return (
        <div className="flex h-full flex-col">
            <h3 className="mb-2 text-center text-lg font-semibold text-stone-300">Map Voting</h3>
            <div className="h-[184px] max-h-[184px]">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}
