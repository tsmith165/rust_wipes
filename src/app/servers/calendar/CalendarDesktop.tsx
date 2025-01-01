'use client';

import React, { useState } from 'react';
import { RwServer, NextWipeInfo } from '@/db/schema';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay } from 'date-fns';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { WipeEvent } from '../types';

interface CalendarDesktopProps {
    servers: RwServer[];
    nextWipeInfoMap: Record<string, NextWipeInfo>;
}

export function CalendarDesktop({ servers, nextWipeInfoMap }: CalendarDesktopProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const goToNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const goToPreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const getWipesForDay = (date: Date): WipeEvent[] => {
        const dayOfWeek = getDay(date);
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
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    return (
        <div className="mx-auto w-full max-w-6xl rounded-lg bg-stone-900 p-6">
            <div className="mb-4 flex items-center justify-between">
                <button onClick={goToPreviousMonth} className="rounded-lg bg-stone-800 p-2 text-stone-300 hover:bg-stone-700">
                    <MdChevronLeft className="h-5 w-5" />
                </button>
                <div className="text-center text-2xl font-bold text-primary_light">{format(currentDate, 'MMMM yyyy')}</div>
                <button onClick={goToNextMonth} className="rounded-lg bg-stone-800 p-2 text-stone-300 hover:bg-stone-700">
                    <MdChevronRight className="h-5 w-5" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-semibold text-stone-400">
                        {day}
                    </div>
                ))}
                {days.map((day, index) => {
                    const wipesForDay = getWipesForDay(day);
                    return (
                        <div
                            key={day.toString()}
                            style={{ gridColumnStart: index === 0 ? day.getDay() + 1 : 'auto' }}
                            className={`min-h-24 rounded-lg border border-stone-700 p-2 ${
                                wipesForDay.length > 0 ? 'bg-primary_dark bg-opacity-20' : ''
                            }`}
                        >
                            <div className="mb-1 text-sm text-stone-400">{format(day, 'd')}</div>
                            <div className="space-y-1">
                                {wipesForDay.map((wipe, wipeIndex) => (
                                    <div
                                        key={`${wipe.serverName}-${wipeIndex}`}
                                        className="rounded bg-primary_light bg-opacity-20 p-1 text-xs text-stone-300"
                                    >
                                        {wipe.shortTitle || wipe.serverName}
                                        <div className="text-xs text-stone-400">{formatWipeTime(wipe.wipeTime)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
