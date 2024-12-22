'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PlayerStats, PlayerStatsHistory } from '@/db/schema';

interface BaseStats {
    steamUsername: string;
    avatarUrl: string;
    id: number;
    steam_id: string;
    server_id: string;
    kills: number;
    deaths: number;
    stone_gathered: number;
    wood_gathered: number;
    metal_ore_gathered: number;
    sulfur_ore_gathered: number;
    scrap_wagered: number;
    scrap_won: number;
}

type ExtendedPlayerStats = (PlayerStats | PlayerStatsHistory) & {
    steamUsername: string;
    avatarUrl: string;
};

interface StatsViewerProps {
    playerStats: ExtendedPlayerStats[];
    initialParams: {
        category: string;
        server: string;
        period: string;
    };
    serverInfo: { id: string; name: string }[];
}

const StatsViewer: React.FC<StatsViewerProps> = ({ playerStats, initialParams, serverInfo }) => {
    const router = useRouter();
    const [searchParams, setSearchParams] = useState(() => {
        const params = new URLSearchParams();
        Object.entries(initialParams).forEach(([key, value]) => {
            params.set(key, value);
        });
        return params;
    });

    const updateSearchParams = (updates: Record<string, string>) => {
        const newSearchParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                newSearchParams.set(key, value);
            } else {
                newSearchParams.delete(key);
            }
        });
        setSearchParams(newSearchParams);
        router.push(`/stats?${newSearchParams.toString()}`);
    };

    const selectedCategory = searchParams.get('category') || 'kills';
    const selectedServer = searchParams.get('server') || serverInfo[0]?.id;
    const selectedPeriod = searchParams.get('period') || 'current';

    const filteredStats = React.useMemo(() => {
        return playerStats.filter((stat) => stat.server_id === selectedServer);
    }, [playerStats, selectedServer]);

    const sortedStats = React.useMemo(() => {
        switch (selectedCategory) {
            case 'kills':
                return [...filteredStats].sort((a, b) => b.kills - a.kills);
            case 'farm':
                return [...filteredStats].sort(
                    (a, b) =>
                        b.stone_gathered +
                        b.wood_gathered +
                        b.metal_ore_gathered -
                        (a.stone_gathered + a.wood_gathered + a.metal_ore_gathered),
                );
            case 'gambling':
                return [...filteredStats].sort((a, b) => b.scrap_wagered - a.scrap_wagered);
            default:
                return filteredStats;
        }
    }, [filteredStats, selectedCategory]);

    const renderStatsRow = (stat: ExtendedPlayerStats, index: number) => {
        const commonCells = (
            <>
                <td className="whitespace-nowrap px-2 py-2 text-center">{index + 1}</td>
                <td className="whitespace-nowrap px-2 py-2">
                    <div className="flex items-center">
                        <Image src={stat.avatarUrl} alt={stat.steamUsername} width={32} height={32} className="mr-2 rounded-full" />
                        <span className="max-w-[80px] overflow-hidden text-clip whitespace-nowrap xs:max-w-fit">{stat.steamUsername}</span>
                    </div>
                </td>
            </>
        );

        switch (selectedCategory) {
            case 'kills':
                return (
                    <tr key={stat.id} className={index % 2 === 0 ? 'bg-stone-800' : 'bg-stone-700'}>
                        {commonCells}
                        <td className="whitespace-nowrap px-2 py-2 text-center">{stat.kills}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-center">{stat.deaths}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-center">{(stat.kills / (stat.deaths || 1)).toFixed(2)}</td>
                    </tr>
                );
            case 'farm':
                return (
                    <tr key={stat.id} className={index % 2 === 0 ? 'bg-stone-800' : 'bg-stone-700'}>
                        {commonCells}
                        <td className="whitespace-nowrap px-2 py-2 text-center">{stat.wood_gathered}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-center">{stat.stone_gathered}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-center">{stat.metal_ore_gathered}</td>
                    </tr>
                );
            case 'gambling':
                return (
                    <tr key={stat.id} className={index % 2 === 0 ? 'bg-stone-800' : 'bg-stone-700'}>
                        {commonCells}
                        <td className="whitespace-nowrap px-2 py-2 text-center">{stat.scrap_wagered}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-center">{stat.scrap_won}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-center">
                            {((stat.scrap_won / (stat.scrap_wagered || 1)) * 100).toFixed(2)}%
                        </td>
                    </tr>
                );
            default:
                return null;
        }
    };

    return (
        <div className="radial-gradient-stone-950 flex h-full w-full flex-col items-center bg-primary p-4">
            <div className="flex w-full max-w-4xl flex-col items-center justify-center space-y-4">
                <div className="flex w-full flex-col justify-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <select
                        className="w-full rounded-md bg-stone-800 px-4 py-2 text-stone-300 sm:w-auto"
                        value={selectedServer}
                        onChange={(e) => updateSearchParams({ server: e.target.value })}
                    >
                        {serverInfo.map((server) => (
                            <option key={server.id} value={server.id}>
                                {server.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="w-full rounded-md bg-stone-800 px-4 py-2 text-stone-300 sm:w-auto"
                        value={selectedPeriod}
                        onChange={(e) => updateSearchParams({ period: e.target.value })}
                    >
                        <option value="current">Current Wipe</option>
                        <option value="history">Stats History</option>
                    </select>
                </div>
                <div className="flex flex-wrap justify-center space-x-2">
                    {['kills', 'farm', 'gambling'].map((category) => (
                        <div
                            key={category}
                            className={`m-1 cursor-pointer rounded-3xl px-4 py-2 ${
                                selectedCategory === category
                                    ? 'bg-gradient-to-b from-primary_light to-primary_dark text-stone-300'
                                    : 'bg-gradient-to-t from-stone-300 to-stone-500 text-stone-950 hover:!bg-gradient-to-b hover:!from-primary_light hover:!to-primary_dark hover:text-stone-300'
                            }`}
                            onClick={() => updateSearchParams({ category })}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full overflow-x-auto pt-4 sm:w-4/5 md:w-3/5">
                <motion.div
                    className="inline-block min-w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <table className="w-full border-collapse rounded-lg">
                        <thead>
                            <tr className="bg-stone-900 text-stone-300">
                                <th className="whitespace-nowrap px-2 py-2">Rank</th>
                                <th className="whitespace-nowrap px-2 py-2 text-left">Player</th>
                                {selectedCategory === 'kills' && (
                                    <>
                                        <th className="whitespace-nowrap px-2 py-2">Kills</th>
                                        <th className="whitespace-nowrap px-2 py-2">Deaths</th>
                                        <th className="whitespace-nowrap px-2 py-2">KDR</th>
                                    </>
                                )}
                                {selectedCategory === 'farm' && (
                                    <>
                                        <th className="whitespace-nowrap px-2 py-2">Wood</th>
                                        <th className="whitespace-nowrap px-2 py-2">Stone</th>
                                        <th className="whitespace-nowrap px-2 py-2">Metal</th>
                                    </>
                                )}
                                {selectedCategory === 'gambling' && (
                                    <>
                                        <th className="whitespace-nowrap px-2 py-2">Wagered</th>
                                        <th className="whitespace-nowrap px-2 py-2">Won</th>
                                        <th className="whitespace-nowrap px-2 py-2">Win %</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="text-stone-300">{sortedStats.map((stat, index) => renderStatsRow(stat, index))}</tbody>
                    </table>
                </motion.div>
            </div>
        </div>
    );
};

export default StatsViewer;
