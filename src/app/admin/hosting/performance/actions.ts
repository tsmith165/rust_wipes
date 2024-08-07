import { db, server_performance } from '@/db/db';
import { desc } from 'drizzle-orm';

export interface ServerPerformanceData {
    id: number;
    system_id: string;
    server_name: string;
    timestamp: Date | null;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_in: number;
    network_out: number;
}

export async function getServerPerformanceData(recordsToDisplay: number = 250): Promise<ServerPerformanceData[]> {
    const result = await db.select().from(server_performance).orderBy(desc(server_performance.timestamp)).limit(recordsToDisplay);

    return result.map((entry) => ({
        id: entry.id,
        system_id: entry.system_id,
        server_name: entry.server_name,
        timestamp: entry.timestamp,
        cpu_usage: Number(entry.cpu_usage),
        memory_usage: Number(entry.memory_usage),
        disk_usage: Number(entry.disk_usage),
        network_in: Number(entry.network_in),
        network_out: Number(entry.network_out),
    }));
}
