'use client';

import React from 'react';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import { Globe, Trophy, UsersRound, Package2, Calendar, Clock, Gamepad2 } from 'lucide-react';
import { regionSelectOptions, rateSelectOptions, groupSelectOptions, modeSelectOptions, standardTimeOptions } from '../constants';

interface FilterFormSectionProps {
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    onRefresh: () => void;
    isLoading: boolean;
    onUpdateSearchParams: (updates: Record<string, string>) => void;
}

export default function FilterFormSection({ searchParams, onRefresh, isLoading, onUpdateSearchParams }: FilterFormSectionProps) {
    // Get current date for the date picker
    const currentDate = (searchParams.date as string) || new Date().toISOString().split('T')[0];

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateSearchParams({ date: e.target.value });
    };

    return (
        <section className="bg-st_darkest py-10">
            <div className="container mx-auto px-4">
                <h2 className="mb-8 text-2xl font-bold text-primary_light">Filter Wipes by Date</h2>
                <form className="w-full">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {/* Region */}
                        <div>
                            <InputSelect
                                idName="region"
                                name="Region"
                                icon={<Globe size={18} />}
                                select_options={regionSelectOptions}
                                defaultValue={{
                                    value: (searchParams?.region as string) || 'US',
                                    label:
                                        regionSelectOptions.find(
                                            (option) => option[0] === ((searchParams?.region as string) || 'US'),
                                        )?.[1] || 'US',
                                }}
                                onChange={(value) => onUpdateSearchParams({ region: value })}
                            />
                        </div>

                        {/* Min Rank */}
                        <div>
                            <InputTextbox
                                idName="min_rank"
                                name="Min Rank"
                                icon={<Trophy size={18} />}
                                value={(searchParams?.min_rank as string) || '5000'}
                                placeholder="Min Rank"
                                onChange={(e) => onUpdateSearchParams({ min_rank: e.target.value })}
                            />
                        </div>

                        {/* Group Limit */}
                        <div>
                            <InputSelect
                                idName="group_limit"
                                name="Group Size"
                                icon={<UsersRound size={18} />}
                                select_options={groupSelectOptions}
                                defaultValue={{
                                    value: (searchParams?.group_limit as string) || 'any',
                                    label:
                                        groupSelectOptions.find(
                                            (option) => option[0] === ((searchParams?.group_limit as string) || 'any'),
                                        )?.[1] || 'Any Group Limit',
                                }}
                                onChange={(value) => onUpdateSearchParams({ group_limit: value })}
                            />
                        </div>

                        {/* Resource Rate */}
                        <div>
                            <InputSelect
                                idName="resource_rate"
                                name="Resources"
                                icon={<Package2 size={18} />}
                                select_options={rateSelectOptions}
                                defaultValue={{
                                    value: (searchParams?.resource_rate as string) || 'any',
                                    label:
                                        rateSelectOptions.find(
                                            (option) => option[0] === ((searchParams?.resource_rate as string) || 'any'),
                                        )?.[1] || 'Any Resource Rate',
                                }}
                                onChange={(value) => onUpdateSearchParams({ resource_rate: value })}
                            />
                        </div>

                        {/* Game Mode */}
                        <div>
                            <InputSelect
                                idName="game_mode"
                                name="Game Mode"
                                icon={<Gamepad2 size={18} />}
                                select_options={modeSelectOptions}
                                defaultValue={{
                                    value: (searchParams?.game_mode as string) || 'any',
                                    label:
                                        modeSelectOptions.find(
                                            (option) => option[0] === ((searchParams?.game_mode as string) || 'any'),
                                        )?.[1] || 'Any Game Mode',
                                }}
                                onChange={(value) => onUpdateSearchParams({ game_mode: value })}
                            />
                        </div>

                        {/* Time Zone */}
                        <div>
                            <InputSelect
                                idName="time_zone"
                                name="Time Zone"
                                icon={<Clock size={18} />}
                                select_options={standardTimeOptions}
                                defaultValue={{
                                    value: (searchParams?.time_zone as string) || '-7',
                                    label:
                                        standardTimeOptions.find(
                                            (option) => option[0] === ((searchParams?.time_zone as string) || '-7'),
                                        )?.[1] || 'Mountain Standard Time (UTC-07:00)',
                                }}
                                onChange={(value) => onUpdateSearchParams({ time_zone: value })}
                            />
                        </div>

                        {/* Date Picker */}
                        <div className="flex w-full items-center">
                            <div className="flex h-10 min-w-12 max-w-12 items-center justify-center rounded-l-md bg-primary px-2.5 text-white">
                                <Calendar size={18} />
                            </div>
                            <input
                                type="date"
                                value={currentDate}
                                onChange={handleDateChange}
                                className="h-10 w-full rounded-r-md border-none bg-st_dark px-2 py-1 text-sm font-medium text-st_lightest focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}
