'use client';

import React, { useEffect, useState } from 'react';
import moment from 'moment-timezone';
import { useRouter, useSearchParams } from 'next/navigation';
import UpcomingWipesSidebar from './UpcomingWipesSidebar';
import UpcomingServerHourGroup from './UpcomingServerHourGroup';
import { fetchFilteredServers } from '@/app/upcoming/actions';

interface SearchParams {
    region?: string;
    resource_rate?: string;
    group_limit?: string;
    game_mode?: string;
    min_rank?: string;
    time_zone?: string;
    date?: string;
}

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

const defaultParams: Required<SearchParams> = {
    region: 'US',
    resource_rate: 'any',
    group_limit: 'any',
    game_mode: 'any',
    min_rank: '5000',
    time_zone: '-7', // Pacific Time
    date: moment().format('YYYY-MM-DD'),
};

export default function UpcomingWipesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [serverList, setServerList] = useState<GroupedWipeDict>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentParams = Object.fromEntries(searchParams.entries());
        const mergedParams: Required<SearchParams> = { ...defaultParams, ...currentParams };

        // Check if we need to update the URL with default params
        const shouldUpdateUrl = Object.keys(defaultParams).some((key) => !(key in currentParams));

        if (shouldUpdateUrl) {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            Object.entries(mergedParams).forEach(([key, value]) => {
                newSearchParams.set(key, value);
            });
            router.replace(`/upcoming?${newSearchParams.toString()}`, { scroll: false });
        }

        const fetchServers = async () => {
            try {
                setLoading(true);
                const servers = await fetchFilteredServers(mergedParams);
                setServerList(servers);
                setError(null);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching servers:', error);
                setServerList({});
                setError('An error occurred while fetching server data. Please try again later.');
            }
        };

        fetchServers();
    }, [searchParams, router]);

    const serversJsxArray = Object.entries(serverList)
        .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
        .map(([wipeHour, servers]) => <UpcomingServerHourGroup key={wipeHour} wipe_dict={servers} wipe_hour={parseInt(wipeHour)} />);

    return (
        <div className="h-full w-full overflow-hidden">
            <div className="flex h-full w-full flex-col md:flex-row">
                <div className="h-fit w-full bg-stone-800 md:h-full md:w-[35%] md:min-w-[35%] md:max-w-[35%]">
                    <UpcomingWipesSidebar searchParams={Object.fromEntries(searchParams.entries())} />
                </div>
                <div className="h-full min-w-full flex-grow overflow-y-auto bg-stone-400 md:w-[65%] md:min-w-[65%]">
                    {error ? (
                        <div className="p-2 text-red-500">{error}</div>
                    ) : loading ? (
                        <div className="p-2 text-stone-950">Loading...</div>
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
