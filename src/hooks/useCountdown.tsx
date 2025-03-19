'use client';

import { useState, useEffect } from 'react';
import { RwServer } from '@/db/schema';

export function useCountdown(server: RwServer): string {
    const [countdown, setCountdown] = useState<string>('...');

    useEffect(() => {
        const getNextWipeDate = (server: RwServer): Date => {
            const now = new Date();
            const currentDay = now.getDay();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            const wipeDays = server.wipe_days.split(',').map(Number);
            const wipeTimeHour = parseInt(server.wipe_time?.slice(0, -2) || '11', 10);
            const wipeTimeMinute = parseInt(server.wipe_time?.slice(-2) || '00', 10);

            // First check if we're on a wipe day before wipe time
            if (wipeDays.includes(currentDay)) {
                if (currentHour < wipeTimeHour || (currentHour === wipeTimeHour && currentMinute < wipeTimeMinute)) {
                    // We're on a wipe day before wipe time, so next wipe is today
                    const nextWipe = new Date(now);
                    nextWipe.setHours(wipeTimeHour, wipeTimeMinute, 0, 0);
                    return nextWipe;
                }
            }

            // If we're past today's wipe time or it's not a wipe day, find the next wipe day
            let nextWipeDay = wipeDays.find((day) => day > currentDay);

            // If no next wipe day found in current week, wrap to first day of next week
            if (nextWipeDay === undefined) {
                nextWipeDay = wipeDays[0];
            }

            // Calculate days until next wipe
            let daysUntilWipe = nextWipeDay - currentDay;
            if (daysUntilWipe <= 0) {
                daysUntilWipe += 7;
            }

            const nextWipe = new Date(now);
            nextWipe.setDate(nextWipe.getDate() + daysUntilWipe);
            nextWipe.setHours(wipeTimeHour, wipeTimeMinute, 0, 0);

            return nextWipe;
        };

        const timer = setInterval(() => {
            const now = new Date();
            const nextWipe = getNextWipeDate(server);
            const timeLeft = nextWipe.getTime() - now.getTime();

            if (timeLeft > 0) {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else {
                setCountdown('Wipe in progress!');
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [server]);

    return countdown;
}
