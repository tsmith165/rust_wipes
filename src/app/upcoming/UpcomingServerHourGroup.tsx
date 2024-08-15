'use client';

import React, { useState } from 'react';
import UpcomingServerRow from './UpcomingServerRow';
import { IoIosArrowForward } from 'react-icons/io';

interface ServerData {
    id: number;
    rank: number;
    title: string;
    wipe_hour: number;
    last_wipe: string;
    next_wipe: string;
    is_full_wipe: boolean;
}

interface UpcomingServerHourGroupProps {
    wipe_dict: ServerData[];
    wipe_hour: number;
}

const col_1_width =
    'w-[calc(calc(100%-16px)*0.20)] xs:w-[calc(calc(100%-16px)*0.12)] sm:w-[calc(calc(100%-16px)*0.10)] md:w-[calc(calc(100%-16px)*0.12)] lg:!w-[calc(calc(100%-16px)*0.10)]';
const col_2_width = 'hidden lg:!block lg:!w-[calc(calc(100%-16px)*0.175)]';
const col_3_width =
    'w-[calc(calc(100%-16px)*0.35)] xs:w-[calc(calc(100%-16px)*0.18)] sm:w-[calc(calc(100%-16px)*0.20)] md:w-[calc(calc(100%-16px)*0.23)] lg:!w-[calc(calc(100%-16px)*0.175)]';
const col_4_width =
    'w-[calc(calc(100%-16px)*0.40)] xs:w-[calc(calc(100%-16px)*0.70)] sm:w-[calc(calc(100%-16px)*0.70)] md:w-[calc(calc(100%-16px)*0.65)] lg:!w-[calc(calc(100%-16px)*0.55)]';

export default function UpcomingServerHourGroup({ wipe_dict, wipe_hour }: UpcomingServerHourGroupProps) {
    const [isWipeContainerHidden, setIsWipeContainerHidden] = useState(true);

    const headerClicked = () => {
        setIsWipeContainerHidden(!isWipeContainerHidden);
    };

    let hour_str = wipe_hour < 12 ? `${wipe_hour === 0 ? 12 : wipe_hour}AM` : `${wipe_hour === 12 ? 12 : wipe_hour - 12}PM`;

    return (
        <div className={`${isWipeContainerHidden ? 'bg-stone-400' : 'bg-stone-500'} w-full cursor-pointer border-b border-stone-700 p-4`}>
            <div className="flex items-center text-primary" onClick={headerClicked}>
                <div className="mr-2 transform transition-transform duration-500">
                    <IoIosArrowForward className={`${isWipeContainerHidden ? '' : 'rotate-90'}`} />
                </div>
                <div className="mr-2 text-lg font-bold">{hour_str}</div>
                <div>{`(${wipe_dict.length} ${wipe_dict.length === 1 ? 'Server' : 'Servers'})`}</div>
            </div>
            <div className={`mt-4 w-full  ${isWipeContainerHidden ? 'hidden' : ''}`}>
                <div className="flex space-x-2 rounded-t-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-primary_light">
                    <div className={`${col_1_width}`}>Rank</div>
                    <div className={`${col_2_width}`}>Last Wipe</div>
                    <div className={`${col_3_width}`}>Next Wipe</div>
                    <div className={`${col_4_width}`}>Server Title</div>
                </div>
                {wipe_dict.map((server, index) => (
                    <UpcomingServerRow key={index} id={`server-${server.id}`} server={server} />
                ))}
            </div>
        </div>
    );
}
