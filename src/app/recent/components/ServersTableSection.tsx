'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import RecentWipesTable from '../RecentWipesTable';
import { RefreshCw, ChevronUp, ChevronDown, FilterIcon, BookOpen } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { PrimaryToggle } from '@/components/ui/toggle';

// Default values for filters to calculate active count
const DEFAULT_FILTER_VALUES = {
    minPlayers: '0',
    maxDist: '5000',
    country: 'US',
    minRank: '0',
    maxRank: '10000',
    groupLimit: 'any',
    resourceRate: 'any',
    numServers: '10',
};

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

interface ServersTableHeaderProps {
    page: number;
    onUpdatePage: (page: number) => void;
    isLoading: boolean;
    autoRefreshActive: boolean;
    lastRefreshTime: number;
    onToggleAutoRefresh: (e: React.ChangeEvent<HTMLInputElement>) => void;
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    onOpenFilterOverlay: () => void;
    onOpenLegendOverlay: () => void;
}

function ServersTableHeader({
    page,
    onUpdatePage,
    isLoading,
    autoRefreshActive,
    lastRefreshTime,
    onToggleAutoRefresh,
    searchParams,
    onOpenFilterOverlay,
    onOpenLegendOverlay,
}: ServersTableHeaderProps) {
    // State to track whether data is stale (>30 seconds old)
    const [dataState, setDataState] = useState<'live' | 'stale'>('live');
    const [dataAge, setDataAge] = useState<number>(0);

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;

        // Check each filter param against defaults
        Object.entries(DEFAULT_FILTER_VALUES).forEach(([key, defaultValue]) => {
            if (key === 'page') return; // Skip page param
            const currentValue = searchParams[key] as string;
            if (currentValue && currentValue !== defaultValue) {
                count++;
            }
        });

        return count;
    }, [searchParams]);

    // Update data state based on last refresh time
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastRefresh = now - lastRefreshTime;
            setDataAge(Math.floor(timeSinceLastRefresh / 1000)); // age in seconds
            setDataState(timeSinceLastRefresh > 30000 ? 'stale' : 'live');
        }, 1000);

        return () => clearInterval(interval);
    }, [lastRefreshTime]);

    // Handle manual refresh click
    const handleManualRefresh = () => {
        if (!isLoading) {
            window.dispatchEvent(new CustomEvent('manual-refresh'));
        }
    };

    return (
        <div className="relative mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h2 className="text-2xl font-bold text-primary_light">Recently Wiped Servers</h2>

            <div className="flex flex-wrap items-center gap-3">
                {/* Pagination Controls */}
                <div className="flex h-10 flex-row items-center space-x-2 rounded-lg bg-st_dark pl-2 text-st_lightest">
                    <span className="flex items-center justify-center">Page {page}</span>
                    <div className="flex flex-col items-center space-y-1">
                        <button
                            onClick={() => onUpdatePage(page > 1 ? page - 1 : 1)}
                            className="group flex h-4 w-4 items-center justify-center rounded p-0.5 hover:bg-primary disabled:opacity-50"
                            disabled={page <= 1}
                            data-tooltip-id="prev-page-tooltip"
                            data-tooltip-content="Previous Page"
                        >
                            <ChevronUp className="h-3 w-3 text-st_lightest group-hover:text-st_white" />
                        </button>
                        <button
                            onClick={() => onUpdatePage(page + 1)}
                            className="group flex h-4 w-4 items-center justify-center rounded p-0.5 hover:bg-primary"
                            data-tooltip-id="next-page-tooltip"
                            data-tooltip-content="Next Page"
                        >
                            <ChevronDown className="h-3 w-3 text-st_lightest group-hover:text-st_white" />
                        </button>
                    </div>
                </div>
                <Tooltip id="prev-page-tooltip" place="top" />
                <Tooltip id="next-page-tooltip" place="top" />

                {/* Legend Button */}
                <button
                    onClick={onOpenLegendOverlay}
                    className="flex h-10 items-center rounded-lg bg-st_dark px-3 text-st_lightest transition-colors hover:text-primary_light"
                    data-tooltip-id="legend-tooltip"
                    data-tooltip-content="Open Legend"
                >
                    <BookOpen size={18} />
                </button>
                <Tooltip id="legend-tooltip" place="top" />

                {/* Filter Button */}
                <button
                    onClick={onOpenFilterOverlay}
                    className="flex h-10 items-center rounded-lg bg-st_dark px-3 text-st_lightest transition-colors hover:text-primary_light"
                    data-tooltip-id="filter-tooltip"
                    data-tooltip-content="Open Filters"
                >
                    <FilterIcon size={18} />
                    {activeFilterCount > 0 && (
                        <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-st_white">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
                <Tooltip id="filter-tooltip" place="top" />

                {/* Auto Refresh Toggle and Status Indicator Combined */}
                <div className="flex h-10 items-center rounded-lg bg-st_dark px-3 text-st_lightest">
                    <button
                        onClick={handleManualRefresh}
                        disabled={isLoading}
                        className="mr-2 flex items-center justify-center text-st_lightest transition-colors duration-200 hover:text-primary_light disabled:opacity-50"
                        data-tooltip-id="manual-refresh-tooltip"
                        data-tooltip-content="Click to refresh data manually"
                    >
                        <RefreshCw size={18} className={`${isLoading ? 'animate-spin text-primary_light' : ''}`} />
                    </button>
                    <Tooltip id="manual-refresh-tooltip" place="top" />

                    <PrimaryToggle
                        checked={autoRefreshActive}
                        onChange={onToggleAutoRefresh}
                        disabled={isLoading}
                        data-tooltip-id="auto-refresh-tooltip"
                        data-tooltip-content={autoRefreshActive ? 'Auto-Refresh Active' : 'Click to Enable Auto-Refresh'}
                        className="mr-2"
                    />

                    {/* Status indicator with fixed width to prevent layout shift */}
                    <div className="flex h-6 w-16 items-center justify-center">
                        {isLoading ? (
                            <div className="flex items-center">
                                <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-primary_light"></span>
                                <span className="text-xs text-primary_light">Loading</span>
                            </div>
                        ) : (
                            <div
                                className="flex items-center"
                                data-tooltip-id="data-age-tooltip"
                                data-tooltip-content={`This data is ${dataAge} seconds old`}
                            >
                                <span
                                    className={`mr-1.5 h-1.5 w-1.5 ${autoRefreshActive ? 'animate-pulse' : ''} rounded-full ${dataState === 'live' ? 'bg-primary_light' : 'bg-cool_wipe'}`}
                                ></span>
                                <span className={`text-xs ${dataState === 'live' ? 'text-primary_light' : 'text-cool_wipe'}`}>
                                    {dataState === 'live' ? 'Live' : 'Stale'}
                                </span>
                            </div>
                        )}
                    </div>
                    <Tooltip id="data-age-tooltip" place="top" />
                </div>
                <Tooltip id="auto-refresh-tooltip" place="top" />
            </div>
        </div>
    );
}

interface ServersTableSectionProps {
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    server_list: ServerListItem[];
    onUpdateSearchParams: (updates: Record<string, string>) => void;
    isLoading: boolean;
    autoRefreshActive: boolean;
    setAutoRefreshActive: (active: boolean) => void;
    onRefresh: () => void;
    onOpenFilterOverlay: () => void;
    onOpenLegendOverlay: () => void;
}

export default function ServersTableSection({
    searchParams,
    server_list,
    onUpdateSearchParams,
    isLoading,
    autoRefreshActive,
    setAutoRefreshActive,
    onRefresh,
    onOpenFilterOverlay,
    onOpenLegendOverlay,
}: ServersTableSectionProps) {
    const router = useRouter();
    const pathname = usePathname();
    const urlSearchParams = useSearchParams();
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

    const numServers = parseInt((searchParams?.numServers as string) || '10');
    const page = parseInt((searchParams?.page as string) || '1');

    // Use this ref to preserve scroll position
    const tableRef = React.useRef<HTMLDivElement>(null);

    // Update lastRefreshTime whenever data is refreshed
    useEffect(() => {
        if (!isLoading) {
            setLastRefreshTime(Date.now());
        }
    }, [isLoading, server_list]);

    // Handle manual refresh events
    useEffect(() => {
        const handleManualRefresh = () => {
            onRefresh();
        };

        window.addEventListener('manual-refresh', handleManualRefresh);
        return () => window.removeEventListener('manual-refresh', handleManualRefresh);
    }, [onRefresh]);

    const handleRefreshToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newState = e.target.checked;
        setAutoRefreshActive(newState);
        if (newState) {
            onRefresh();
        }
    };

    const updateUrlParams = useCallback(
        (updates: Record<string, string>) => {
            // Create new URLSearchParams object
            const params = new URLSearchParams(urlSearchParams.toString());

            // Update with new values
            Object.entries(updates).forEach(([key, value]) => {
                params.set(key, value);
            });

            // Replace the URL without causing navigation/refresh
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            // Call the original handler to update state
            onUpdateSearchParams(updates);
        },
        [router, pathname, urlSearchParams, onUpdateSearchParams],
    );

    const handleUpdatePage = (newPage: number) => {
        updateUrlParams({ page: newPage.toString() });
    };

    return (
        <section className="bg-st_darkest py-8" id="servers-table" ref={tableRef}>
            <div className="container mx-auto px-4">
                <ServersTableHeader
                    page={page}
                    onUpdatePage={handleUpdatePage}
                    isLoading={isLoading}
                    autoRefreshActive={autoRefreshActive}
                    lastRefreshTime={lastRefreshTime}
                    onToggleAutoRefresh={handleRefreshToggle}
                    searchParams={searchParams}
                    onOpenFilterOverlay={onOpenFilterOverlay}
                    onOpenLegendOverlay={onOpenLegendOverlay}
                />

                <div className="overflow-hidden rounded-lg shadow-lg">
                    <RecentWipesTable searchParams={searchParams} server_list={server_list} onUpdateSearchParams={updateUrlParams} />
                </div>

                <div className="mt-4 text-right text-sm text-st hover:text-st_light">
                    {server_list.length > 0 ? (
                        <>
                            Showing servers {(page - 1) * numServers + 1} to{' '}
                            {Math.min(page * numServers, (page - 1) * numServers + server_list.length)}
                        </>
                    ) : (
                        <>No servers to display</>
                    )}
                </div>
            </div>
        </section>
    );
}
