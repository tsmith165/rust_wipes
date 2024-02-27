import React from 'react';
import InputComponent from '../../InputComponent';

const UpcomingWipesSidebar = () => {
    // Define select options
    const timeSelectOptions = [
        [-10, 'Hawaii (UTC-10:00)'],
        [-9, 'Alaska (UTC-09:00)'],
        [-7, 'Pacific (UTC-07:00)'],
        [-6, 'Mountain (UTC-06:00)'],
        [-5, 'Central (UTC-05:00)'],
        [-4, 'Eastern (UTC-04:00)'],
        [-3, 'Atlantic (UTC-03:00)'],
        [0, 'Coordinated Universal Time (UTC)'],
        [1, 'UTC+1:00'],
        [2, 'UTC+2:00'],
        [3, 'UTC+3:00'],
        [4, 'UTC+4:00'],
        [5, 'UTC+5:00'],
        [6, 'UTC+6:00'],
        [7, 'UTC+7:00'],
        [8, 'UTC+8:00'],
        [9, 'UTC+9:00'],
        [10, 'UTC+10:00'],
        [11, 'UTC+11:00'],
        [12, 'UTC+12:00'],
        [13, 'UTC+13:00'],
    ];
    const regionSelectOptions = [['US', 'US']];
    const rateSelectOptions = [
        ['any', 'Any Resource Rate'],
        ['1x', '1x'],
        ['1.5x', '1.5x'],
        ['2x', '2x'],
        ['3x', '3x'],
        ['5x', '5x'],
        ['10x', '10x'],
        ['100x', '100x'],
        ['1000x', '1000x'],
    ];
    const groupSelectOptions = [
        ['any', 'Any Group Limit'],
        ['solo', 'Solo'],
        ['duo', 'Duo'],
        ['trio', 'Trio'],
        ['quad', 'Quad'],
        ['no limit', 'No Limit'],
    ];
    const modeSelectOptions = [
        ['any', 'Any Game Mode'],
        ['pvp', 'PvP'],
        ['pve', 'PvE'],
        ['arena', 'Arena'],
        ['build', 'Build'],
    ];

    return (
        <form action="/upcoming" method="GET" className="bg-black p-4 md-nav:min-h-full">
            {/* Filter Row 1 */}
            <div className="flex flex-row space-x-4 pb-4">
                <InputComponent
                    type="input_datepicker"
                    defaultValue={new Date()}
                    param_name="date"
                    param_full_name="Date"
                    className="mr-0 w-full"
                />
                <InputComponent type="input" defaultValue={5000} param_name="minRank" param_full_name="Min Rank" />
            </div>

            {/* Filter Row 2 */}
            <div className="flex flex-row space-x-4 pb-4">
                <InputComponent
                    type="input_select"
                    defaultValue={timeSelectOptions[2][0]}
                    param_name="time"
                    param_full_name="Time"
                    select_options={timeSelectOptions}
                />
                <InputComponent
                    type="input_select"
                    defaultValue={regionSelectOptions[0][0]}
                    param_name="region"
                    param_full_name="Region"
                    select_options={regionSelectOptions}
                />
            </div>

            {/* Filter Row 3 */}
            <div className="flex flex-row space-x-4 pb-4">
                <InputComponent
                    type="input_select"
                    defaultValue={rateSelectOptions[0][0]}
                    param_name="rate"
                    param_full_name="Rate"
                    select_options={rateSelectOptions}
                />
                <InputComponent
                    type="input_select"
                    defaultValue={groupSelectOptions[0][0]}
                    param_name="goups"
                    param_full_name="Groups"
                    select_options={groupSelectOptions}
                />
            </div>

            {/* Filter Row 4 */}
            <div className="flex">
                <InputComponent
                    type="input_select"
                    defaultValue={modeSelectOptions[0][0]}
                    param_name="mode"
                    param_full_name="Mode"
                    select_options={modeSelectOptions}
                />
                {/* <div className="flex-grow text-left text-2xl font-bold text-primary">{wipe_day_header_str}</div> */}
            </div>
            <button type="submit" className="mt-4 rounded bg-primary px-4 py-2 font-bold text-white hover:bg-light">
                Update Filters
            </button>
        </form>
    );
};

export default UpcomingWipesSidebar;
