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
    system_id: string;
    server_name: string;
    timestamp: Date | null;
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

    const result = await db.select().from(server_performance).orderBy(desc(server_performance.timestamp)).limit(51840); // Get the latest 51,840 entries (3 days worth) across all servers

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
