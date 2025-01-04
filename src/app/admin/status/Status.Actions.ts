'use server';

import { db, next_wipe_info } from '@/db/db';
import { NextWipeInfo } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';
import { cache } from 'react';
import { fetchBattleMetricsServerData, BattleMetricsServerData } from '@/utils/battlemetrics/BattleMetricsAPI';

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

export const getServerStatus = cache(async (): Promise<ServerStatusData[]> => {
    const { isAdmin, error } = await checkUserRole();
    if (!isAdmin) {
        console.error(error);
        return [];
    }
    const servers = await db.select().from(next_wipe_info).orderBy(desc(next_wipe_info.server_id));

    console.log('next_wipe_info servers (Next Line):');
    console.log(servers);

    const serverStatus = await Promise.all(
        servers.map(async (server) => {
            const bmData = await fetchBattleMetricsData(server.server_id, server.bm_id);
            return {
                ...server,
                ...bmData,
            } as ServerStatusData;
        }),
    );

    console.log('serverStatus (Next Line):');
    console.log(serverStatus);

    return serverStatus;
});
