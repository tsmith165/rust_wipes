'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';
import { getRecentWipesData } from '@/app/actions';

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

    const fetchData = async (forceRefresh: boolean = false) => {
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
            const combinedData = await getRecentWipesData({
                country,
                minPlayers,
                maxDist,
                minRank,
                maxRank,
                groupLimit,
                resourceRate,
                numServers,
                page,
                forceRefresh,
            });

            setServerList(combinedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [searchParams]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (autoRefreshActive) {
            intervalId = setInterval(() => {
                fetchData(true); // Force refresh when auto-refresh is active
            }, 5000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [autoRefreshActive]);

    const handleRefresh = () => {
        fetchData(true); // Force refresh for manual refresh
    };

    return (
        <div className="h-full w-full overflow-hidden">
            <div className="flex h-full w-full flex-col md:flex-row">
                <RecentWipesSidebar
                    searchParams={Object.fromEntries(searchParams.entries())}
                    onRefresh={handleRefresh}
                    isLoading={isLoading}
                    autoRefreshActive={autoRefreshActive}
                    setAutoRefreshActive={setAutoRefreshActive}
                />
                <RecentWipesTable searchParams={Object.fromEntries(searchParams.entries())} server_list={serverList} />
            </div>
        </div>
    );
}
