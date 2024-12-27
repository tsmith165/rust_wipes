import { RwServer } from '@/db/schema';

// Define a shared server type with timestamps
export type ServerWithTimestamps = RwServer & {
    nextWipeTimestamp: number; // Store only the timestamp
};
