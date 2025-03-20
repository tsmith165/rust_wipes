import React from 'react';
import Link from 'next/link';
import CopyToClipboardButton from './CopyToClipboardButton';

const HOT_WIPE = 5 * 60; // 5 minutes in seconds
const COOL_WIPE = 15 * 60; // 15 minutes in seconds
const COLD_WIPE = 60 * 60; // 1 hour in seconds

// For testing purposes
// const HOT_WIPE = 120 * 60; // 2 hours in seconds
// const COOL_WIPE = 480 * 60; // 8 hours in seconds
// const COLD_WIPE = 960 * 60; // 16 hours in seconds

interface RecentServerRowProps {
    id: number;
    ip: string | null;
    className: string | null;
    url: string;
    rank: number | null;
    players: number;
    maxPlayers: number;
    wipe_date?: string;
    offline?: boolean;
}

const RecentServerRow: React.FC<RecentServerRowProps> = ({ ip, className, url, rank, players, maxPlayers, wipe_date, offline }) => {
    const bm_id = url.split('/').pop() || '';

    const today = new Date();
    let final_date = 'Offline';
    let wipe_color = ''; // Default to no indicator for old wipes
    let showWipeIndicator = false;

    if (wipe_date != null) {
        const totalDiffSeconds = Math.floor((today.getTime() - new Date(wipe_date).getTime()) / 1000);

        const days = Math.floor(totalDiffSeconds / (60 * 60 * 24));
        const hrs = Math.floor((totalDiffSeconds % (60 * 60 * 24)) / (60 * 60));
        const mins = Math.floor((totalDiffSeconds % (60 * 60)) / 60);

        // Only show indicator if wiped less than 60 mins ago
        if (totalDiffSeconds < COLD_WIPE) {
            showWipeIndicator = true;
            if (totalDiffSeconds < HOT_WIPE) wipe_color = 'bg-hot_wipe';
            else if (totalDiffSeconds < COOL_WIPE) wipe_color = 'bg-cool_wipe';
            else wipe_color = 'bg-cold_wipe';
        }

        if (days > 0) {
            final_date = `${days}d ${hrs}h`;
        } else if (hrs > 0) {
            final_date = `${hrs}h ${mins}m`;
        } else if (mins > 0) {
            final_date = `${mins}mins`;
        } else {
            final_date = `${totalDiffSeconds}secs`;
        }
    }

    // Determine rank color
    let rank_color = 'bg-red-500'; // Default for unknown
    if (rank) {
        if (rank <= 100) rank_color = 'bg-blue-500';
        else if (rank <= 500) rank_color = 'bg-green-500';
        else if (rank <= 1000) rank_color = 'bg-yellow-500';
        else if (rank <= 5000) rank_color = 'bg-orange-500';
    }

    // Determine population color - Reversed so high population is good (green)
    let pop_color = 'bg-red-500'; // Default for low population
    if (maxPlayers > 0) {
        const population_percentage = (players / maxPlayers) * 100;
        if (population_percentage > 75) pop_color = 'bg-green-500';
        else if (population_percentage > 50) pop_color = 'bg-yellow-500';
        else if (population_percentage > 25) pop_color = 'bg-orange-500';
    }

    return (
        <div
            className={`flex h-9 w-full items-center border-b border-st_darkest pr-2 text-st_lightest ${
                offline ? 'hidden bg-primary_dark opacity-80' : 'flex w-full bg-st'
            } hover:bg-st_dark`}
        >
            <Link href={`/server/${bm_id}`} className="group flex w-[calc(100%-3rem)]">
                <div className="flex w-20 items-center justify-center overflow-hidden whitespace-nowrap p-1.5">
                    <div className={`mr-1.5 h-2.5 w-2.5 rounded-full ${rank_color}`}></div>
                    <span>{rank || 'N/A'}</span>
                </div>
                <div className="flex-1 overflow-hidden whitespace-nowrap p-1.5 text-left">
                    <span className="text-st_white group-hover:cursor-pointer group-hover:text-primary_light group-hover:underline">
                        {className || 'Unknown'}
                    </span>
                </div>
                <div className="flex w-28 items-center justify-center overflow-hidden whitespace-nowrap p-1.5">
                    <div className={`mr-1.5 h-2.5 w-2.5 rounded-full ${pop_color}`}></div>
                    <span>{!players || players === 0 || maxPlayers === 0 ? 'Offline' : `${players} / ${maxPlayers}`}</span>
                </div>
                <div className="flex w-24 items-center justify-center overflow-hidden whitespace-nowrap p-1.5">
                    {showWipeIndicator && <div className={`mr-1.5 h-2.5 w-2.5 rounded-full ${wipe_color}`}></div>}
                    <span>{final_date}</span>
                </div>
            </Link>
            <div className="flex w-12 justify-center overflow-hidden whitespace-nowrap p-1.5">
                {ip && <CopyToClipboardButton textToCopy={`client.connect ${ip}`} />}
            </div>
        </div>
    );
};

export default RecentServerRow;
