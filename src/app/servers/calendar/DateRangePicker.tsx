'use client';

import { useState } from 'react';
import { DateRange } from '../types';
import { format, addDays, startOfToday, isAfter, isBefore, parseISO } from 'date-fns';
import { MdCalendarToday } from 'react-icons/md';

interface DateRangePickerProps {
    dateRange: DateRange;
    onDateRangeChange: (newRange: DateRange) => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
    const today = startOfToday();
    const maxDate = addDays(today, 30); // Limit to 30 days in the future

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = parseISO(e.target.value);
        if (isBefore(newStartDate, today)) return;

        onDateRangeChange({
            startDate: newStartDate,
            endDate: isBefore(dateRange.endDate, newStartDate) ? newStartDate : dateRange.endDate,
        });
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = parseISO(e.target.value);
        if (isBefore(newEndDate, dateRange.startDate)) return;
        if (isAfter(newEndDate, maxDate)) return;

        onDateRangeChange({
            startDate: dateRange.startDate,
            endDate: newEndDate,
        });
    };

    return (
        <div className="mb-4 flex w-full flex-col space-y-2 rounded-lg bg-stone-900 p-4">
            <div className="flex items-center space-x-2">
                <MdCalendarToday className="text-primary_light" size={24} />
                <h3 className="text-lg font-semibold text-stone-300">Select Date Range</h3>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                <div className="flex flex-1 flex-col">
                    <label className="mb-1 text-sm text-stone-400">Start Date</label>
                    <input
                        type="date"
                        value={format(dateRange.startDate, 'yyyy-MM-dd')}
                        min={format(today, 'yyyy-MM-dd')}
                        max={format(maxDate, 'yyyy-MM-dd')}
                        onChange={handleStartDateChange}
                        className="rounded-lg bg-stone-800 p-2 text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary_light"
                    />
                </div>
                <div className="flex flex-1 flex-col">
                    <label className="mb-1 text-sm text-stone-400">End Date</label>
                    <input
                        type="date"
                        value={format(dateRange.endDate, 'yyyy-MM-dd')}
                        min={format(dateRange.startDate, 'yyyy-MM-dd')}
                        max={format(maxDate, 'yyyy-MM-dd')}
                        onChange={handleEndDateChange}
                        className="rounded-lg bg-stone-800 p-2 text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary_light"
                    />
                </div>
            </div>
        </div>
    );
}
