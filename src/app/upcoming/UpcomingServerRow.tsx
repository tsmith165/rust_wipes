'use client';

import Link from 'next/link';
import React from 'react';

interface ServerData {
    id: number;
    rank: number;
    title: string;
    wipe_hour: number;
    last_wipe: string;
    next_wipe: string;
    is_full_wipe: boolean;
    is_bp_wipe: boolean;
    wipe_schedule?: string;
}

interface UpcomingServerRowProps {
    id: string;
    server: ServerData;
}

export default function UpcomingServerRow({ id, server }: UpcomingServerRowProps) {
    const url = `https://www.battlemetrics.com/servers/rust/${server.id}`;

    // Format dates with improved fallback handling
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'TBD';

        try {
            const date = new Date(dateStr);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'TBD';
            }

            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'TBD';
        }
    };

    const formattedLastWipe = formatDate(server.last_wipe);
    const formattedNextWipe = formatDate(server.next_wipe);

    // Determine wipe type and styling
    let wipeType = 'Normal Wipe';
    let wipeTypeClass = 'text-green-400 font-semibold bg-green-900/30 px-2 py-0.5 rounded';

    if (server.is_full_wipe) {
        wipeType = 'Full Wipe';
        wipeTypeClass = 'text-hot_wipe font-semibold bg-red-900/30 px-2 py-0.5 rounded';
    } else if (server.is_bp_wipe) {
        wipeType = 'BP Wipe';
        wipeTypeClass = 'text-cool_wipe font-semibold bg-orange-900/30 px-2 py-0.5 rounded';
    }

    return (
        <div id={id} className="border-b border-stone-700 transition-all duration-200 hover:bg-st_darkest">
            <Link href={url} target="_blank" rel="noopener noreferrer">
                <div className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-stone-200">
                    <div className="col-span-2 text-left font-semibold sm:col-span-1">#{server.rank}</div>

                    <div className="col-span-3 text-left font-medium sm:col-span-2">{formattedLastWipe}</div>

                    <div className="justify-left col-span-3 flex items-center space-x-2 sm:col-span-3">
                        <span className="font-medium">{formattedNextWipe}</span>
                        <span className={wipeTypeClass}>{wipeType}</span>
                    </div>

                    <span className="col-span-4 truncate font-medium text-stone-100 transition-colors duration-200 hover:text-primary_light sm:col-span-6">
                        {server.title}
                    </span>
                </div>
            </Link>
        </div>
    );
}
