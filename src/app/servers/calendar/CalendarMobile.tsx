'use client';

import { useState } from 'react';
import { DateRange, DayWipes, WipeEvent } from '../types';
import { RwServer, NextWipeInfo } from '@/db/schema';
import { DateRangePicker } from './DateRangePicker';
import { format, eachDayOfInterval, startOfToday, addDays, getDay, setHours } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarMobileProps {
    servers: RwServer[];
    nextWipeInfoMap: Record<string, NextWipeInfo>;
}

export function CalendarMobile({ servers, nextWipeInfoMap }: CalendarMobileProps) {
    const today = startOfToday();
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: today,
        endDate: addDays(today, 7),
    });

    const getWipesForDay = (date: Date): WipeEvent[] => {
        const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const wipeEvents: WipeEvent[] = [];

        servers.forEach((server) => {
            const wipeDays = server.wipe_days.split(',').map((day) => parseInt(day.trim()));
            if (wipeDays.includes(dayOfWeek) && server.wipe_time !== null) {
                wipeEvents.push({
                    serverName: server.name,
                    wipeTime: server.wipe_time,
                    shortTitle: server.short_title || undefined,
                    serverId: server.id,
                });
            }
        });

        return wipeEvents;
    };

    const formatWipeTime = (wipeTime: number): string => {
        switch (wipeTime) {
            case 11:
                return '11 AM PST';
            case 13:
                return '1 PM PST';
            case 15:
                return '3 PM PST';
            default:
                return `${wipeTime} PST`;
        }
    };

    const days = eachDayOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate,
    });

    const dayWipes: DayWipes[] = days
        .map((day) => ({
            date: day,
            wipes: getWipesForDay(day),
        }))
        .filter((dayWipe) => dayWipe.wipes.length > 0);

    return (
        <div className="w-full space-y-4">
            <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
            <div className="space-y-4">
                <AnimatePresence>
                    {dayWipes.map((dayWipe) => (
                        <motion.div
                            key={dayWipe.date.toISOString()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-lg bg-stone-900 p-4"
                        >
                            <h3 className="mb-3 text-lg font-semibold text-primary_light">{format(dayWipe.date, 'EEEE, MMMM d')}</h3>
                            <div className="space-y-2">
                                {dayWipe.wipes.map((wipe, index) => (
                                    <div key={`${wipe.serverId}-${index}`} className="rounded-lg bg-stone-800 p-3">
                                        <div className="font-semibold text-stone-300">{wipe.shortTitle || wipe.serverName}</div>
                                        <div className="text-sm text-stone-400">{formatWipeTime(wipe.wipeTime)}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {dayWipes.length === 0 && (
                    <div className="rounded-lg bg-stone-900 p-4 text-center text-stone-400">No wipes scheduled for selected date range</div>
                )}
            </div>
        </div>
    );
}
