'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import UpcomingServerRow from './UpcomingServerRow';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

export default function UpcomingServerHourGroup({ wipe_array, wipe_hour }) {
    const [isWipeContainerHidden, setIsWipeContainerHidden] = useState(true);

    const headerClicked = () => {
        setIsWipeContainerHidden(!isWipeContainerHidden);
    };

    let hour_str = wipe_hour < 12 ? `${wipe_hour}AM` : `${wipe_hour - 12}PM`;
    hour_str = hour_str == '0AM' ? '12AM' : hour_str == '0PM' ? '12PM' : hour_str;

    return (
        <div className="cursor-pointer border-b border-grey p-4" onClick={headerClicked}>
            <div className="flex items-center">
                <div className="mr-2 transform transition-transform duration-500">
                    <ArrowForwardIosRoundedIcon className={`${isWipeContainerHidden ? '' : 'rotate-90'}`} />
                </div>
                <div className="mr-2 text-lg font-bold">{hour_str}</div>
                <div className="text-grey">{`(${wipe_array.length} ${wipe_array.length === 1 ? 'Server' : 'Servers'})`}</div>
            </div>
            <div className={`mt-4 ${isWipeContainerHidden ? 'hidden' : ''}`}>
                <div className="flex justify-between p-2 text-sm font-semibold text-dark">
                    <div>{`Rank`}</div>
                    <div>{`Last Wipe`}</div>
                    <div>{`Server Title`}</div>
                </div>
                {wipe_array.map((server, i) => (
                    <UpcomingServerRow key={i} id={`server-${i}`} server={server} />
                ))}
            </div>
        </div>
    );
}

UpcomingServerHourGroup.propTypes = {
    wipe_array: PropTypes.array.isRequired,
    wipe_hour: PropTypes.number.isRequired,
};
