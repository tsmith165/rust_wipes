import React from 'react';
import PropTypes from 'prop-types';

import Link from 'next/link';

const BM_SERVER_BASE_URL = 'https://www.battlemetrics.com/servers/rust';

// eslint-disable-next-line no-unused-vars
export default function UpcomingServerRow({ id, server }) {
    console.log(`Creating server row for server ${id}:`);
    console.log(server);

    // Format the server's last wipe date and other properties for display
    var last_wipe_date_str = 'N/A';
    var d = new Date(server.last_wipe || null);
    if (d !== null) {
        var hour_str = d.getHours() < 12 ? `${d.getHours()}AM` : `${d.getHours() % 12}PM`;
        hour_str = hour_str == '0AM' ? '12AM' : hour_str == '0PM' ? '12PM' : hour_str;

        last_wipe_date_str = `${d.getMonth()}/${d.getDate()} ${hour_str}`;
    }

    return (
        <div className="border-secondary_dark flex h-10 flex-row border-b bg-secondary font-bold leading-6 text-primary">
            <div className="w-16 overflow-hidden whitespace-nowrap px-2.5">{`#${server.rank}`}</div>
            <div className="w-24 overflow-hidden whitespace-nowrap px-2.5">{last_wipe_date_str}</div>
            <div className="flex-grow overflow-x-auto overflow-y-hidden px-2.5 sm:w-[calc(100vw-175px)] lg:w-[calc(65vw-175px)]">
                <Link href={`${BM_SERVER_BASE_URL}/${server.id}`} className="text-current">
                    {server.title}
                </Link>
            </div>
        </div>
    );
}

UpcomingServerRow.propTypes = {
    id: PropTypes.string.isRequired,
    server: PropTypes.object.isRequired,
};
