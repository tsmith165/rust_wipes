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

            const wipeDays = server.wipe_days.split(',').map(Number);
            let nextWipeDay = wipeDays.find((day) => day > currentDay) || wipeDays[0];
            let daysUntilWipe = nextWipeDay - currentDay;

            if (daysUntilWipe <= 0) {
                daysUntilWipe += 7;
            }

            if (daysUntilWipe === 0 && currentHour >= (server.wipe_time || 11)) {
                daysUntilWipe = 7;
            }

            const nextWipe = new Date(now.getTime() + daysUntilWipe * 24 * 60 * 60 * 1000);
            nextWipe.setHours(server.wipe_time || 11, 0, 0, 0);

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
