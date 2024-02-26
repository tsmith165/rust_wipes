'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import UpcomingServerRow from './UpcomingServerRow';
import { IoIosArrowForward } from 'react-icons/io';

export default function UpcomingServerHourGroup({ wipe_dict, wipe_hour }) {
    const [isWipeContainerHidden, setIsWipeContainerHidden] = useState(true);

    const headerClicked = () => {
        setIsWipeContainerHidden(!isWipeContainerHidden);
    };

    let hour_str = wipe_hour < 12 ? `${wipe_hour}AM` : `${wipe_hour - 12}PM`;
    hour_str = hour_str == '0AM' ? '12AM' : hour_str == '0PM' ? '12PM' : hour_str;

    console.log(`Creating Server Hour Group for hour ${hour_str} with servers (Next Line):`);
    //console.log(wipe_dict);

    console.log('Wipe array type: ' + typeof wipe_dict);
    console.log('Wipe array length: ' + Object.keys(wipe_dict).length);
    return (
        <div className="cursor-pointer border-b border-grey p-4" onClick={headerClicked}>
            <div className="flex items-center">
                <div className="mr-2 transform transition-transform duration-500">
                    <IoIosArrowForward className={`${isWipeContainerHidden ? '' : 'rotate-90'}`} />
                </div>
                <div className="mr-2 text-lg font-bold">{hour_str}</div>
                <div className="text-grey">{`(${Object.keys(wipe_dict).length} ${Object.keys(wipe_dict).length === 1 ? 'Server' : 'Servers'})`}</div>
            </div>
            <div className={`mt-4 ${isWipeContainerHidden ? 'hidden' : ''}`}>
                <div className="flex justify-between p-2 text-sm font-semibold text-dark">
                    <div>{`Rank`}</div>
                    <div>{`Last Wipe`}</div>
                    <div>{`Server Title`}</div>
                </div>
                {Object.entries(wipe_dict).map((key, server) => (
                    <UpcomingServerRow key={key} id={`server-${key}`} server={server} />
                ))}
            </div>
        </div>
    );
}

UpcomingServerHourGroup.propTypes = {
    wipe_dict: PropTypes.array.isRequired,
    wipe_hour: PropTypes.number.isRequired,
};
