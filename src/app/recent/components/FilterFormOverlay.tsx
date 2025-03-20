'use client';

import React, { useMemo } from 'react';
import { X, XCircle } from 'lucide-react';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import { Users, Ruler, Trophy, UsersRound, Package2, Globe, List } from 'lucide-react';

// Default values for filters
const DEFAULT_FILTER_VALUES = {
    minPlayers: '0',
    maxDist: '5000',
    country: 'US',
    minRank: '0',
    maxRank: '10000',
    groupLimit: 'any',
    resourceRate: 'any',
    numServers: '10',
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
    const countryOptions = useMemo<[string, string][]>(
        () => [
            ['US', 'United States'],
            ['EU', 'Europe'],
            ['AS', 'Asia'],
        ],
        [],
    );

    const groupLimitOptions = useMemo<[string, string][]>(
        () => [
            ['any', 'Any Group Limit'],
            ['solo', 'Solo'],
            ['duo', 'Duo'],
            ['trio', 'Trio'],
            ['quad', 'Quad'],
            ['no limit', 'No Limit'],
        ],
        [],
    );

    const resourceRateOptions = useMemo<[string, string][]>(
        () => [
            ['any', 'Any Resource Rate'],
            ['1x', '1x'],
            ['2x', '2x'],
            ['3x', '3x'],
            ['5x', '5x'],
            ['10x', '10x'],
        ],
        [],
    );

    const numServersOptions = useMemo<[string, string][]>(
        () => [
            ['5', '5 Servers'],
            ['10', '10 Servers'],
            ['15', '15 Servers'],
            ['20', '20 Servers'],
            ['25', '25 Servers'],
            ['50', '50 Servers'],
        ],
        [],
    );

    // Find out which filters are active (different from default)
    const activeFilters = useMemo(() => {
        const active: Record<string, { label: string; value: string }> = {};

        // Check min players
        if ((searchParams?.minPlayers as string) !== DEFAULT_FILTER_VALUES.minPlayers && searchParams?.minPlayers) {
            active.minPlayers = {
                label: 'Min Players',
                value: searchParams.minPlayers as string,
            };
        }

        // Check max distance
        if ((searchParams?.maxDist as string) !== DEFAULT_FILTER_VALUES.maxDist && searchParams?.maxDist) {
            active.maxDist = {
                label: 'Distance',
                value: `${searchParams.maxDist} km`,
            };
        }

        // Check country
        if ((searchParams?.country as string) !== DEFAULT_FILTER_VALUES.country && searchParams?.country) {
            const countryLabel = countryOptions.find((option) => option[0] === searchParams.country)?.[1] || searchParams.country;
            active.country = {
                label: 'Country',
                value: countryLabel as string,
            };
        }

        // Check min rank
        if ((searchParams?.minRank as string) !== DEFAULT_FILTER_VALUES.minRank && searchParams?.minRank) {
            active.minRank = {
                label: 'Min Rank',
                value: searchParams.minRank as string,
            };
        }

        // Check max rank
        if ((searchParams?.maxRank as string) !== DEFAULT_FILTER_VALUES.maxRank && searchParams?.maxRank) {
            active.maxRank = {
                label: 'Max Rank',
                value: searchParams.maxRank as string,
            };
        }

        // Check group limit
        if ((searchParams?.groupLimit as string) !== DEFAULT_FILTER_VALUES.groupLimit && searchParams?.groupLimit) {
            const groupLabel = groupLimitOptions.find((option) => option[0] === searchParams.groupLimit)?.[1] || searchParams.groupLimit;
            active.groupLimit = {
                label: 'Group Size',
                value: groupLabel as string,
            };
        }

        // Check resource rate
        if ((searchParams?.resourceRate as string) !== DEFAULT_FILTER_VALUES.resourceRate && searchParams?.resourceRate) {
            const resourceLabel =
                resourceRateOptions.find((option) => option[0] === searchParams.resourceRate)?.[1] || searchParams.resourceRate;
            active.resourceRate = {
                label: 'Resources',
                value: resourceLabel as string,
            };
        }

        // Check numServers
        if ((searchParams?.numServers as string) !== DEFAULT_FILTER_VALUES.numServers && searchParams?.numServers) {
            const numServersLabel =
                numServersOptions.find((option) => option[0] === searchParams.numServers)?.[1] || `${searchParams.numServers} Servers`;
            active.numServers = {
                label: 'Servers',
                value: numServersLabel,
            };
        }

        return active;
    }, [searchParams, countryOptions, groupLimitOptions, resourceRateOptions, numServersOptions]);

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
                    <h2 className="text-2xl font-bold text-primary_light">Filter Servers</h2>
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
                        {/* Min Players */}
                        <div>
                            <InputTextbox
                                idName="minPlayers"
                                name="Min Players"
                                icon={<Users size={18} />}
                                value={(searchParams?.minPlayers as string) || ''}
                                placeholder={DEFAULT_FILTER_VALUES.minPlayers}
                                onChange={handleTextInputChange('minPlayers')}
                                className="bg-st_darker"
                            />
                        </div>

                        {/* Max Distance */}
                        <div>
                            <InputTextbox
                                idName="maxDist"
                                name="Distance"
                                icon={<Ruler size={18} />}
                                value={(searchParams?.maxDist as string) || ''}
                                placeholder={DEFAULT_FILTER_VALUES.maxDist}
                                onChange={handleTextInputChange('maxDist')}
                                className="bg-st_darker"
                            />
                        </div>

                        {/* Min Rank */}
                        <div>
                            <InputTextbox
                                idName="minRank"
                                name="Min Rank"
                                icon={<Trophy size={18} />}
                                value={(searchParams?.minRank as string) || ''}
                                placeholder={DEFAULT_FILTER_VALUES.minRank}
                                onChange={handleTextInputChange('minRank')}
                                className="bg-st_darker"
                            />
                        </div>

                        {/* Max Rank */}
                        <div>
                            <InputTextbox
                                idName="maxRank"
                                name="Max Rank"
                                icon={<Trophy size={18} />}
                                value={(searchParams?.maxRank as string) || ''}
                                placeholder={DEFAULT_FILTER_VALUES.maxRank}
                                onChange={handleTextInputChange('maxRank')}
                                className="bg-st_darker"
                            />
                        </div>

                        {/* Country */}
                        <div>
                            <InputSelect
                                idName="country"
                                name="Country"
                                icon={<Globe size={18} />}
                                select_options={countryOptions}
                                defaultValue={{
                                    value: (searchParams?.country as string) || 'US',
                                    label:
                                        countryOptions.find((option) => option[0] === ((searchParams?.country as string) || 'US'))?.[1] ||
                                        'United States',
                                }}
                                onChange={(value) => onUpdateSearchParams({ country: value })}
                                className="bg-st_darkest"
                            />
                        </div>

                        {/* Group Size */}
                        <div>
                            <InputSelect
                                idName="groupLimit"
                                name="Group Size"
                                icon={<UsersRound size={18} />}
                                select_options={groupLimitOptions}
                                defaultValue={{
                                    value: (searchParams?.groupLimit as string) || 'any',
                                    label:
                                        groupLimitOptions.find(
                                            (option) => option[0] === ((searchParams?.groupLimit as string) || 'any'),
                                        )?.[1] || 'Any Group Limit',
                                }}
                                onChange={(value) => onUpdateSearchParams({ groupLimit: value })}
                                className="bg-st_darkest"
                            />
                        </div>

                        {/* Resources */}
                        <div>
                            <InputSelect
                                idName="resourceRate"
                                name="Resources"
                                icon={<Package2 size={18} />}
                                select_options={resourceRateOptions}
                                defaultValue={{
                                    value: (searchParams?.resourceRate as string) || 'any',
                                    label:
                                        resourceRateOptions.find(
                                            (option) => option[0] === ((searchParams?.resourceRate as string) || 'any'),
                                        )?.[1] || 'Any Resource Rate',
                                }}
                                onChange={(value) => onUpdateSearchParams({ resourceRate: value })}
                                className="bg-st_darkest"
                            />
                        </div>

                        {/* Number of Servers */}
                        <div>
                            <InputSelect
                                idName="numServers"
                                name="Number of Servers"
                                icon={<List size={18} />}
                                select_options={numServersOptions}
                                defaultValue={{
                                    value: (searchParams?.numServers as string) || '10',
                                    label:
                                        numServersOptions.find(
                                            (option) => option[0] === ((searchParams?.numServers as string) || '10'),
                                        )?.[1] || '10 Servers',
                                }}
                                onChange={(value) => onUpdateSearchParams({ numServers: value })}
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
