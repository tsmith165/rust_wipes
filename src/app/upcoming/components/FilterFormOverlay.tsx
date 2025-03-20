'use client';

import React, { useMemo } from 'react';
import { X, XCircle } from 'lucide-react';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import { Globe, Trophy, UsersRound, Package2, Gamepad2, Clock } from 'lucide-react';
import { regionSelectOptions, rateSelectOptions, groupSelectOptions, modeSelectOptions, standardTimeOptions } from '../constants';

// Default values for filters
const DEFAULT_FILTER_VALUES = {
    region: 'US',
    min_rank: '5000',
    group_limit: 'any',
    resource_rate: 'any',
    game_mode: 'any',
    time_zone: '-7',
};

interface FilterFormOverlayProps {
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    isOpen: boolean;
    onClose: () => void;
    onUpdateSearchParams: (updates: Record<string, string>) => void;
}

export default function FilterFormOverlay({ searchParams, isOpen, onClose, onUpdateSearchParams }: FilterFormOverlayProps) {
    const regionOptions = useMemo<[string, string][]>(() => regionSelectOptions, []);
    const resourceRateOptions = useMemo<[string, string][]>(() => rateSelectOptions, []);
    const groupLimitOptions = useMemo<[string, string][]>(() => groupSelectOptions, []);
    const gameModeOptions = useMemo<[string, string][]>(() => modeSelectOptions, []);
    const timeZoneOptions = useMemo<[string, string][]>(() => standardTimeOptions, []);

    // Find out which filters are active (different from default)
    const activeFilters = useMemo(() => {
        const active: Record<string, { label: string; value: string }> = {};

        // Check region
        if ((searchParams?.region as string) !== DEFAULT_FILTER_VALUES.region && searchParams?.region) {
            const regionLabel = regionOptions.find((option) => option[0] === searchParams.region)?.[1] || searchParams.region;
            active.region = {
                label: 'Region',
                value: regionLabel as string,
            };
        }

        // Check min rank
        if ((searchParams?.min_rank as string) !== DEFAULT_FILTER_VALUES.min_rank && searchParams?.min_rank) {
            active.min_rank = {
                label: 'Min Rank',
                value: searchParams.min_rank as string,
            };
        }

        // Check group limit
        if ((searchParams?.group_limit as string) !== DEFAULT_FILTER_VALUES.group_limit && searchParams?.group_limit) {
            const groupLabel = groupLimitOptions.find((option) => option[0] === searchParams.group_limit)?.[1] || searchParams.group_limit;
            active.group_limit = {
                label: 'Group Size',
                value: groupLabel as string,
            };
        }

        // Check resource rate
        if ((searchParams?.resource_rate as string) !== DEFAULT_FILTER_VALUES.resource_rate && searchParams?.resource_rate) {
            const resourceLabel =
                resourceRateOptions.find((option) => option[0] === searchParams.resource_rate)?.[1] || searchParams.resource_rate;
            active.resource_rate = {
                label: 'Resources',
                value: resourceLabel as string,
            };
        }

        // Check game mode
        if ((searchParams?.game_mode as string) !== DEFAULT_FILTER_VALUES.game_mode && searchParams?.game_mode) {
            const modeLabel = gameModeOptions.find((option) => option[0] === searchParams.game_mode)?.[1] || searchParams.game_mode;
            active.game_mode = {
                label: 'Game Mode',
                value: modeLabel as string,
            };
        }

        // Check time zone
        if ((searchParams?.time_zone as string) !== DEFAULT_FILTER_VALUES.time_zone && searchParams?.time_zone) {
            const timeZoneLabel = timeZoneOptions.find((option) => option[0] === searchParams.time_zone)?.[1] || searchParams.time_zone;
            active.time_zone = {
                label: 'Time Zone',
                value: timeZoneLabel as string,
            };
        }

        return active;
    }, [searchParams, regionOptions, groupLimitOptions, resourceRateOptions, gameModeOptions, timeZoneOptions]);

    // Reset all filters to default values
    const resetAllFilters = () => {
        onUpdateSearchParams(DEFAULT_FILTER_VALUES);
        onClose();
    };

    // Remove a single filter
    const removeFilter = (key: string) => {
        onUpdateSearchParams({ [key]: DEFAULT_FILTER_VALUES[key as keyof typeof DEFAULT_FILTER_VALUES] });
    };

    // Handle text input changes with support for empty values
    const handleTextInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // If the value is empty, use the default value instead
        if (newValue === '') {
            onUpdateSearchParams({ [key]: DEFAULT_FILTER_VALUES[key as keyof typeof DEFAULT_FILTER_VALUES] });
        } else {
            onUpdateSearchParams({ [key]: newValue });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-st_darkest/80 backdrop-blur-sm">
            <div
                className={`absolute right-0 h-full w-full max-w-md overflow-y-auto bg-st_dark p-6 shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-primary_light">Filter Wipes</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-st_lightest transition-colors hover:bg-st_darkest hover:text-primary_light"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Non-Default Filters Summary */}
                {Object.keys(activeFilters).length > 0 && (
                    <div className="mb-6 rounded-lg bg-st_darkest p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="font-medium text-st_lightest">Non-Default Filters</h3>
                            <button onClick={resetAllFilters} className="text-xs text-st_light hover:text-primary_light">
                                Reset All
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(activeFilters).map(([key, filter]) => (
                                <div key={key} className="flex items-center rounded-full bg-st px-3 py-1 text-xs text-st_lightest">
                                    <span className="mr-1 font-medium">{filter.label}:</span>
                                    <span>{filter.value}</span>
                                    <button onClick={() => removeFilter(key)} className="ml-1 text-st_light hover:text-primary_light">
                                        <XCircle size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <form className="w-full">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Region */}
                        <div>
                            <InputSelect
                                idName="region"
                                name="Region"
                                icon={<Globe size={18} />}
                                select_options={regionOptions}
                                defaultValue={{
                                    value: (searchParams?.region as string) || 'US',
                                    label:
                                        regionOptions.find((option) => option[0] === ((searchParams?.region as string) || 'US'))?.[1] ||
                                        'US',
                                }}
                                onChange={(value) => onUpdateSearchParams({ region: value })}
                                className="bg-st_darkest"
                            />
                        </div>

                        {/* Min Rank */}
                        <div>
                            <InputTextbox
                                idName="min_rank"
                                name="Min Rank"
                                icon={<Trophy size={18} />}
                                value={(searchParams?.min_rank as string) || ''}
                                placeholder={DEFAULT_FILTER_VALUES.min_rank}
                                onChange={handleTextInputChange('min_rank')}
                                className="bg-st_darker"
                            />
                        </div>

                        {/* Group Limit */}
                        <div>
                            <InputSelect
                                idName="group_limit"
                                name="Group Size"
                                icon={<UsersRound size={18} />}
                                select_options={groupLimitOptions}
                                defaultValue={{
                                    value: (searchParams?.group_limit as string) || 'any',
                                    label:
                                        groupLimitOptions.find(
                                            (option) => option[0] === ((searchParams?.group_limit as string) || 'any'),
                                        )?.[1] || 'Any Group Limit',
                                }}
                                onChange={(value) => onUpdateSearchParams({ group_limit: value })}
                                className="bg-st_darkest"
                            />
                        </div>

                        {/* Resource Rate */}
                        <div>
                            <InputSelect
                                idName="resource_rate"
                                name="Resources"
                                icon={<Package2 size={18} />}
                                select_options={resourceRateOptions}
                                defaultValue={{
                                    value: (searchParams?.resource_rate as string) || 'any',
                                    label:
                                        resourceRateOptions.find(
                                            (option) => option[0] === ((searchParams?.resource_rate as string) || 'any'),
                                        )?.[1] || 'Any Resource Rate',
                                }}
                                onChange={(value) => onUpdateSearchParams({ resource_rate: value })}
                                className="bg-st_darkest"
                            />
                        </div>

                        {/* Game Mode */}
                        <div>
                            <InputSelect
                                idName="game_mode"
                                name="Game Mode"
                                icon={<Gamepad2 size={18} />}
                                select_options={gameModeOptions}
                                defaultValue={{
                                    value: (searchParams?.game_mode as string) || 'any',
                                    label:
                                        gameModeOptions.find(
                                            (option) => option[0] === ((searchParams?.game_mode as string) || 'any'),
                                        )?.[1] || 'Any Game Mode',
                                }}
                                onChange={(value) => onUpdateSearchParams({ game_mode: value })}
                                className="bg-st_darkest"
                            />
                        </div>

                        {/* Time Zone */}
                        <div>
                            <InputSelect
                                idName="time_zone"
                                name="Time Zone"
                                icon={<Clock size={18} />}
                                select_options={timeZoneOptions}
                                defaultValue={{
                                    value: (searchParams?.time_zone as string) || '-7',
                                    label:
                                        timeZoneOptions.find(
                                            (option) => option[0] === ((searchParams?.time_zone as string) || '-7'),
                                        )?.[1] || 'Mountain Standard Time (UTC-07:00)',
                                }}
                                onChange={(value) => onUpdateSearchParams({ time_zone: value })}
                                className="bg-st_darkest"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={resetAllFilters}
                            className="rounded-lg border border-st_light px-4 py-2 text-sm font-medium text-st_lightest hover:border-primary hover:text-primary_light focus:outline-none"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-st_white hover:bg-primary_light focus:outline-none"
                        >
                            Apply
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
