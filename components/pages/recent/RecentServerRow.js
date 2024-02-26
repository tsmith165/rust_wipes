import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import FileCopy from '@material-ui/icons/FileCopy';

const HOT_WIPE = 5;
const COOL_WIPE = 15;
const COLD_WIPE = 60;

// eslint-disable-next-line no-unused-vars
export default function RecentServerRow({ id, ip, className, url, rank, players, max_players, wipe_date, offline }) {
    //console.log(`Creating Recent Server Row ${id}...`);
    const [isCopied, setIsCopied] = useState(false);

    const bm_id = url.split('/').pop();

    var today = new Date();
    let final_date = 'Offline';
    let heat_class = null;
    if (wipe_date != null) {
        let diff = Math.floor((today - new Date(wipe_date)) / 1000);

        let days = Math.floor(diff / (60 * 60 * 24));
        diff -= days * (60 * 60 * 24);

        let hrs = Math.floor(diff / (60 * 60));
        diff -= hrs * (60 * 60);

        if (diff < HOT_WIPE) heat_class = 'text-hot-wipe';
        else if (diff < COOL_WIPE) heat_class = 'text-cool-wipe';
        else if (diff < COLD_WIPE) heat_class = 'text-cold-wipe';
        else heat_class = 'text-grey';

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

    const handleCopyClick = () => {
        navigator.clipboard.writeText(`client.connect ${ip}`);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 500);
    };

    return (
        <Link href={`/server/${bm_id}`}>
            <div
                className={`flex h-9 items-center border-b border-black bg-dark ${heat_class} ${offline ? 'bg-secondary opacity-80' : ''}
                hover:bg-light hover:text-white`}
            >
                <div className="w-16 overflow-hidden whitespace-nowrap p-1.5 text-center">#{rank}</div>
                <div className="flex-1 overflow-hidden whitespace-nowrap p-1.5 text-left">
                    <b className="cursor-pointer">{className}</b>
                </div>
                <div className="w-24 overflow-hidden whitespace-nowrap p-1.5 text-center">
                    {!players ? 'Offline' : `${players} / ${max_players}`}
                </div>
                <div className="w-20 overflow-hidden whitespace-nowrap p-1.5 text-center">{final_date}</div>
                <div
                    className={`flex w-12 items-center justify-center p-1.5 ${isCopied ? 'text-success-2' : ''}`}
                    onClick={handleCopyClick}
                >
                    <FileCopy />
                </div>
            </div>
        </Link>
    );
}

RecentServerRow.propTypes = {
    id: PropTypes.number.isRequired,
    ip: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    rank: PropTypes.number.isRequired,
    players: PropTypes.number,
    max_players: PropTypes.number,
    wipe_date: PropTypes.string,
    offline: PropTypes.bool,
};
