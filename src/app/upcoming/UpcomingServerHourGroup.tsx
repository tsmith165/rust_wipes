'use client';

import React, { useState } from 'react';
import UpcomingServerRow from './UpcomingServerRow';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ServerData {
    id: number;
    rank: number;
    title: string;
    wipe_hour: number;
    last_wipe: string;
    next_wipe: string;
    is_full_wipe: boolean;
}

interface UpcomingServerHourGroupProps {
    wipe_dict: ServerData[];
    wipe_hour: number;
}

export default function UpcomingServerHourGroup({ wipe_dict, wipe_hour }: UpcomingServerHourGroupProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    // Filter out servers with invalid data
    const validServers = wipe_dict.filter((server) => server && server.title && server.next_wipe !== 'TBD');

    // Format hour string for better readability
    const hour = wipe_hour % 12 || 12;
    const amPm = wipe_hour < 12 ? 'AM' : 'PM';
    const hourStr = `${hour}:00 ${amPm}`;

    // Don't render if no valid servers
    if (validServers.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 overflow-hidden rounded-lg border border-stone-700 bg-stone-800 shadow-md transition-all duration-200">
            {/* Header section */}
            <div
                className="flex cursor-pointer items-center justify-between bg-stone-800 px-4 py-3 transition-all duration-200 hover:bg-stone-700"
                onClick={toggleExpanded}
            >
                <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-700 text-primary_light transition-all duration-200 hover:bg-primary_dark hover:text-stone-100">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    <div className="text-xl font-bold text-primary_light">{hourStr}</div>
                    <div className="rounded-full bg-stone-700 px-3 py-1 text-sm font-medium text-stone-200">
                        {validServers.length} {validServers.length === 1 ? 'Server' : 'Servers'}
                    </div>
                </div>
            </div>

            {/* Content section - animated expand/collapse */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                {/* Header row */}
                <div className="bg-stone-700 px-4 py-3 text-sm font-semibold text-stone-200">
                    <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 sm:col-span-1">Rank</div>
                        <div className="col-span-3 sm:col-span-2">Last Wipe</div>
                        <div className="col-span-3 sm:col-span-3">Next Wipe</div>
                        <div className="col-span-4 sm:col-span-6">Server Title</div>
                    </div>
                </div>

                {/* Server rows */}
                <div>
                    {validServers.map((server, index) => (
                        <UpcomingServerRow key={`server-${server.id}-${index}`} id={`server-${server.id}`} server={server} />
                    ))}
                </div>
            </div>
        </div>
    );
}
