import React from 'react';
import Link from 'next/link';

const BM_SERVER_BASE_URL = 'https://www.battlemetrics.com/servers/rust';

interface server {
    id: number;
    rank: number;
    title: string;
    wipe_hour: number;
    last_wipe: string;
    next_wipe: string;
    is_full_wipe: boolean;
}

interface UpcomingServerRowProps {
    id: string;
    server: server;
}

const col_1_width =
    'w-[calc(calc(100%-16px)*0.20)] xs:w-[calc(calc(100%-16px)*0.12)] sm:w-[calc(calc(100%-16px)*0.10)] md:w-[calc(calc(100%-16px)*0.12)] lg:!w-[calc(calc(100%-16px)*0.10)]';
const col_2_width = 'hidden lg:!block lg:!w-[calc(calc(100%-16px)*0.175)]';
const col_3_width =
    'w-[calc(calc(100%-16px)*0.35)] xs:w-[calc(calc(100%-16px)*0.18)] sm:w-[calc(calc(100%-16px)*0.20)] md:w-[calc(calc(100%-16px)*0.23)] lg:!w-[calc(calc(100%-16px)*0.175)]';
const col_4_width =
    'w-[calc(calc(100%-16px)*0.40)] xs:w-[calc(calc(100%-16px)*0.70)] sm:w-[calc(calc(100%-16px)*0.70)] md:w-[calc(calc(100%-16px)*0.65)] lg:!w-[calc(calc(100%-16px)*0.55)]';

export default function UpcomingServerRow({ id, server }: UpcomingServerRowProps) {
    return (
        <div className="flex h-10 border-b border-stone-500 bg-stone-400 text-stone-950 last:rounded-b-lg last:shadow-xl hover:bg-primary hover:text-stone-300">
            <Link
                href={`/server/${server.id}`}
                className="flex w-full flex-row items-center space-x-2 px-4 text-current  hover:cursor-pointer"
            >
                <div className={`overflow-hidden whitespace-nowrap ${col_1_width}`} title={`#${server.rank}`}>
                    {`#${server.rank}`}
                </div>
                <div className={`overflow-hidden whitespace-nowrap ${col_2_width}`} title={server.last_wipe}>
                    {server.last_wipe}
                </div>
                <div className={`overflow-hidden whitespace-nowrap ${col_3_width}`} title={`${server.next_wipe}`}>
                    {server.next_wipe}
                </div>
                <div className={`overflow-hidden whitespace-nowrap ${col_4_width}`} title={server.title}>
                    {server.is_full_wipe && <span className="ml-1 font-bold text-primary">[BP Wipe]</span>}
                    {` ${server.title}`}
                </div>
            </Link>
        </div>
    );
}
