'use client';

import React, { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import RecentWipesTable from '../RecentWipesTable';
import NumServersSelect from '../NumServersSelect';
import { RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

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
    numServers: number;
    onUpdatePage: (page: number) => void;
    onUpdateNumServers: (numServers: string) => void;
    isLoading: boolean;
    autoRefreshActive: boolean;
    onToggleAutoRefresh: (e: React.MouseEvent<HTMLButtonElement>) => void;
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
}

function ServersTableHeader({
    page,
    numServers,
    onUpdatePage,
    onUpdateNumServers,
    isLoading,
    autoRefreshActive,
    onToggleAutoRefresh,
    searchParams,
}: ServersTableHeaderProps) {
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

                {/* Show Controls */}
                <div className="flex h-10 items-center space-x-1 rounded-lg bg-st_dark px-2 text-st_lightest">
                    <span className="flex items-center justify-center">Show:</span>
                    <div>
                        <NumServersSelect
                            defaultValue={numServers}
                            searchParams={searchParams}
                            onUpdateSearchParams={(updates) => onUpdateNumServers(updates.numServers)}
                        />
                    </div>
                </div>

                {/* Auto Refresh Button */}
                <button
                    onClick={onToggleAutoRefresh}
                    className={`flex h-10 items-center justify-center rounded-lg px-3 transition-colors duration-200 focus:outline-none ${
                        autoRefreshActive ? 'bg-st_dark text-primary_light' : 'bg-st_dark text-st_lightest hover:text-primary_light'
                    }`}
                    disabled={isLoading}
                    data-tooltip-id="auto-refresh-tooltip"
                    data-tooltip-content={autoRefreshActive ? 'Auto-Refresh Active' : 'Click to Enable Auto-Refresh'}
                >
                    <RefreshCw
                        size={18}
                        className={`${isLoading ? 'animate-spin' : ''} ${autoRefreshActive ? 'text-primary_light' : ''}`}
                    />
                </button>
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
}

export default function ServersTableSection({
    searchParams,
    server_list,
    onUpdateSearchParams,
    isLoading,
    autoRefreshActive,
    setAutoRefreshActive,
    onRefresh,
}: ServersTableSectionProps) {
    const router = useRouter();
    const pathname = usePathname();
    const urlSearchParams = useSearchParams();

    const numServers = parseInt((searchParams?.numServers as string) || '10');
    const page = parseInt((searchParams?.page as string) || '1');

    // Use this ref to preserve scroll position
    const tableRef = React.useRef<HTMLDivElement>(null);

    const handleRefreshClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setAutoRefreshActive(!autoRefreshActive);
        if (!autoRefreshActive) {
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

    const handleUpdateNumServers = (numServers: string) => {
        updateUrlParams({ numServers });
    };

    return (
        <section className="bg-st_darkest py-8" id="servers-table" ref={tableRef}>
            <div className="container mx-auto px-4">
                <ServersTableHeader
                    page={page}
                    numServers={numServers}
                    onUpdatePage={handleUpdatePage}
                    onUpdateNumServers={handleUpdateNumServers}
                    isLoading={isLoading}
                    autoRefreshActive={autoRefreshActive}
                    onToggleAutoRefresh={handleRefreshClick}
                    searchParams={searchParams}
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
