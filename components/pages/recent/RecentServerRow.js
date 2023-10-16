import React, { useState } from 'react';
import Link from 'next/link';
import FileCopy from '@material-ui/icons/FileCopy';

const HOT_WIPE = 5;
const COOL_WIPE = 15;
const COLD_WIPE = 60;

const RecentServerRow = ({
    id,
    ip,
    className,
    url,
    rank,
    players,
    max_players,
    wipe_date,
    offline,
}) => {
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
        else heat_class = 'text-light';

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
                className={`bg-medium h-9 border-b border-dark flex items-center ${heat_class} ${
                    offline ? 'bg-tertiary opacity-80' : ''
                }
                hover:bg-primary hover:text-white`}>
                <div className="w-16 p-1.5 text-center overflow-hidden whitespace-nowrap">
                    #{rank}
                </div>
                <div className="flex-1 p-1.5 text-left overflow-hidden whitespace-nowrap">
                    <b className="cursor-pointer">{className}</b>
                </div>
                <div className="w-24 p-1.5 text-center overflow-hidden whitespace-nowrap">
                    {!players ? 'Offline' : `${players} / ${max_players}`}
                </div>
                <div className="w-16 p-1.5 text-center overflow-hidden whitespace-nowrap">
                    {final_date}
                </div>
                <div
                    className={`w-12 p-1.5 flex justify-center items-center ${
                        isCopied ? 'text-success-2' : ''
                    }`}
                    onClick={handleCopyClick}>
                    <FileCopy />
                </div>
            </div>
        </Link>
    );
};

export default RecentServerRow;
