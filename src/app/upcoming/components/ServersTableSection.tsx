'use client';

import React, { useRef } from 'react';
import UpcomingServerHourGroup from '../UpcomingServerHourGroup';
import { Calendar } from 'lucide-react';
import moment from 'moment-timezone';

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

interface ServersTableSectionProps {
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    server_list: GroupedWipeDict;
    onUpdateSearchParams: (updates: Record<string, string>) => void;
    isLoading: boolean;
}

export default function ServersTableSection({ searchParams, server_list, isLoading }: ServersTableSectionProps) {
    // Use this ref to preserve scroll position
    const tableRef = useRef<HTMLDivElement>(null);

    // Get the selected date and timezone
    const selectedDate = (searchParams.date as string) || new Date().toISOString().split('T')[0];
    const timeZoneOffset = (searchParams.time_zone as string) || '-7';

    // Short display name of timezone
    const shortTimeZoneLabel = `UTC${timeZoneOffset.startsWith('-') ? timeZoneOffset : `+${timeZoneOffset}`}`;

    // Format the date explicitly using the selected date without timezone conversion
    const formattedDate = moment(selectedDate).format('dddd, MMMM D, YYYY');

    // Count total servers
    const totalServers = Object.values(server_list).reduce((total, servers) => total + servers.length, 0);

    const serversJsxArray = Object.entries(server_list)
        .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
        .map(([wipeHour, servers]) => <UpcomingServerHourGroup key={wipeHour} wipe_dict={servers} wipe_hour={parseInt(wipeHour)} />);

    return (
        <section className="bg-st_darkest py-8" id="servers-table" ref={tableRef}>
            <div className="container mx-auto px-4">
                <div className="relative mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <h2 className="text-2xl font-bold text-primary_light">Upcoming Wipe Schedule</h2>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-10 items-center rounded-lg bg-st_dark px-3 text-st_lightest">
                            <Calendar size={18} className="mr-2" />
                            <span>{formattedDate}</span>
                            <span className="ml-2">({shortTimeZoneLabel})</span>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex h-40 items-center justify-center rounded-lg">
                        <div className="text-st_lightest">Loading servers...</div>
                    </div>
                ) : serversJsxArray.length > 0 ? (
                    <div className="overflow-hidden rounded-lg shadow-lg">{serversJsxArray}</div>
                ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg">
                        <div className="text-st_lightest">No servers found for the selected filters.</div>
                    </div>
                )}

                <div className="mt-4 text-right text-sm text-st_lightest">
                    {totalServers} {totalServers === 1 ? 'server' : 'servers'} found
                </div>
            </div>
        </section>
    );
}
