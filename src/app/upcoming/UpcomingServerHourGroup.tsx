'use client';

import React, { useState } from 'react';
import UpcomingServerRow from './UpcomingServerRow';
import { IoIosArrowForward } from 'react-icons/io';

interface ServerData {
    id: number;
    rank: number;
    title: string;
    wipe_hour: number;
    last_wipe_date: string;
}

interface UpcomingServerHourGroupProps {
    wipe_dict: ServerData[];
    wipe_hour: number;
}

export default function UpcomingServerHourGroup({ wipe_dict, wipe_hour }: UpcomingServerHourGroupProps) {
    const [isWipeContainerHidden, setIsWipeContainerHidden] = useState(true);

    const headerClicked = () => {
        setIsWipeContainerHidden(!isWipeContainerHidden);
    };

    let hour_str = wipe_hour < 12 ? `${wipe_hour}AM` : `${wipe_hour - 12}PM`;
    hour_str = hour_str === '0AM' ? '12AM' : hour_str === '0PM' ? '12PM' : hour_str;

    console.log(`Creating Server Hour Group for hour ${hour_str}`);

    return (
        <div className="cursor-pointer border-b border-secondary_light p-4" onClick={headerClicked}>
            <div className="flex items-center">
                <div className="mr-2 transform transition-transform duration-500">
                    <IoIosArrowForward className={`${isWipeContainerHidden ? '' : 'rotate-90'}`} />
                </div>
                <div className="mr-2 text-lg font-bold">{hour_str}</div>
                <div className="text-secondary_light">{`(${wipe_dict.length} ${wipe_dict.length === 1 ? 'Server' : 'Servers'})`}</div>
            </div>
            <div className={`mt-4 ${isWipeContainerHidden ? 'hidden' : ''}`}>
                <div className="flex justify-between p-2 text-sm font-semibold text-secondary">
                    <div>{`Rank`}</div>
                    <div>{`Last Wipe`}</div>
                    <div>{`Server Title`}</div>
                </div>
                {wipe_dict.map((server, index) => (
                    <UpcomingServerRow key={index} id={`server-${server.id}`} server={server} />
                ))}
            </div>
        </div>
    );
}
