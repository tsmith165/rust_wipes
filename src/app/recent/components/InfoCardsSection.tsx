'use client';

import React from 'react';
import { Clock, Filter, Bell, RefreshCw } from 'lucide-react';

interface InfoCard {
    icon: React.ElementType;
    title: string;
    description: string;
}

export default function InfoCardsSection() {
    const infoCards: InfoCard[] = [
        {
            icon: Clock,
            title: 'Track Latest Wipes',
            description:
                'Our tracker constantly monitors Rust servers and shows the most recently wiped ones, helping you find fresh servers to play on.',
        },
        {
            icon: Filter,
            title: 'Advanced Filtering',
            description:
                "Filter servers by minimum players, max distance, rank, group size, and resource rate to find exactly what you're looking for.",
        },
        {
            icon: Bell,
            title: 'Auto-Refresh',
            description: 'Enable auto-refresh to stay updated with the latest server wipes without manually refreshing the page.',
        },
        {
            icon: RefreshCw,
            title: 'Real-time Data',
            description: 'All server data is pulled in real-time from BattleMetrics, ensuring you have the most up-to-date information.',
        },
    ];

    return (
        <section className="bg-stone-800 py-16">
            <div className="container mx-auto px-4">
                <h2 className="mb-12 text-center text-3xl font-bold text-primary">How to Use the Wipe Tracker</h2>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {infoCards.map((card, index) => (
                        <div
                            key={index}
                            className="rounded-lg bg-stone-900 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:transform hover:shadow-xl"
                        >
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary bg-opacity-20">
                                    <card.icon className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <h3 className="mb-3 text-center text-xl font-semibold text-primary">{card.title}</h3>
                            <p className="text-center text-stone-300">{card.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
