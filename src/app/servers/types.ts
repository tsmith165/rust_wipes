import { RwServer } from '@/db/schema';

// Define a shared server type with timestamps
export type ServerWithTimestamps = RwServer & {
    nextWipeTimestamp: number; // Store only the timestamp
};

// Date range type for mobile Calendar
export interface DateRange {
    startDate: Date;
    endDate: Date;
}

// Wipe event type for Calendars
export interface WipeEvent {
    serverName: string;
    wipeTime: number;
    shortTitle?: string;
    serverId: number;
}

// Grouped wipe events by date
export interface DayWipes {
    date: Date;
    wipes: WipeEvent[];
}
