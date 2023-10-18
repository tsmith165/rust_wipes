import React from 'react';
import Link from 'next/link';

const BM_SERVER_BASE_URL = 'https://www.battlemetrics.com/servers/rust';

const UpcomingServerRow = ({ id, server }) => {
    var d = new Date(server.last_wipe_date);

    var hour_str =
        d.getHours() < 12 ? `${d.getHours()}AM` : `${d.getHours() % 12}PM`;
    hour_str =
        hour_str == '0AM' ? '12AM' : hour_str == '0PM' ? '12PM' : hour_str;

    var last_wipe_date_str = `${d.getMonth()}/${d.getDate()} ${hour_str}`;

    return (
        <div className="bg-dark text-primary h-10 border-b border-black flex flex-row font-bold leading-6">
            <div className="px-2.5 overflow-hidden whitespace-nowrap w-16">{`#${server.rank}`}</div>
            <div className="px-2.5 overflow-hidden whitespace-nowrap w-24">
                {last_wipe_date_str}
            </div>
            <div className="px-2.5 overflow-x-auto overflow-y-hidden flex-grow lg:w-[calc(65vw-175px)] sm:w-[calc(100vw-175px)]">
                <Link
                    href={`${BM_SERVER_BASE_URL}/${server.id}`}
                    className="text-current"
                >
                    {server.title}
                </Link>
            </div>
        </div>
    );
};

export default UpcomingServerRow;
