'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';
import { fetchRecentWipesFromDB, fetchBattleMetricsServers } from '@/app/actions';

interface BattleMetricsServer {
    id: string;
    attributes: {
        ip: string | null;
        port: number | null;
        name: string | null;
        rank: number | null;
        details: {
            rust_last_wipe: string | null;
        };
        players: number | null;
        maxPlayers: number | null;
    };
}

interface Server {
    id: number;
    attributes: {
        players: number | null;
        maxPlayers: number | null;
        ip: string | null;
        port: number | null;
        name: string | null;
        rank: number | null;
        details: {
            rust_last_wipe: string | null;
        };
    };
    offline: boolean;
}

export default function RecentConfirmedWipesPage() {
    const searchParams = useSearchParams();
    const [serverList, setServerList] = useState<Server[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRefreshActive, setAutoRefreshActive] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        const country = (searchParams.get('country') as string) || 'US';
        const minPlayers = parseInt((searchParams.get('minPlayers') as string) || '0');
        const maxDist = parseInt((searchParams.get('maxDist') as string) || '5000');
        const minRank = parseInt((searchParams.get('minRank') as string) || '0');
        const maxRank = parseInt((searchParams.get('maxRank') as string) || '10000');
        const groupLimit = (searchParams.get('groupLimit') as string) || 'any';
        const resourceRate = (searchParams.get('resourceRate') as string) || 'any';
        const numServers = parseInt((searchParams.get('numServers') as string) || '25');
        const page = parseInt((searchParams.get('page') as string) || '1');

        try {
            const our_db_recent_wipes = await fetchRecentWipesFromDB({
                country,
                minPlayers,
                maxDist,
                minRank,
                maxRank,
                groupLimit,
                resourceRate,
                numServers,
                page,
            });

            const serverIds = our_db_recent_wipes.map((server) => server.id);
            console.log('Fetching server data from BattleMetrics API: ', serverIds.join(','));
            const bm_api_recent_wipes = await fetchBattleMetricsServers(serverIds, numServers);

            const new_server_list = our_db_recent_wipes.map((our_db_recent_wipe_data) => {
                const matched_server_data = bm_api_recent_wipes.find(
                    (bm_api_recent_wipe_data) => parseInt(bm_api_recent_wipe_data.id) === our_db_recent_wipe_data.id,
                );

                if (matched_server_data) {
                    return {
                        ...our_db_recent_wipe_data,
                        attributes: {
                            ...matched_server_data.attributes,
                            players: matched_server_data.attributes.players || null,
                            maxPlayers: matched_server_data.attributes.maxPlayers || null,
                            details: {
                                rust_last_wipe: matched_server_data.attributes.details.rust_last_wipe || null,
                            },
                        },
                        offline: false,
                    };
                } else {
                    return {
                        ...our_db_recent_wipe_data,
                        attributes: {
                            ip: our_db_recent_wipe_data.ip,
                            port: null,
                            name: our_db_recent_wipe_data.title,
                            rank: our_db_recent_wipe_data.rank,
                            players: our_db_recent_wipe_data.players,
                            maxPlayers: null,
                            details: {
                                rust_last_wipe:
                                    our_db_recent_wipe_data.last_wipe instanceof Date
                                        ? our_db_recent_wipe_data.last_wipe.toISOString()
                                        : our_db_recent_wipe_data.last_wipe,
                            },
                        },
                        offline: true,
                    };
                }
            });

            setServerList(new_server_list);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [searchParams]);

    // if autoRefreshActive is true, fetch data every 5 seconds
    useEffect(() => {
        if (autoRefreshActive) {
            const interval = setInterval(() => {
                fetchData();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRefreshActive]);

    return (
        <div className="h-full w-full overflow-hidden">
            <div className="flex h-full w-full flex-col md:flex-row">
                <RecentWipesSidebar
                    searchParams={Object.fromEntries(searchParams.entries())}
                    onRefresh={fetchData}
                    isLoading={isLoading}
                    autoRefreshActive={autoRefreshActive}
                    setAutoRefreshActive={setAutoRefreshActive}
                />
                <RecentWipesTable searchParams={Object.fromEntries(searchParams.entries())} server_list={serverList} />
            </div>
        </div>
    );
}
