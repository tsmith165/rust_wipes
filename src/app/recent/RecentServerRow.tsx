import React from 'react';
import Link from 'next/link';
import CopyToClipboardButton from './CopyToClipboardButton';

const HOT_WIPE = 5;
const COOL_WIPE = 15;
const COLD_WIPE = 60;

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

const RecentServerRow: React.FC<RecentServerRowProps> = ({ id, ip, className, url, rank, players, maxPlayers, wipe_date, offline }) => {
    const bm_id = url.split('/').pop() || '';

    const today = new Date();
    let final_date = 'Offline';
    let heat_class: string | null = null;

    if (wipe_date != null) {
        let diff = Math.floor((today.getTime() - new Date(wipe_date).getTime()) / 1000);

        let days = Math.floor(diff / (60 * 60 * 24));
        diff -= days * (60 * 60 * 24);

        let hrs = Math.floor(diff / (60 * 60));
        diff -= hrs * (60 * 60);

        if (diff < HOT_WIPE) heat_class = 'text-hot_wipe';
        else if (diff < COOL_WIPE) heat_class = 'text-cool_wipe';
        else if (diff < COLD_WIPE) heat_class = 'text-cold_wipe';
        else heat_class = 'text-secondary_light';

        let mins = Math.floor(diff / 60);

        if (days > 0) {
            final_date = `${days}d ${hrs}h`;
        } else if (hrs > 0) {
            final_date = `${hrs}h ${mins}m`;
        } else if (mins > 0) {
            final_date = `${mins}mins`;
        } else {
            final_date = `${diff}secs`;
        }
    }

    return (
        <Link href={`/server/${bm_id}`}>
            <div
                className={`flex h-9 items-center border-b border-secondary_dark ${heat_class} ${
                    offline ? 'bg-red-500 opacity-80' : 'bg-secondary'
                } hover:bg-primary_light hover:text-white`}
            >
                <div className="w-16 overflow-hidden whitespace-nowrap p-1.5 text-center">#{rank || 'N/A'}</div>
                <div className="flex-1 overflow-hidden whitespace-nowrap p-1.5 text-left">
                    <b className="cursor-pointer">{className || 'Unknown'}</b>
                </div>
                <div className="w-24 overflow-hidden whitespace-nowrap p-1.5 text-center">
                    {!players || players === 0 || maxPlayers === 0 ? 'Offline' : `${players} / ${maxPlayers}`}
                </div>
                <div className="w-20 overflow-hidden whitespace-nowrap p-1.5 text-center">{final_date}</div>
                <div className="flex w-12 justify-center overflow-hidden whitespace-nowrap p-1.5">
                    {ip && <CopyToClipboardButton textToCopy={`client.connect ${ip}`} />}
                </div>
            </div>
        </Link>
    );
};

export default RecentServerRow;
