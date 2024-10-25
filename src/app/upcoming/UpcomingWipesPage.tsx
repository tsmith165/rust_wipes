'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UpcomingWipesSidebar from './UpcomingWipesSidebar';
import UpcomingServerHourGroup from './UpcomingServerHourGroup';
import { fetchFilteredServers } from '@/app/upcoming/actions';
import { DEFAULT_PARAMS } from './constants';

interface ServerData {
    id: number;
    rank: number;
    title: string;
    wipe_hour: number;
    last_wipe: string;
    next_wipe: string;
    is_full_wipe: boolean;
}

interface GroupedWipeDict {
    [key: number]: ServerData[];
}

interface UpcomingWipesPageProps {
    initialSearchParams: {
        region?: string;
        resource_rate?: string;
        group_limit?: string;
        game_mode?: string;
        min_rank?: string;
        time_zone?: string;
        date?: string;
    };
}

export default function UpcomingWipesPage({ initialSearchParams }: UpcomingWipesPageProps) {
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

    const [serverList, setServerList] = useState<GroupedWipeDict>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServers = async () => {
            try {
                setLoading(true);
                const paramsObj = Object.fromEntries(searchParams.entries());
                const servers = await fetchFilteredServers(paramsObj);
                setServerList(servers);
                setError(null);
            } catch (error) {
                console.error('Error fetching servers:', error);
                setServerList({});
                setError('An error occurred while fetching server data. Please try again later.');
            }
            setLoading(false);
        };

        fetchServers();
    }, [searchParams]);

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
        router.push(`/upcoming?${newSearchParams.toString()}`);
    };

    const serversJsxArray = Object.entries(serverList)
        .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
        .map(([wipeHour, servers]) => <UpcomingServerHourGroup key={wipeHour} wipe_dict={servers} wipe_hour={parseInt(wipeHour)} />);

    return (
        <div className="h-full w-full overflow-hidden">
            <div className="flex h-full w-full flex-col md:flex-row">
                <div className="h-fit w-full bg-stone-800 md:h-full md:w-[35%] md:min-w-[35%] md:max-w-[35%]">
                    <UpcomingWipesSidebar
                        searchParams={Object.fromEntries(searchParams.entries())}
                        onUpdateSearchParams={updateSearchParams}
                    />
                </div>
                <div className="h-full min-w-full flex-grow overflow-y-auto bg-stone-400 md:w-[65%] md:min-w-[65%]">
                    {error ? (
                        <div className="p-2 text-red-500">{error}</div>
                    ) : loading ? (
                        <div className="p-2 text-stone-950"></div>
                    ) : serversJsxArray.length > 0 ? (
                        serversJsxArray
                    ) : (
                        <div className="p-2 text-stone-950">No servers found for the selected filters.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
