'use client';

import React from 'react';
import InputComponent from '../../InputComponent';

const UpcomingWipesSidebar = ({ state, update_filter_value }) => {
    // Extract properties from state for easier access
    const { date, region, resource_rate, group_limit, game_mode, wipe_day_header_str } = state;

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
        <div className="p-4 bg-dark min-h-full max-h-screen">
            {/* Filter Row 1 */}
            <div className="flex flex-row pb-4">
                <InputComponent
                    type="input_datepicker"
                    state={state}
                    name="Date"
                    update_filter_value={update_filter_value}
                />
                <InputComponent
                    type="input_split"
                    default={5000}
                    name="Min Rank"
                    update_filter_value={update_filter_value}
                />
            </div>

            {/* Filter Row 2 */}
            <div className="flex flex-row pb-4">
                <InputComponent
                    type="input_select"
                    default={date}
                    name="Time"
                    update_filter_value={update_filter_value}
                    select_options={timeSelectOptions}
                />
                <InputComponent
                    type="input_select"
                    default={region}
                    name="Region"
                    update_filter_value={update_filter_value}
                    select_options={regionSelectOptions}
                />
            </div>

            {/* Filter Row 3 */}
            <div className="flex flex-row pb-4">
                <InputComponent
                    type="input_select"
                    default={resource_rate}
                    name="Rate"
                    update_filter_value={update_filter_value}
                    select_options={rateSelectOptions}
                />
                <InputComponent
                    type="input_select"
                    default={group_limit}
                    name="Groups"
                    update_filter_value={update_filter_value}
                    select_options={groupSelectOptions}
                />
            </div>

            {/* Filter Row 4 */}
            <div className="flex">
                <InputComponent
                    type="input_select"
                    default={game_mode}
                    name="Mode"
                    update_filter_value={update_filter_value}
                    select_options={modeSelectOptions}
                />
                <div className="flex-grow text-left text-2xl font-bold text-secondary">
                    {wipe_day_header_str}
                </div>
            </div>
        </div>
    );
};

export default UpcomingWipesSidebar;
