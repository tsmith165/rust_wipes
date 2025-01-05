'use server';

import { db, next_wipe_info } from '@/db/db';
import { NextWipeInfo, type next_wipe_info as NextWipeInfoTable } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';
import { revalidatePath } from 'next/cache';
import { fetchBattleMetricsServerData, BattleMetricsServerData } from '@/utils/battlemetrics/BattleMetricsAPI';
import { restartServer as restartServerRcon, regularWipe as regularWipeRcon, bpWipe as bpWipeRcon } from '@/utils/rust/rustServerCommands';

export interface ServerStatusData extends NextWipeInfo {
    player_count?: number;
    max_players?: number;
    rust_build?: string;
    status: 'online' | 'offline' | 'restarting';
}

async function checkUserRole(): Promise<{ isAdmin: boolean; error?: string }> {
    const { userId } = await auth();
    if (!userId) {
        return { isAdmin: false, error: 'User is not authenticated.' };
    }
    const hasAdminRole = await isClerkUserIdAdmin(userId);
    if (!hasAdminRole) {
        return { isAdmin: false, error: 'User does not have the admin role.' };
    }
    return { isAdmin: true };
}

async function fetchBattleMetricsData(serverId: string, bmId: string | null): Promise<Partial<ServerStatusData>> {
    if (!bmId) {
        console.warn(`No BattleMetrics ID found for server ${serverId}`);
        return {
            player_count: 0,
            max_players: 0,
            rust_build: 'Unknown',
            status: 'offline',
        };
    }

    try {
        const bmData = await fetchBattleMetricsServerData(bmId);
        return {
            ...bmData,
        };
    } catch (error) {
        console.error(`Failed to fetch BattleMetrics data for server ${serverId}:`, error);
        return {
            status: 'offline',
            player_count: 0,
            max_players: 0,
            rust_build: 'Unknown',
        };
    }
}

export async function getServerStatus(): Promise<ServerStatusData[]> {
    const { isAdmin, error } = await checkUserRole();
    if (!isAdmin) {
        console.error(error);
        return [];
    }

    try {
        const servers = await db.select().from(next_wipe_info).orderBy(desc(next_wipe_info.server_id));

        const serverStatus = await Promise.all(
            servers.map(async (server) => {
                const bmData = await fetchBattleMetricsData(server.server_id, server.bm_id);
                // Ensure dates are properly serialized
                return {
                    ...server,
                    ...bmData,
                    last_restart: server.last_restart ? new Date(server.last_restart).toISOString() : null,
                    last_wipe: server.last_wipe ? new Date(server.last_wipe).toISOString() : null,
                } as ServerStatusData;
            }),
        );

        return serverStatus;
    } catch (error) {
        console.error('Failed to fetch server status:', error);
        return [];
    }
}

async function getServerConfig(server: NextWipeInfo) {
    if (!server.rcon_ip || !server.rcon_port || !server.rcon_password) {
        throw new Error('Missing RCON configuration');
    }

    return {
        name: server.server_name || server.server_id,
        ip: server.rcon_ip,
        port: server.rcon_port,
        password: server.rcon_password,
    };
}

async function executeRconCommand(
    serverId: string,
    action: (
        serverId: string,
        config: { name: string; ip: string; port: number; password: string },
    ) => Promise<{
        success: boolean;
        message: string;
        serverResults: { serverName: string; response: string; success: boolean; command: string }[];
    }>,
): Promise<{ success: boolean; error?: string; successMessage?: string }> {
    const { isAdmin, error: authError } = await checkUserRole();
    if (!isAdmin) {
        return { success: false, error: authError };
    }

    const server = await db.select().from(next_wipe_info).where(eq(next_wipe_info.server_id, serverId)).limit(1);

    if (!server || server.length === 0) {
        return { success: false, error: 'Server not found' };
    }

    try {
        const config = await getServerConfig(server[0]);
        const result = await action(serverId, config);

        if (!result.success) {
            return { success: false, error: result.message };
        }

        // Revalidate the path
        revalidatePath('/admin/status');

        return {
            success: true,
            successMessage: result.message,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to execute RCON command for server ${serverId}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
}

export async function restartServer(serverId: string): Promise<{ success: boolean; error?: string; successMessage?: string }> {
    return executeRconCommand(serverId, restartServerRcon);
}

export async function regularWipe(serverId: string): Promise<{ success: boolean; error?: string; successMessage?: string }> {
    return executeRconCommand(serverId, regularWipeRcon);
}

export async function bpWipe(serverId: string): Promise<{ success: boolean; error?: string; successMessage?: string }> {
    return executeRconCommand(serverId, bpWipeRcon);
}
