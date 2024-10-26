'use client';

import React, { useState, useEffect } from 'react';
import { useQueryStates } from 'nuqs';
import UpcomingWipesSidebar from './UpcomingWipesSidebar';
import UpcomingServerHourGroup from './UpcomingServerHourGroup';
import { fetchFilteredServers } from '@/app/upcoming/actions';
import { regionParser, resourceRateParser, groupLimitParser, gameModeParser, minRankParser, timeZoneParser, dateParser } from './parsers';

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
    initialData: GroupedWipeDict;
}

export default function UpcomingWipesPage({ initialData }: UpcomingWipesPageProps) {
    const [params, setParams] = useQueryStates(
        {
            region: regionParser,
            resource_rate: resourceRateParser,
            group_limit: groupLimitParser,
            game_mode: gameModeParser,
            min_rank: minRankParser,
            time_zone: timeZoneParser,
            date: dateParser,
        },
        {
            shallow: true,
            history: 'push',
        },
    );

    const [serverList, setServerList] = useState<GroupedWipeDict>(initialData);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // Start with false since we have initial data

    // Use React's useEffect for subsequent parameter changes
    useEffect(() => {
        const fetchServers = async () => {
            try {
                setLoading(true);
                const servers = await fetchFilteredServers(params);
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
    }, [params]);

    const updateSearchParams = (updates: Partial<typeof params>) => {
        setParams(updates);
    };

    const serversJsxArray = Object.entries(serverList)
        .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
        .map(([wipeHour, servers]) => <UpcomingServerHourGroup key={wipeHour} wipe_dict={servers} wipe_hour={parseInt(wipeHour)} />);

    return (
        <div className="h-full w-full overflow-hidden">
            <div className="flex h-full w-full flex-col md:flex-row">
                <div className="h-fit w-full bg-stone-800 md:h-full md:w-[35%] md:min-w-[35%] md:max-w-[35%]">
                    <UpcomingWipesSidebar searchParams={params} onUpdateSearchParams={updateSearchParams} />
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
