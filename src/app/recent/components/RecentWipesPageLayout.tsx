'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RecentWipesHero from './RecentWipesHero';
import FilterFormOverlay from './FilterFormOverlay';
import LegendOverlay from './LegendOverlay';
import ServersTableSection from './ServersTableSection';
import InfoCardsSection from './InfoCardsSection';
import { DEFAULT_PARAMS } from '../constants';
import { getRecentWipesData } from '@/app/actions';

interface ServerListItem {
    id: number;
    attributes: {
        ip: string | null;
        port: number | null;
        name: string | null;
        rank: number | null;
        players: number | null;
        maxPlayers: number | null;
        details: {
            rust_last_wipe: string | null;
        };
    };
    offline?: boolean;
}

interface RecentWipesPageLayoutProps {
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

export default function RecentWipesPageLayout({ initialSearchParams }: RecentWipesPageLayoutProps) {
    const router = useRouter();

    // Store the current page and numServers values in refs to persist them across renders
    const pageRef = useRef<number>(parseInt(initialSearchParams.page || DEFAULT_PARAMS.page));
    const numServersRef = useRef<number>(parseInt(initialSearchParams.numServers || DEFAULT_PARAMS.numServers));

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

    const [serverList, setServerList] = useState<ServerListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRefreshActive, setAutoRefreshActive] = useState(true);
    const [isFilterOverlayOpen, setIsFilterOverlayOpen] = useState(false);
    const [isLegendOverlayOpen, setIsLegendOverlayOpen] = useState(false);

    const searchParamsObject = React.useMemo(() => {
        const obj: { [key: string]: string } = {};
        searchParams.forEach((value, key) => {
            obj[key] = value;

            // Keep our refs in sync with the URL when it changes
            if (key === 'page') {
                pageRef.current = parseInt(value);
            }
            if (key === 'numServers') {
                numServersRef.current = parseInt(value);
            }
        });
        return obj;
    }, [searchParams]);

    const fetchData = useCallback(
        async (forceRefresh: boolean = false) => {
            setIsLoading(true);
            const country = searchParams.get('country') || 'US';
            const minPlayers = parseInt(searchParams.get('minPlayers') || '0');
            const maxDist = parseInt(searchParams.get('maxDist') || '5000');
            const minRank = parseInt(searchParams.get('minRank') || '0');
            const maxRank = parseInt(searchParams.get('maxRank') || '10000');
            const groupLimit = searchParams.get('groupLimit') || 'any';
            const resourceRate = searchParams.get('resourceRate') || 'any';

            // Always use the refs for page and numServers - they persist across renders
            const numServers = numServersRef.current;
            const page = pageRef.current;

            try {
                console.log(`Fetching data with page=${page}, numServers=${numServers}`);
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
        },
        [searchParams],
    );

    const updateSearchParams = (updates: Record<string, string>) => {
        const newSearchParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                newSearchParams.set(key, value);

                // Update our refs when page or numServers change
                if (key === 'page') {
                    pageRef.current = parseInt(value);
                }
                if (key === 'numServers') {
                    numServersRef.current = parseInt(value);
                }
            } else {
                newSearchParams.delete(key);
            }
        });

        setSearchParams(newSearchParams);

        // Use replace with scroll:false instead of push to prevent scroll position changes
        router.replace(`/recent?${newSearchParams.toString()}`, { scroll: false });
    };

    const handleOpenFilterOverlay = () => {
        setIsFilterOverlayOpen(true);
    };

    const handleCloseFilterOverlay = () => {
        setIsFilterOverlayOpen(false);
    };

    const handleOpenLegendOverlay = () => {
        setIsLegendOverlayOpen(true);
    };

    const handleCloseLegendOverlay = () => {
        setIsLegendOverlayOpen(false);
    };

    useEffect(() => {
        fetchData();
    }, [searchParams, fetchData]);

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
    }, [autoRefreshActive, fetchData]);

    const handleRefresh = () => {
        fetchData(true);
    };

    return (
        <div className="min-h-screen bg-st_darkest">
            <RecentWipesHero />

            <ServersTableSection
                searchParams={searchParamsObject}
                server_list={serverList}
                onUpdateSearchParams={updateSearchParams}
                isLoading={isLoading}
                autoRefreshActive={autoRefreshActive}
                setAutoRefreshActive={setAutoRefreshActive}
                onRefresh={handleRefresh}
                onOpenFilterOverlay={handleOpenFilterOverlay}
                onOpenLegendOverlay={handleOpenLegendOverlay}
            />

            <FilterFormOverlay
                searchParams={searchParamsObject}
                isOpen={isFilterOverlayOpen}
                onClose={handleCloseFilterOverlay}
                onUpdateSearchParams={updateSearchParams}
            />

            <LegendOverlay isOpen={isLegendOverlayOpen} onClose={handleCloseLegendOverlay} />

            <InfoCardsSection />
        </div>
    );
}
