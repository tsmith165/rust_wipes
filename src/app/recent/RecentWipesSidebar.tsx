'use client';

import React from 'react';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import { HiRefresh } from 'react-icons/hi';
import { FaRegThumbsUp } from 'react-icons/fa';
import HeatIndexKeyMap from './HeatIndexKeyMap';
import { Tooltip } from 'react-tooltip';

const RENDER_ADS = false;

interface RecentWipesSidebarProps {
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    onRefresh: () => void;
    isLoading: boolean;
    autoRefreshActive: boolean;
    setAutoRefreshActive: (active: boolean) => void;
    onUpdateSearchParams: (updates: Record<string, string>) => void;
}

const RecentWipesSidebar: React.FC<RecentWipesSidebarProps> = ({
    searchParams,
    onRefresh,
    isLoading,
    autoRefreshActive,
    setAutoRefreshActive,
    onUpdateSearchParams,
}) => {
    let filterColumnAdContainer = null;
    if (RENDER_ADS) {
        filterColumnAdContainer = (
            <div className={'h-full w-full'}>
                <div className={'p-2.5'}>{/* Ad script and elements */}</div>
                <div className={'flex h-full w-full space-x-2 bg-secondary p-2.5'}>
                    <div className={'styles.ad_blocked_message'}>Please Disable Ad-Block To Support The Developers</div>
                    <FaRegThumbsUp className={'h-10 w-10 rounded-md bg-primary_light p-2'} />
                </div>
            </div>
        );
    }

    const handleRefreshclick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setAutoRefreshActive(!autoRefreshActive);
        if (!autoRefreshActive) {
            onRefresh();
        }
    };

    const countryOptions: [string, string][] = [
        ['US', 'United States'],
        ['EU', 'Europe'],
        ['AS', 'Asia'],
    ];

    const groupLimitOptions: [string, string][] = [
        ['any', 'Any Group Limit'],
        ['solo', 'Solo'],
        ['duo', 'Duo'],
        ['trio', 'Trio'],
        ['quad', 'Quad'],
        ['no limit', 'No Limit'],
    ];

    const resourceRateOptions: [string, string][] = [
        ['any', 'Any Resource Rate'],
        ['1x', '1x'],
        ['2x', '2x'],
        ['3x', '3x'],
        ['5x', '5x'],
        ['10x', '10x'],
    ];

    return (
        <div className="flex max-h-full flex-col bg-stone-800">
            <form>
                <div className="flex flex-col space-y-2 p-2">
                    <div className="flex w-full flex-row space-x-2">
                        <InputTextbox
                            idName="minPlayers"
                            name="Min Players"
                            value={(searchParams?.minPlayers as string) || '0'}
                            placeholder="Min Players"
                            onChange={(e) => onUpdateSearchParams({ minPlayers: e.target.value })}
                        />
                        <InputTextbox
                            idName="maxDist"
                            name="Distance"
                            value={(searchParams?.maxDist as string) || '5000'}
                            placeholder="Max Dist"
                            onChange={(e) => onUpdateSearchParams({ maxDist: e.target.value })}
                        />
                    </div>
                    <div className="flex w-full flex-row space-x-2">
                        <InputTextbox
                            idName="minRank"
                            name="Min Rank"
                            value={(searchParams?.minRank as string) || '0'}
                            placeholder="Min Rank"
                            onChange={(e) => onUpdateSearchParams({ minRank: e.target.value })}
                        />
                        <InputTextbox
                            idName="maxRank"
                            name="Max Rank"
                            value={(searchParams?.maxRank as string) || '10000'}
                            placeholder="Max Rank"
                            onChange={(e) => onUpdateSearchParams({ maxRank: e.target.value })}
                        />
                    </div>
                    <InputSelect
                        idName="groupLimit"
                        name="Group Size"
                        select_options={groupLimitOptions}
                        defaultValue={{
                            value: (searchParams?.groupLimit as string) || 'any',
                            label:
                                groupLimitOptions.find((option) => option[0] === ((searchParams?.groupLimit as string) || 'any'))?.[1] ||
                                'Any Group Limit',
                        }}
                        onChange={(value) => onUpdateSearchParams({ groupLimit: value })}
                    />
                    <InputSelect
                        idName="resourceRate"
                        name="Resources"
                        select_options={resourceRateOptions}
                        defaultValue={{
                            value: (searchParams?.resourceRate as string) || 'any',
                            label:
                                resourceRateOptions.find(
                                    (option) => option[0] === ((searchParams?.resourceRate as string) || 'any'),
                                )?.[1] || 'Any Resource Rate',
                        }}
                        onChange={(value) => onUpdateSearchParams({ resourceRate: value })}
                    />
                    <div className="flex w-full flex-row space-x-2">
                        <InputSelect
                            idName="country"
                            name="country"
                            select_options={countryOptions}
                            defaultValue={{
                                value: (searchParams?.country as string) || 'US',
                                label:
                                    countryOptions.find((option) => option[0] === ((searchParams?.country as string) || 'US'))?.[1] ||
                                    'United States',
                            }}
                            onChange={(value) => onUpdateSearchParams({ country: value })}
                        />
                        <button
                            type="button"
                            onClick={handleRefreshclick}
                            className={`h-[38px] w-[38px] rounded-md bg-primary p-1.5 hover:bg-primary_dark ${
                                isLoading ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            disabled={isLoading}
                            data-tooltip-id="refresh-tooltip"
                            data-tooltip-place="left"
                            data-tooltip-content={autoRefreshActive ? 'Turn Auto-Refresh Off' : 'Turn Auto-Refresh On'}
                        >
                            <HiRefresh className={`mx-auto h-full w-full ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <Tooltip id="refresh-tooltip" />
                    </div>
                </div>
                <HeatIndexKeyMap />
            </form>

            {filterColumnAdContainer}
        </div>
    );
};

export default RecentWipesSidebar;
