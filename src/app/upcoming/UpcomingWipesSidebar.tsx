'use client';

import React, { useState, useEffect } from 'react';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputDatePicker from '@/components/inputs/InputDatePicker';
import moment from 'moment-timezone';
import {
    standardTimeOptions,
    daylightTimeOptions,
    regionSelectOptions,
    rateSelectOptions,
    groupSelectOptions,
    modeSelectOptions,
} from './constants';
import { SearchParamsType } from './parsers';

interface UpcomingWipesSidebarProps {
    searchParams: Partial<SearchParamsType>;
    onUpdateSearchParams: (updates: Partial<SearchParamsType>) => void;
}

const UpcomingWipesSidebar: React.FC<UpcomingWipesSidebarProps> = ({ searchParams, onUpdateSearchParams }) => {
    const [timeOptions, setTimeOptions] = useState<[string, string][]>([]);

    return (
        <div className="h-fit w-full space-y-2 p-2.5 md:h-full">
            <div className="flex">
                <InputDatePicker
                    idName="date"
                    name="date"
                    defaultValue={searchParams.date || moment().format('YYYY-MM-DD')}
                    onChange={(date) => onUpdateSearchParams({ date: moment(date).format('YYYY-MM-DD') })}
                />
            </div>
            <div className="flex">
                <InputTextbox
                    idName="min_rank"
                    name="min_rank"
                    placeholder="Min Rank"
                    value={searchParams.min_rank}
                    onChange={(e) => onUpdateSearchParams({ min_rank: e.target.value })}
                />
            </div>
            <InputSelect<string>
                idName="time_zone"
                name="time_zone"
                select_options={timeOptions}
                defaultValue={{
                    value: searchParams.time_zone || '-7',
                    label: timeOptions.find((option) => option[0] === (searchParams.time_zone || '-7'))?.[1] || 'Pacific Time',
                }}
                onChange={(value) => onUpdateSearchParams({ time_zone: value })}
            />
            <InputSelect<SearchParamsType['region']>
                idName="region"
                name="region"
                select_options={regionSelectOptions as [SearchParamsType['region'], string][]}
                defaultValue={{
                    value: searchParams.region || 'US',
                    label: regionSelectOptions.find((option) => option[0] === (searchParams.region || 'US'))?.[1] || 'US',
                }}
                onChange={(value) => onUpdateSearchParams({ region: value })}
            />
            <InputSelect<SearchParamsType['resource_rate']>
                idName="resource_rate"
                name="resources"
                select_options={rateSelectOptions as [SearchParamsType['resource_rate'], string][]}
                defaultValue={{
                    value: searchParams.resource_rate || 'any',
                    label:
                        rateSelectOptions.find((option) => option[0] === (searchParams.resource_rate || 'any'))?.[1] || 'Any Resource Rate',
                }}
                onChange={(value) => onUpdateSearchParams({ resource_rate: value })}
            />
            <InputSelect<SearchParamsType['group_limit']>
                idName="group_limit"
                name="group_limit"
                select_options={groupSelectOptions as [SearchParamsType['group_limit'], string][]}
                defaultValue={{
                    value: searchParams.group_limit || 'any',
                    label: groupSelectOptions.find((option) => option[0] === (searchParams.group_limit || 'any'))?.[1] || 'Any Group Limit',
                }}
                onChange={(value) => onUpdateSearchParams({ group_limit: value })}
            />
            <InputSelect<SearchParamsType['game_mode']>
                idName="game_mode"
                name="game_mode"
                select_options={modeSelectOptions as [SearchParamsType['game_mode'], string][]}
                defaultValue={{
                    value: searchParams.game_mode || 'any',
                    label: modeSelectOptions.find((option) => option[0] === (searchParams.game_mode || 'any'))?.[1] || 'Any Game Mode',
                }}
                onChange={(value) => onUpdateSearchParams({ game_mode: value })}
            />
        </div>
    );
};

export default UpcomingWipesSidebar;
