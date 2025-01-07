import { NextResponse } from 'next/server';
import { db, next_wipe_info, plugin_data } from '@/db/db';
import { headers } from 'next/headers';
import { parsePluginOutput } from './Plugin.Parser';
import { PluginCheckResult } from './Plugin.Types';
import { getServerConfigs, sendServerCommand } from '@/utils/rust/rustServerCommands';
import { eq } from 'drizzle-orm';
import { comparePluginVersions, compareVersions } from './Plugin.Versions';

// Force dynamic route to prevent caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
    // Force headers() call to make route dynamic
    headers();

    try {
        console.log('Starting job to check plugins...', new Date().toISOString());

        // Fetch all servers from next_wipe_info
        const servers = await db.select().from(next_wipe_info);
        console.log(`Found ${servers.length} servers to check`);

        // Fetch existing plugin data
        const existingPlugins = await db.select().from(plugin_data);
        console.log(`Found ${existingPlugins.length} existing plugins in database`);

        const results: PluginCheckResult[] = [];
        const serverConfigs = getServerConfigs();

        for (const server of servers) {
            console.log(`Checking plugins for server ${server.server_name || server.server_id}`);

            try {
                // Find matching server config
                const serverConfig = serverConfigs.find((config) => config.ip === server.rcon_ip && config.port === server.rcon_port);

                if (!serverConfig) {
                    console.error(`No server config found for ${server.server_id}`);
                    results.push({
                        serverId: server.server_id,
                        serverName: server.server_name,
                        success: false,
                        error: 'No server config found',
                    });
                    continue;
                }

                // Send oxide.plugins command
                const response = await sendServerCommand(server.server_id, 'oxide.plugins', serverConfig);

                if (!response.success) {
                    console.error(`Failed to get plugins for ${server.server_id}:`, response.message);
                    results.push({
                        serverId: server.server_id,
                        serverName: server.server_name,
                        success: false,
                        error: response.message,
                    });
                    continue;
                }

                // Parse the response
                const parsedPlugins = parsePluginOutput(response.serverResults[0].response);

                if (!parsedPlugins.success) {
                    console.error(`Failed to parse plugins for ${server.server_id}:`, parsedPlugins.error);
                    results.push({
                        serverId: server.server_id,
                        serverName: server.server_name,
                        success: false,
                        error: parsedPlugins.error,
                    });
                    continue;
                }

                // Compare and update plugin versions
                const comparisonResults = comparePluginVersions(parsedPlugins.plugins || [], existingPlugins);

                // Update plugin_data table
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
                        console.log(`Created new plugin record for ${result.name}`);
                    } else {
                        // Existing plugin - check if we need to update highest_seen_version
                        if (compareVersions(result.currentVersion, existingPlugin.highest_seen_version) > 0) {
                            await db
                                .update(plugin_data)
                                .set({
                                    highest_seen_version: result.currentVersion,
                                    updated_at: new Date(),
                                })
                                .where(eq(plugin_data.name, result.name));
                            console.log(`Updated highest seen version for ${result.name} to ${result.currentVersion}`);
                        }
                    }
                }

                // Update next_wipe_info with current plugin data
                await db
                    .update(next_wipe_info)
                    .set({
                        installed_plugins: parsedPlugins.plugins,
                        plugins_updated_at: new Date(),
                    })
                    .where(eq(next_wipe_info.server_id, server.server_id));

                results.push({
                    serverId: server.server_id,
                    serverName: server.server_name,
                    success: true,
                    plugins: parsedPlugins.plugins,
                });

                console.log(`Successfully updated plugins for ${server.server_name || server.server_id}`);
            } catch (error) {
                console.error(`Error processing server ${server.server_id}:`, error);
                results.push({
                    serverId: server.server_id,
                    serverName: server.server_name,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        console.log('Finished checking plugins');
        return new NextResponse(
            JSON.stringify({
                message: 'Successfully checked plugins',
                timestamp: new Date().toISOString(),
                results,
            }),
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Content-Type': 'application/json',
                },
            },
        );
    } catch (error) {
        console.error('Error in plugin check cron job:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Failed to check plugins',
                timestamp: new Date().toISOString(),
            }),
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
