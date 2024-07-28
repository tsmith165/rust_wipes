import React from 'react';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputDatePicker from '@/components/inputs/InputDatePicker';

const UpcomingWipesSidebar = () => {
    // Define select options
    const timeSelectOptions: [string, string][] = [
        ['-10', 'Hawaii (UTC-10:00)'],
        ['-9', 'Alaska (UTC-09:00)'],
        ['-7', 'Pacific (UTC-07:00)'],
        ['-6', 'Mountain (UTC-06:00)'],
        ['-5', 'Central (UTC-05:00)'],
        ['-4', 'Eastern (UTC-04:00)'],
        ['-3', 'Atlantic (UTC-03:00)'],
        ['0', 'Coordinated Universal Time (UTC)'],
        ['1', 'UTC+1:00'],
        ['2', 'UTC+2:00'],
        ['3', 'UTC+3:00'],
        ['4', 'UTC+4:00'],
        ['5', 'UTC+5:00'],
        ['6', 'UTC+6:00'],
        ['7', 'UTC+7:00'],
        ['8', 'UTC+8:00'],
        ['9', 'UTC+9:00'],
        ['10', 'UTC+10:00'],
        ['11', 'UTC+11:00'],
        ['12', 'UTC+12:00'],
        ['13', 'UTC+13:00'],
    ];
    const regionSelectOptions: [string, string][] = [['US', 'US']];
    const rateSelectOptions: [string, string][] = [
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
    const groupSelectOptions: [string, string][] = [
        ['any', 'Any Group Limit'],
        ['solo', 'Solo'],
        ['duo', 'Duo'],
        ['trio', 'Trio'],
        ['quad', 'Quad'],
        ['no limit', 'No Limit'],
    ];
    const modeSelectOptions: [string, string][] = [
        ['any', 'Any Game Mode'],
        ['pvp', 'PvP'],
        ['pve', 'PvE'],
        ['arena', 'Arena'],
        ['build', 'Build'],
    ];

    return (
        <form
            action="/upcoming"
            method="GET"
            className="h-fit space-y-2 bg-secondary p-2.5 md-nav:h-full"
            style={{ flex: '1 1 35%', minHeight: '20px' }}
        >
            {/* Filter Row 1 */}
            <div className="flex">
                <InputDatePicker name="date" defaultValue={new Date()} />
            </div>
            <div className="flex">
                <InputTextbox name="min_rank" placeholder="Min Rank" />
            </div>
            <div className="flex">
                <InputSelect
                    name="time_zone"
                    select_options={timeSelectOptions}
                    defaultValue={{ value: timeSelectOptions[2][0], label: timeSelectOptions[2][1] }}
                />
            </div>
            <div className="flex">
                <InputSelect
                    name="region"
                    select_options={regionSelectOptions}
                    defaultValue={{ value: regionSelectOptions[0][0], label: regionSelectOptions[0][1] }}
                />
            </div>
            <div className="flex">
                <InputSelect
                    name="resources"
                    select_options={rateSelectOptions}
                    defaultValue={{ value: rateSelectOptions[0][0], label: rateSelectOptions[0][1] }}
                />
            </div>
            <div className="flex">
                <InputSelect
                    name="group_limit"
                    select_options={groupSelectOptions}
                    defaultValue={{ value: groupSelectOptions[0][0], label: groupSelectOptions[0][1] }}
                />
            </div>
            <div className="flex">
                <InputSelect
                    name="game_mode"
                    select_options={modeSelectOptions}
                    defaultValue={{ value: modeSelectOptions[0][0], label: modeSelectOptions[0][1] }}
                />
            </div>
            <button type="submit" className="mt-2 rounded bg-primary px-2.5 py-2 font-bold text-white hover:bg-primary_light">
                Update Filters
            </button>
        </form>
    );
};

export default UpcomingWipesSidebar;
