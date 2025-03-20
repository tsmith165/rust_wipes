'use client';

import React from 'react';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import HeatIndexKeyMap from '../HeatIndexKeyMap';
import { Users, Ruler, Trophy, UsersRound, Package2, Globe } from 'lucide-react';

interface FilterFormSectionProps {
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    onRefresh: () => void;
    isLoading: boolean;
    autoRefreshActive: boolean;
    setAutoRefreshActive: (active: boolean) => void;
    onUpdateSearchParams: (updates: Record<string, string>) => void;
}

export default function FilterFormSection({ searchParams, onUpdateSearchParams }: FilterFormSectionProps) {
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
        <section className="bg-st_darkest py-10">
            <div className="container mx-auto px-4">
                <h2 className="mb-8 text-2xl font-bold text-primary_light">Filter Servers</h2>
                <form className="w-full">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {/* Min Players */}
                        <div>
                            <InputTextbox
                                idName="minPlayers"
                                name="Min Players"
                                icon={<Users size={18} />}
                                value={(searchParams?.minPlayers as string) || '0'}
                                placeholder="Min Players"
                                onChange={(e) => onUpdateSearchParams({ minPlayers: e.target.value })}
                            />
                        </div>

                        {/* Max Distance */}
                        <div>
                            <InputTextbox
                                idName="maxDist"
                                name="Distance"
                                icon={<Ruler size={18} />}
                                value={(searchParams?.maxDist as string) || '5000'}
                                placeholder="Max Distance"
                                onChange={(e) => onUpdateSearchParams({ maxDist: e.target.value })}
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
                            />
                        </div>

                        {/* Min Rank */}
                        <div>
                            <InputTextbox
                                idName="minRank"
                                name="Min Rank"
                                icon={<Trophy size={18} />}
                                value={(searchParams?.minRank as string) || '0'}
                                placeholder="Min Rank"
                                onChange={(e) => onUpdateSearchParams({ minRank: e.target.value })}
                            />
                        </div>

                        {/* Max Rank */}
                        <div>
                            <InputTextbox
                                idName="maxRank"
                                name="Max Rank"
                                icon={<Trophy size={18} />}
                                value={(searchParams?.maxRank as string) || '10000'}
                                placeholder="Max Rank"
                                onChange={(e) => onUpdateSearchParams({ maxRank: e.target.value })}
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
                            />
                        </div>

                        {/* Resources */}
                        <div className="sm:col-span-2 md:col-span-3">
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
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <HeatIndexKeyMap />
                    </div>
                </form>
            </div>
        </section>
    );
}
