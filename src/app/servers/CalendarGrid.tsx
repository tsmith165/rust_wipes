import { CalendarView } from './CalendarView';
import { NextWipeInfo } from '@/db/schema';
import { ServerWithTimestamps } from './types';

interface CalendarGridProps {
    servers: ServerWithTimestamps[];
    nextWipeInfoMap: Record<string, NextWipeInfo>;
    currentDate: Date;
}

export function CalendarGrid({ servers, nextWipeInfoMap }: CalendarGridProps) {
    return <CalendarView servers={servers} nextWipeInfoMap={nextWipeInfoMap} />;
}
