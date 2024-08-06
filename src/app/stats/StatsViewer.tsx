// File: /src/app/stats/StatsViewer.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { PlayerStats } from '@/db/schema';

interface StatsViewerProps {
    playerStats: PlayerStats[];
    initialSelectedCategory: string;
}

const StatsViewer: React.FC<StatsViewerProps> = ({ playerStats, initialSelectedCategory }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('category', category);
        router.push(`/stats?${newSearchParams.toString()}`);
    };

    const sortedStats = useMemo(() => {
        switch (selectedCategory) {
            case 'kills':
                return [...playerStats].sort((a, b) => b.kills - a.kills);
            case 'farm':
                return [...playerStats].sort(
                    (a, b) =>
                        b.stone_gathered +
                        b.wood_gathered +
                        b.metal_ore_gathered -
                        (a.stone_gathered + a.wood_gathered + a.metal_ore_gathered),
                );
            case 'gambling':
                return [...playerStats].sort((a, b) => b.scrap_wagered - a.scrap_wagered);
            default:
                return playerStats;
        }
    }, [playerStats, selectedCategory]);

    const renderStatsRow = (stat: PlayerStats, index: number) => {
        switch (selectedCategory) {
            case 'kills':
                return (
                    <tr key={stat.id} className={index % 2 === 0 ? 'bg-stone-800' : 'bg-stone-700'}>
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{stat.steam_id}</td>
                        <td className="px-4 py-2">{stat.kills}</td>
                        <td className="px-4 py-2">{stat.deaths}</td>
                        <td className="px-4 py-2">{(stat.kills / (stat.deaths || 1)).toFixed(2)}</td>
                    </tr>
                );
            case 'farm':
                return (
                    <tr key={stat.id} className={index % 2 === 0 ? 'bg-stone-800' : 'bg-stone-700'}>
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{stat.steam_id}</td>
                        <td className="px-4 py-2">{stat.wood_gathered}</td>
                        <td className="px-4 py-2">{stat.stone_gathered}</td>
                        <td className="px-4 py-2">{stat.metal_ore_gathered}</td>
                    </tr>
                );
            case 'gambling':
                return (
                    <tr key={stat.id} className={index % 2 === 0 ? 'bg-stone-800' : 'bg-stone-700'}>
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{stat.steam_id}</td>
                        <td className="px-4 py-2">{stat.scrap_wagered}</td>
                        <td className="px-4 py-2">{stat.scrap_won}</td>
                        <td className="px-4 py-2">{((stat.scrap_won / (stat.scrap_wagered || 1)) * 100).toFixed(2)}%</td>
                    </tr>
                );
            default:
                return null;
        }
    };

    return (
        <div className="radial-gradient-stone-600 flex h-full w-full flex-col items-center justify-center bg-stone-950">
            <div className="flex justify-center space-x-2 pt-4 xs:space-x-4">
                {['kills', 'farm', 'gambling'].map((category) => (
                    <div
                        key={category}
                        className={`cursor-pointer rounded-3xl px-2 py-1 xs:px-4 xs:py-2 ${
                            selectedCategory === category
                                ? 'bg-gradient-to-b from-primary_light to-primary_dark text-stone-300'
                                : 'bg-gradient-to-t from-stone-300 to-stone-500 text-stone-950 hover:!bg-gradient-to-b hover:!from-primary_light hover:!to-primary_dark hover:text-stone-300'
                        }`}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                ))}
            </div>
            <motion.div
                className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-stone-900 text-stone-300">
                            <th className="px-4 py-2">Rank</th>
                            <th className="px-4 py-2">Player</th>
                            {selectedCategory === 'kills' && (
                                <>
                                    <th className="px-4 py-2">Kills</th>
                                    <th className="px-4 py-2">Deaths</th>
                                    <th className="px-4 py-2">KDR</th>
                                </>
                            )}
                            {selectedCategory === 'farm' && (
                                <>
                                    <th className="px-4 py-2">Wood</th>
                                    <th className="px-4 py-2">Stone</th>
                                    <th className="px-4 py-2">Metal Ore</th>
                                </>
                            )}
                            {selectedCategory === 'gambling' && (
                                <>
                                    <th className="px-4 py-2">Wagered</th>
                                    <th className="px-4 py-2">Winnings</th>
                                    <th className="px-4 py-2">Win Rate</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>{sortedStats.map((stat, index) => renderStatsRow(stat, index))}</tbody>
                </table>
            </motion.div>
        </div>
    );
};

export default StatsViewer;
