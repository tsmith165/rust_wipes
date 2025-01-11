'use server';

import { db, next_wipe_info, plugin_data } from '@/db/db';
import { NextWipeInfo, type next_wipe_info as NextWipeInfoTable, type PluginData } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { fetchBattleMetricsServers } from '@/app/actions';
import {
    restartServer as restartServerRcon,
    regularWipe as regularWipeRcon,
    bpWipe as bpWipeRcon,
    sendServerCommand,
} from '@/utils/rust/rustServerCommands';
import { parsePluginOutput } from '@/app/api/cron/check-plugins/Plugin.Parser';
import { comparePluginVersions, compareVersions } from '@/app/api/cron/check/plugins/Plugin.Versions';

interface PluginInfo {
    name: string;
    version: string;
    author: string;
}

export interface ServerStatusData extends Omit<NextWipeInfo, 'installed_plugins' | 'plugins_updated_at'> {
    player_count?: number;
    max_players?: number;
    rust_build?: string;
    status: 'online' | 'offline' | 'restarting';
    installed_plugins: PluginInfo[] | null;
    plugins_updated_at: Date | null;
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

export async function getServerStatus(): Promise<ServerStatusData[]> {
    const { isAdmin, error } = await checkUserRole();
    if (!isAdmin) {
        console.error(error);
        return [];
    }

    try {
        // Get all servers from the database
        const servers = await db.select().from(next_wipe_info).orderBy(desc(next_wipe_info.server_id));

        // Extract server IDs and filter out any without BM IDs
        const serverIds = servers.filter((server) => server.bm_id).map((server) => parseInt(server.bm_id!, 10));

        // Fetch all BattleMetrics data in one request
        const bmServers = await fetchBattleMetricsServers(serverIds, serverIds.length);

        // Map the servers with their BattleMetrics data
        const serverStatus = servers.map((server) => {
            const bmServer = server.bm_id ? bmServers.find((bm) => bm.id === server.bm_id) : null;

            const status: ServerStatusData = {
                ...server,
                player_count: bmServer?.attributes.players || 0,
                max_players: bmServer?.attributes.maxPlayers || 0,
                rust_build: 'Unknown', // BattleMetrics API doesn't provide rust_build in bulk fetch
                status: bmServer ? 'online' : 'offline',
                last_restart: server.last_restart,
                last_wipe: server.last_wipe,
                installed_plugins: server.installed_plugins as PluginInfo[] | null,
                plugins_updated_at: server.plugins_updated_at,
            };

            return status;
        });

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

export async function checkPlugins(serverId: string): Promise<{ success: boolean; error?: string; successMessage?: string }> {
    // Force dynamic route and no caching
    headers();

    // Add no-cache headers using NextResponse
    const response = new NextResponse();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

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
        const result = await sendServerCommand(serverId, 'oxide.plugins', config);

        if (!result.success) {
            return { success: false, error: result.message };
        }

        // Parse the plugin data from the first response
        const parsedPlugins = parsePluginOutput(JSON.stringify(result.serverResults[0]));
        if (!parsedPlugins.success || !parsedPlugins.plugins) {
            return { success: false, error: parsedPlugins.error || 'No plugins found in response' };
        }

        // Get existing plugins from plugin_data table
        const existingPlugins = await db.select().from(plugin_data);

        // Compare and update plugin versions
        const comparisonResults = comparePluginVersions(parsedPlugins.plugins, existingPlugins);

        // Update plugin_data table
        let newPluginsCreated = 0;
        let pluginsUpdated = 0;

        for (const result of comparisonResults) {
            const existingPlugin = existingPlugins.find((p) => p.name === result.name);

            if (!existingPlugin) {
                // New plugin - create record
                await db.insert(plugin_data).values({
                    name: result.name,
                    current_version: result.currentVersion,
                    highest_seen_version: result.highestSeenVersion,
                    author: result.author,
                });
                newPluginsCreated++;
            } else {
                // Existing plugin - check if we need to update highest_seen_version
                const versionComparison = compareVersions(result.currentVersion, existingPlugin.highest_seen_version);

                if (versionComparison > 0) {
                    await db
                        .update(plugin_data)
                        .set({
                            highest_seen_version: result.currentVersion,
                            updated_at: new Date(),
                        })
                        .where(eq(plugin_data.name, result.name));
                    pluginsUpdated++;
                }
            }
        }

        // Update the next_wipe_info table with the parsed plugin data
        await db
            .update(next_wipe_info)
            .set({
                installed_plugins: parsedPlugins.plugins,
                plugins_updated_at: new Date(),
            })
            .where(eq(next_wipe_info.server_id, serverId));

        // Revalidate multiple paths to ensure fresh data
        revalidatePath('/admin/status');
        revalidatePath('/admin/status', 'layout');

        return {
            success: true,
            successMessage: `Successfully updated ${parsedPlugins.totalPlugins} plugins (${newPluginsCreated} new, ${pluginsUpdated} updated)`,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[checkPlugins] Error checking plugins for server ${serverId}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
}

export async function getPluginVersions(): Promise<{ success: boolean; data?: PluginData[]; error?: string }> {
    // Force headers() call to make route dynamic
    headers();

    // Add no-cache headers using NextResponse
    const response = new NextResponse();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    const { isAdmin, error: authError } = await checkUserRole();
    if (!isAdmin) {
        return { success: false, error: authError };
    }

    try {
        const plugins = await db.select().from(plugin_data);
        return { success: true, data: plugins };
    } catch (error) {
        console.error('Error fetching plugin versions:', error);
        return { success: false, error: 'Failed to fetch plugin versions' };
    }
}
