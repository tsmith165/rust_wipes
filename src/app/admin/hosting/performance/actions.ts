import { db, server_performance } from '@/db/db';
import { desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

async function checkUserRole(): Promise<{ isAdmin: boolean; error?: string | undefined }> {
    const { userId } = auth();
    if (!userId) {
        return { isAdmin: false, error: 'User is not authenticated. Cannot view server performance.' };
    }
    const hasAdminRole = await isClerkUserIdAdmin(userId);
    if (!hasAdminRole) {
        return { isAdmin: false, error: 'User does not have the admin role. Cannot view server performance.' };
    }
    return { isAdmin: true };
}

export interface ServerPerformanceData {
    id: number;
    timestamp: Date;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_in: number;
    network_out: number;
}

export async function getServerPerformanceData(): Promise<ServerPerformanceData[]> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return [];
    }

    const result = await db.select().from(server_performance).orderBy(desc(server_performance.timestamp)).limit(100); // Get the latest 100 entries

    return result.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        cpu_usage: entry.cpu_usage,
        memory_usage: entry.memory_usage,
        disk_usage: entry.disk_usage,
        network_in: entry.network_in,
        network_out: entry.network_out,
    }));
}
