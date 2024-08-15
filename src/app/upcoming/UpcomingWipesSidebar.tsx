'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputDatePicker from '@/components/inputs/InputDatePicker';
import moment from 'moment-timezone';

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
    const router = useRouter();
    const currentSearchParams = useSearchParams();

    const updateSearchParams = (key: string, value: string) => {
        const params = new URLSearchParams(currentSearchParams.toString());
        params.set(key, value);
        router.push(`/upcoming?${params.toString()}`);
    };

    const standardTimeOptions: [string, string][] = [
        ['-10', 'Hawaii-Aleutian Standard Time (UTC-10:00)'],
        ['-9', 'Alaska Standard Time (UTC-09:00)'],
        ['-8', 'Pacific Standard Time (UTC-08:00)'],
        ['-7', 'Mountain Standard Time (UTC-07:00)'],
        ['-6', 'Central Standard Time (UTC-06:00)'],
        ['-5', 'Eastern Standard Time (UTC-05:00)'],
        ['-4', 'Atlantic Standard Time (UTC-04:00)'],
        ['0', 'Coordinated Universal Time (UTC)'],
        ['1', 'Central European Time (UTC+01:00)'],
        ['2', 'Eastern European Time (UTC+02:00)'],
        ['3', 'Moscow Standard Time (UTC+03:00)'],
        ['4', 'Gulf Standard Time (UTC+04:00)'],
        ['5', 'Pakistan Standard Time (UTC+05:00)'],
        ['6', 'Bangladesh Standard Time (UTC+06:00)'],
        ['7', 'Indochina Time (UTC+07:00)'],
        ['8', 'China Standard Time (UTC+08:00)'],
        ['9', 'Japan Standard Time (UTC+09:00)'],
        ['10', 'Australian Eastern Standard Time (UTC+10:00)'],
        ['11', 'Solomon Islands Time (UTC+11:00)'],
        ['12', 'New Zealand Standard Time (UTC+12:00)'],
        ['13', 'Samoa Standard Time (UTC+13:00)'],
    ];

    const daylightTimeOptions: [string, string][] = [
        ['-9', 'Hawaii-Aleutian Daylight Time (UTC-09:00)'],
        ['-8', 'Alaska Daylight Time (UTC-08:00)'],
        ['-7', 'Pacific Daylight Time (UTC-07:00)'],
        ['-6', 'Mountain Daylight Time (UTC-06:00)'],
        ['-5', 'Central Daylight Time (UTC-05:00)'],
        ['-4', 'Eastern Daylight Time (UTC-04:00)'],
        ['-3', 'Atlantic Daylight Time (UTC-03:00)'],
        ['0', 'Coordinated Universal Time (UTC)'],
        ['2', 'Central European Summer Time (UTC+02:00)'],
        ['3', 'Eastern European Summer Time (UTC+03:00)'],
        ['4', 'Moscow Daylight Time (UTC+04:00)'],
        ['5', 'Gulf Daylight Time (UTC+05:00)'],
        ['6', 'Pakistan Daylight Time (UTC+06:00)'],
        ['7', 'Bangladesh Daylight Time (UTC+07:00)'],
        ['8', 'Indochina Daylight Time (UTC+08:00)'],
        ['9', 'China Daylight Time (UTC+09:00)'],
        ['10', 'Japan Daylight Time (UTC+10:00)'],
        ['11', 'Australian Eastern Daylight Time (UTC+11:00)'],
        ['12', 'Solomon Islands Daylight Time (UTC+12:00)'],
        ['13', 'New Zealand Daylight Time (UTC+13:00)'],
        ['14', 'Samoa Daylight Time (UTC+14:00)'],
    ];

    const isDST = useMemo(() => {
        const now = moment();
        return now.isDST();
    }, []);

    const timeSelectOptions = isDST ? daylightTimeOptions : standardTimeOptions;

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
        <div className="h-fit w-full space-y-2 p-2.5 md:h-full">
            <div className="flex">
                <InputDatePicker
                    idName="date"
                    name="date"
                    defaultValue={searchParams.date || moment().format('YYYY-MM-DD')}
                    onChange={(date) => updateSearchParams('date', moment(date).format('YYYY-MM-DD'))}
                />
            </div>
            <div className="flex">
                <InputTextbox
                    idName="min_rank"
                    name="min_rank"
                    placeholder="Min Rank"
                    value={searchParams.min_rank}
                    onChange={(e) => updateSearchParams('min_rank', e.target.value)}
                />
            </div>
            <InputSelect
                idName="time_zone"
                name="time_zone"
                select_options={timeSelectOptions}
                defaultValue={{
                    value: searchParams.time_zone || '-7',
                    label:
                        timeSelectOptions.find((option) => option[0] === (searchParams.time_zone || '-7'))?.[1] ||
                        (isDST ? 'Pacific Daylight Time (UTC-07:00)' : 'Pacific Standard Time (UTC-08:00)'),
                }}
                onChange={(value) => updateSearchParams('time_zone', value)} // Now passing a string value
            />
            <InputSelect
                idName="region"
                name="region"
                select_options={regionSelectOptions}
                defaultValue={{
                    value: searchParams.region || 'US',
                    label: regionSelectOptions.find((option) => option[0] === (searchParams.region || 'US'))?.[1] || 'US',
                }}
                onChange={(value) => updateSearchParams('region', value)}
            />
            <InputSelect
                idName="resource_rate"
                name="resources"
                select_options={rateSelectOptions}
                defaultValue={{
                    value: searchParams.resource_rate || 'any',
                    label:
                        rateSelectOptions.find((option) => option[0] === (searchParams.resource_rate || 'any'))?.[1] || 'Any Resource Rate',
                }}
                onChange={(value) => updateSearchParams('resource_rate', value)}
            />
            <InputSelect
                idName="group_limit"
                name="group_limit"
                select_options={groupSelectOptions}
                defaultValue={{
                    value: searchParams.group_limit || 'any',
                    label: groupSelectOptions.find((option) => option[0] === (searchParams.group_limit || 'any'))?.[1] || 'Any Group Limit',
                }}
                onChange={(value) => updateSearchParams('group_limit', value)}
            />
            <InputSelect
                idName="game_mode"
                name="game_mode"
                select_options={modeSelectOptions}
                defaultValue={{
                    value: searchParams.game_mode || 'any',
                    label: modeSelectOptions.find((option) => option[0] === (searchParams.game_mode || 'any'))?.[1] || 'Any Game Mode',
                }}
                onChange={(value) => updateSearchParams('game_mode', value)}
            />
        </div>
    );
};

export default UpcomingWipesSidebar;
