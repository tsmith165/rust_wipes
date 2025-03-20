'use client';

import React, { useRef, useMemo, useState } from 'react';
import UpcomingServerHourGroup from '../UpcomingServerHourGroup';
import { Calendar, FilterIcon, BookOpen } from 'lucide-react';
import moment from 'moment-timezone';
import { Tooltip } from 'react-tooltip';

// Default values for filters
const DEFAULT_FILTER_VALUES = {
    region: 'US',
    min_rank: '5000',
    group_limit: 'any',
    resource_rate: 'any',
    game_mode: 'any',
    time_zone: '-7',
    date: new Date().toISOString().split('T')[0],
};

interface ServerData {
    id: number;
    rank: number;
    title: string;
    wipe_hour: number;
    last_wipe: string;
    next_wipe: string;
    is_full_wipe: boolean;
}

interface GroupedWipeDict {
    [key: number]: ServerData[];
}

interface ServersTableSectionProps {
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    server_list: GroupedWipeDict;
    onUpdateSearchParams: (updates: Record<string, string>) => void;
    isLoading: boolean;
    onOpenFilterOverlay: () => void;
    onOpenLegendOverlay: () => void;
}

export default function ServersTableSection({
    searchParams,
    server_list,
    isLoading,
    onOpenFilterOverlay,
    onOpenLegendOverlay,
    onUpdateSearchParams,
}: ServersTableSectionProps) {
    // Use this ref to preserve scroll position
    const tableRef = useRef<HTMLDivElement>(null);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

    // Get the selected date and timezone
    const selectedDate = (searchParams.date as string) || new Date().toISOString().split('T')[0];
    const timeZoneOffset = (searchParams.time_zone as string) || '-7';

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;

        // Check each filter param against defaults
        Object.entries(DEFAULT_FILTER_VALUES).forEach(([key, defaultValue]) => {
            if (key === 'date') return; // Skip date param since it's displayed separately
            const currentValue = searchParams[key] as string;
            if (currentValue && currentValue !== defaultValue) {
                count++;
            }
        });

        return count;
    }, [searchParams]);

    // Short display name of timezone
    const shortTimeZoneLabel = `UTC${timeZoneOffset.startsWith('-') ? timeZoneOffset : `+${timeZoneOffset}`}`;

    // Format the date explicitly using the selected date without timezone conversion
    const formattedDate = moment(selectedDate).format('dddd, MMMM D, YYYY');

    const toggleDatePicker = () => {
        setIsDatePickerVisible(!isDatePickerVisible);
    };

    // Count total servers
    const totalServers = Object.values(server_list).reduce((total, servers) => total + servers.length, 0);

    const serversJsxArray = Object.entries(server_list)
        .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
        .map(([wipeHour, servers]) => <UpcomingServerHourGroup key={wipeHour} wipe_dict={servers} wipe_hour={parseInt(wipeHour)} />);

    return (
        <section className="bg-st_darkest py-8" id="servers-table" ref={tableRef}>
            <div className="container mx-auto px-4">
                <div className="relative mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <h2 className="text-2xl font-bold text-primary_light">Upcoming Wipe Schedule</h2>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Legend Button */}
                        <button
                            onClick={onOpenLegendOverlay}
                            className="flex h-10 items-center rounded-lg bg-st_dark px-3 text-st_lightest transition-colors hover:text-primary_light"
                            data-tooltip-id="legend-tooltip"
                            data-tooltip-content="Open Legend"
                        >
                            <BookOpen size={18} />
                        </button>
                        <Tooltip id="legend-tooltip" place="top" />

                        {/* Filter Button */}
                        <button
                            onClick={onOpenFilterOverlay}
                            className="flex h-10 items-center rounded-lg bg-st_dark px-3 text-st_lightest transition-colors hover:text-primary_light"
                            data-tooltip-id="filter-tooltip"
                            data-tooltip-content="Open Filters"
                        >
                            <FilterIcon size={18} />
                            {activeFilterCount > 0 && (
                                <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-st_white">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        <Tooltip id="filter-tooltip" place="top" />

                        {/* Date/Time Display with Date Picker */}
                        <div className="relative">
                            <button
                                onClick={toggleDatePicker}
                                className="flex h-10 items-center rounded-lg bg-st_dark px-3 text-st_lightest transition-colors hover:text-primary_light"
                                data-tooltip-id="date-picker-tooltip"
                                data-tooltip-content="Click to change date"
                            >
                                <Calendar size={18} className="mr-2" />
                                <span>{formattedDate}</span>
                                <span className="ml-2">({shortTimeZoneLabel})</span>
                            </button>
                            <Tooltip id="date-picker-tooltip" place="top" />

                            {isDatePickerVisible && (
                                <div className="absolute right-0 top-12 z-10 rounded-lg bg-st_darkest p-2 shadow-lg">
                                    <div className="calendar">
                                        <div className="calendar-header flex items-center justify-between rounded-t-md bg-st_dark p-2">
                                            <button
                                                onClick={() => {
                                                    const prevMonth = moment(selectedDate).subtract(1, 'month').format('YYYY-MM-DD');
                                                    onUpdateSearchParams({ date: prevMonth });
                                                }}
                                                className="text-st_lightest hover:text-primary_light"
                                            >
                                                &lt;
                                            </button>
                                            <span className="text-st_lightest">{moment(selectedDate).format('MMMM YYYY')}</span>
                                            <button
                                                onClick={() => {
                                                    const nextMonth = moment(selectedDate).add(1, 'month').format('YYYY-MM-DD');
                                                    onUpdateSearchParams({ date: nextMonth });
                                                }}
                                                className="text-st_lightest hover:text-primary_light"
                                            >
                                                &gt;
                                            </button>
                                        </div>
                                        <div className="calendar-grid grid grid-cols-7 gap-1 p-2">
                                            {/* Day headers */}
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                                <div key={day} className="text-center text-xs text-st_lightest">
                                                    {day}
                                                </div>
                                            ))}

                                            {/* Calendar days */}
                                            {(() => {
                                                const currentDate = moment(selectedDate);
                                                const firstDayOfMonth = moment(currentDate).startOf('month');
                                                const daysInMonth = currentDate.daysInMonth();
                                                const dayOfWeek = firstDayOfMonth.day();

                                                // Create array of days
                                                const days = [];

                                                // Add empty cells for days before the first of month
                                                for (let i = 0; i < dayOfWeek; i++) {
                                                    days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
                                                }

                                                // Add days of month
                                                for (let i = 1; i <= daysInMonth; i++) {
                                                    const dayDate = moment(firstDayOfMonth).date(i);
                                                    const isSelected = dayDate.format('YYYY-MM-DD') === selectedDate;
                                                    const isToday = dayDate.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');

                                                    days.push(
                                                        <button
                                                            key={`day-${i}`}
                                                            onClick={() => {
                                                                onUpdateSearchParams({ date: dayDate.format('YYYY-MM-DD') });
                                                                setIsDatePickerVisible(false);
                                                            }}
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm
                                                                ${isSelected ? 'bg-primary text-st_white' : 'text-st_lightest hover:bg-st_dark'}
                                                                ${isToday && !isSelected ? 'border border-primary_light' : ''}
                                                            `}
                                                        >
                                                            {i}
                                                        </button>,
                                                    );
                                                }

                                                return days;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex h-40 items-center justify-center rounded-lg">
                        <div className="text-st_lightest">Loading servers...</div>
                    </div>
                ) : serversJsxArray.length > 0 ? (
                    <div className="overflow-hidden rounded-lg shadow-lg">{serversJsxArray}</div>
                ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg">
                        <div className="text-st_lightest">No servers found for the selected filters.</div>
                    </div>
                )}

                <div className="mt-4 text-right text-sm text-st_lightest">
                    {totalServers} {totalServers === 1 ? 'server' : 'servers'} found
                </div>
            </div>
        </section>
    );
}
