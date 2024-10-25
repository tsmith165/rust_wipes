'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';
import { getRecentWipesData } from '@/app/actions';
import { DEFAULT_PARAMS } from './constants';

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

interface RecentConfirmedWipesPageProps {
    initialSearchParams: {
        country?: string;
        minPlayers?: string;
        maxDist?: string;
        minRank?: string;
        maxRank?: string;
        groupLimit?: string;
        resourceRate?: string;
        numServers?: string;
        page?: string;
    };
}

export default function RecentConfirmedWipesPage({ initialSearchParams }: RecentConfirmedWipesPageProps) {
    const router = useRouter();

    // Initialize searchParams using the initialSearchParams and DEFAULT_PARAMS
    const [searchParams, setSearchParams] = useState(() => {
        const params = new URLSearchParams();

        // Use initialSearchParams with fallback to DEFAULT_PARAMS
        Object.entries(DEFAULT_PARAMS).forEach(([key, defaultValue]) => {
            const value = initialSearchParams[key as keyof typeof initialSearchParams] ?? defaultValue;
            params.set(key, String(value));
        });

        return params;
    });

    const [serverList, setServerList] = useState<Server[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRefreshActive, setAutoRefreshActive] = useState(true);

    const searchParamsObject = useMemo(() => {
        const obj: { [key: string]: string } = {};
        searchParams.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }, [searchParams]);

    const fetchData = async (forceRefresh: boolean = false) => {
        setIsLoading(true);
        const country = searchParams.get('country') || 'US';
        const minPlayers = parseInt(searchParams.get('minPlayers') || '0');
        const maxDist = parseInt(searchParams.get('maxDist') || '5000');
        const minRank = parseInt(searchParams.get('minRank') || '0');
        const maxRank = parseInt(searchParams.get('maxRank') || '10000');
        const groupLimit = searchParams.get('groupLimit') || 'any';
        const resourceRate = searchParams.get('resourceRate') || 'any';
        const numServers = parseInt(searchParams.get('numServers') || '25');
        const page = parseInt(searchParams.get('page') || '1');

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
        router.push(`/recent?${newSearchParams.toString()}`);
    };

    useEffect(() => {
        fetchData();
    }, [searchParams]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (autoRefreshActive) {
            intervalId = setInterval(() => {
                fetchData(true);
            }, 5000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [autoRefreshActive]);

    const handleRefresh = () => {
        fetchData(true);
    };

    return (
        <div className="h-full w-full overflow-hidden">
            <div className="flex h-full w-full flex-col md:flex-row">
                <RecentWipesSidebar
                    searchParams={searchParamsObject}
                    onRefresh={handleRefresh}
                    isLoading={isLoading}
                    autoRefreshActive={autoRefreshActive}
                    setAutoRefreshActive={setAutoRefreshActive}
                    onUpdateSearchParams={updateSearchParams}
                />
                <RecentWipesTable searchParams={searchParamsObject} server_list={serverList} onUpdateSearchParams={updateSearchParams} />
            </div>
        </div>
    );
}
