import React from 'react';
import Link from 'next/link';

const BM_SERVER_BASE_URL = 'https://www.battlemetrics.com/servers/rust';

const UpcomingServerRow = ({ id, server }) => {
    // Format the server's last wipe date and other properties for display
    var d = new Date(server.last_wipe_date);

    var hour_str = d.getHours() < 12 ? `${d.getHours()}AM` : `${d.getHours() % 12}PM`;
    hour_str = hour_str == '0AM' ? '12AM' : hour_str == '0PM' ? '12PM' : hour_str;

    var last_wipe_date_str = `${d.getMonth()}/${d.getDate()} ${hour_str}`;

    return (
        <div className="flex h-10 flex-row border-b border-black bg-dark font-bold leading-6 text-primary">
            <div className="w-16 overflow-hidden whitespace-nowrap px-2.5">{`#${server.rank}`}</div>
            <div className="w-24 overflow-hidden whitespace-nowrap px-2.5">{last_wipe_date_str}</div>
            <div className="flex-grow overflow-x-auto overflow-y-hidden px-2.5 sm:w-[calc(100vw-175px)] lg:w-[calc(65vw-175px)]">
                <Link href={`${BM_SERVER_BASE_URL}/${server.id}`} className="text-current">
                    {server.title}
                </Link>
            </div>
        </div>
    );
};

export default UpcomingServerRow;
