import React from 'react';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputDatePicker from '@/components/inputs/InputDatePicker';

interface UpcomingWipesSidebarProps {
    searchParams: {
        date?: string;
        min_rank?: string;
        time_zone?: string;
        region?: string;
        resource_rate?: string;
        group_limit?: string;
        game_mode?: string;
    };
}

const UpcomingWipesSidebar: React.FC<UpcomingWipesSidebarProps> = ({ searchParams }) => {
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
    const regionSelectOptions: [string, string][] = [
        ['US', 'US'],
        ['EU', 'EU'],
        ['AS', 'AS'],
    ];
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
        <form action="/upcoming" method="GET" className="h-fit w-full space-y-2 p-2.5 md:h-full">
            <div className="flex">
                <InputDatePicker idName="date" name="date" defaultValue={searchParams.date ? new Date(searchParams.date) : new Date()} />
            </div>
            <div className="flex">
                <InputTextbox idName="min_rank" name="min_rank" placeholder="Min Rank" value={searchParams.min_rank || '5000'} />
            </div>
            <div className="flex">
                <InputSelect
                    idName="time_zone"
                    name="time_zone"
                    select_options={timeSelectOptions}
                    defaultValue={{
                        value: searchParams.time_zone || timeSelectOptions[2][0],
                        label: timeSelectOptions.find((option) => option[0] === searchParams.time_zone)?.[1] || timeSelectOptions[2][1],
                    }}
                />
            </div>
            <div className="flex">
                <InputSelect
                    idName="region"
                    name="region"
                    select_options={regionSelectOptions}
                    defaultValue={{
                        value: searchParams.region || regionSelectOptions[0][0],
                        label: regionSelectOptions.find((option) => option[0] === searchParams.region)?.[1] || regionSelectOptions[0][1],
                    }}
                />
            </div>
            <div className="flex">
                <InputSelect
                    idName="resource_rate"
                    name="resources"
                    select_options={rateSelectOptions}
                    defaultValue={{
                        value: searchParams.resource_rate || rateSelectOptions[0][0],
                        label: rateSelectOptions.find((option) => option[0] === searchParams.resource_rate)?.[1] || rateSelectOptions[0][1],
                    }}
                />
            </div>
            <div className="flex">
                <InputSelect
                    idName="group_limit"
                    name="group_limit"
                    select_options={groupSelectOptions}
                    defaultValue={{
                        value: searchParams.group_limit || groupSelectOptions[0][0],
                        label: groupSelectOptions.find((option) => option[0] === searchParams.group_limit)?.[1] || groupSelectOptions[0][1],
                    }}
                />
            </div>
            <div className="flex">
                <InputSelect
                    idName="game_mode"
                    name="game_mode"
                    select_options={modeSelectOptions}
                    defaultValue={{
                        value: searchParams.game_mode || modeSelectOptions[0][0],
                        label: modeSelectOptions.find((option) => option[0] === searchParams.game_mode)?.[1] || modeSelectOptions[0][1],
                    }}
                />
            </div>
            <button type="submit" className="mt-2 rounded bg-primary px-2.5 py-2 font-bold text-white hover:bg-primary_light">
                Update Filters
            </button>
        </form>
    );
};

export default UpcomingWipesSidebar;
