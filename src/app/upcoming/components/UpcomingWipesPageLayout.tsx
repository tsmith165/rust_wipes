'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment-timezone';
import UpcomingWipesHero from './UpcomingWipesHero';
import FilterFormSection from './FilterFormSection';
import ServersTableSection from './ServersTableSection';
import InfoCardsSection from './InfoCardsSection';
import { DEFAULT_PARAMS } from '../constants';
import { fetchFilteredServers } from '../actions';

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

interface UpcomingWipesPageLayoutProps {
    initialData: GroupedWipeDict;
}

export default function UpcomingWipesPageLayout({ initialData }: UpcomingWipesPageLayoutProps) {
    const router = useRouter();

    // Store the current filter values in refs to persist them across renders
    const regionRef = useRef<string>(DEFAULT_PARAMS.region);
    const resourceRateRef = useRef<string>(DEFAULT_PARAMS.resource_rate);
    const groupLimitRef = useRef<string>(DEFAULT_PARAMS.group_limit);
    const gameModeRef = useRef<string>(DEFAULT_PARAMS.game_mode);
    const minRankRef = useRef<string>(DEFAULT_PARAMS.min_rank);
    const timeZoneRef = useRef<string>(DEFAULT_PARAMS.time_zone);
    const dateRef = useRef<string>(DEFAULT_PARAMS.date);

    // Initialize searchParams using DEFAULT_PARAMS
    const [searchParams, setSearchParams] = useState(() => {
        const params = new URLSearchParams();

        // Set default parameters
        params.set('region', DEFAULT_PARAMS.region);
        params.set('resource_rate', DEFAULT_PARAMS.resource_rate);
        params.set('group_limit', DEFAULT_PARAMS.group_limit);
        params.set('game_mode', DEFAULT_PARAMS.game_mode);
        params.set('min_rank', DEFAULT_PARAMS.min_rank);
        params.set('time_zone', DEFAULT_PARAMS.time_zone);
        params.set('date', DEFAULT_PARAMS.date);

        return params;
    });

    const [serverList, setServerList] = useState<GroupedWipeDict>(initialData);
    const [isLoading, setIsLoading] = useState(false);

    const searchParamsObject = React.useMemo(() => {
        const obj: { [key: string]: string } = {};
        searchParams.forEach((value, key) => {
            obj[key] = value;

            // Keep our refs in sync with the URL when it changes
            if (key === 'region') regionRef.current = value;
            if (key === 'resource_rate') resourceRateRef.current = value;
            if (key === 'group_limit') groupLimitRef.current = value;
            if (key === 'game_mode') gameModeRef.current = value;
            if (key === 'min_rank') minRankRef.current = value;
            if (key === 'time_zone') timeZoneRef.current = value;
            if (key === 'date') dateRef.current = value;
        });
        return obj;
    }, [searchParams]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params = {
                region: regionRef.current,
                resource_rate: resourceRateRef.current,
                group_limit: groupLimitRef.current,
                game_mode: gameModeRef.current,
                min_rank: minRankRef.current,
                time_zone: timeZoneRef.current,
                date: dateRef.current,
            };

            const data = await fetchFilteredServers(params);
            setServerList(data);
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

                // Update our refs when values change
                if (key === 'region') regionRef.current = value;
                if (key === 'resource_rate') resourceRateRef.current = value;
                if (key === 'group_limit') groupLimitRef.current = value;
                if (key === 'game_mode') gameModeRef.current = value;
                if (key === 'min_rank') minRankRef.current = value;
                if (key === 'time_zone') timeZoneRef.current = value;
                if (key === 'date') dateRef.current = value;
            } else {
                newSearchParams.delete(key);
            }
        });

        setSearchParams(newSearchParams);

        // Use replace with scroll:false instead of push to prevent scroll position changes
        router.replace(`/upcoming?${newSearchParams.toString()}`, { scroll: false });
    };

    useEffect(() => {
        fetchData();
    }, [searchParams]);

    const handleRefresh = () => {
        fetchData();
    };

    return (
        <div className="min-h-screen bg-st_darkest">
            <UpcomingWipesHero />

            <FilterFormSection
                searchParams={searchParamsObject}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                onUpdateSearchParams={updateSearchParams}
            />

            <ServersTableSection
                searchParams={searchParamsObject}
                server_list={serverList}
                onUpdateSearchParams={updateSearchParams}
                isLoading={isLoading}
            />

            <InfoCardsSection />

            {Object.keys(serverList).length === 0 && (
                <div className="container mx-auto px-4 py-8">
                    <div className="rounded-lg bg-stone-800 p-8 text-center shadow-md">
                        <h3 className="mb-2 text-xl font-semibold text-stone-200">No servers found wiping on the selected date</h3>
                        <p className="text-stone-400">Try selecting a different date or adjusting your filters to see more results.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
