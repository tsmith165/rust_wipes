'use server';

import axios from 'axios';
import { eq, gte, and, between, desc, asc, gt, lt, inArray, like } from 'drizzle-orm';
import { db } from '@/db/db';
import { rw_parsed_server, rw_servers, kits, KitExtraImages, player_stats, next_wipe_info, map_options, map_votes } from '@/db/schema';
import type { KitsWithExtraImages, RwServer, PlayerStats, NextWipeInfo, MapOptions, MapVotes } from '@/db/schema';
import type { SQL } from 'drizzle-orm';

interface Server {
    id: number;
    attributes: {
        players: number | null;
        maxPlayers: number | null;
        ip: string | null;
        port: number | null;
        name: string | null;
        rank: number | null;
        details: {
            rust_last_wipe: string | null;
        };
    };
    offline: boolean;
}

interface BattleMetricsServer {
    id: string;
    attributes: {
        ip: string | null;
        port: number | null;
        name: string | null;
        rank: number | null;
        details: {
            rust_last_wipe: string | null;
        };
        players: number | null;
        maxPlayers: number | null;
    };
}

interface DbWipe {
    id: number;
    timestamp: Date;
    rank: number | null;
    ip: string | null;
    title: string | null;
    region: string | null;
    players: number | null;
    wipe_schedule: string | null;
    game_mode: string | null;
    resource_rate: string | null;
    group_limit: string | null;
    last_wipe: Date;
    next_wipe: Date | null;
    next_full_wipe: Date | null;
}

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

class TimedCache<T> {
    private cache: Map<string, CacheItem<T>> = new Map();
    private ttl: number;

    constructor(ttl: number) {
        this.ttl = ttl;
    }

    async get(key: string, fetchFunction: () => Promise<T>, forceRefresh: boolean = false): Promise<T> {
        const now = Date.now();
        const cached = this.cache.get(key);

        if (!cached || now - cached.timestamp > this.ttl || forceRefresh) {
            const data = await fetchFunction();
            this.cache.set(key, { data, timestamp: now });
            return data;
        }

        return cached.data;
    }
}

const battleMetricsCache = new TimedCache<BattleMetricsServer[]>(5000); // 5000 ms = 5 seconds

export async function fetchBattleMetricsServers(
    serverIds: number[],
    pageSize: number,
    forceRefresh: boolean = false,
): Promise<BattleMetricsServer[]> {
    const cacheKey = `${serverIds.join(',')}-${pageSize}`;

    return battleMetricsCache.get(
        cacheKey,
        async () => {
            const query_params_string = `filter[game]=rust&filter[status]=online&filter[ids][whitelist]=${serverIds.join(
                ',',
            )}&sort=-details.rust_last_wipe&page[size]=${pageSize}`;
            const url = `https://api.battlemetrics.com/servers?${query_params_string}`;

            try {
                const response = await axios.get(url);
                return response.data.data;
            } catch (error) {
                console.error('Error fetching data from BattleMetrics:', error);
                return [];
            }
        },
        forceRefresh,
    );
}

export async function fetchRecentWipesFromDB(params: {
    country: string;
    minPlayers: number;
    maxDist: number;
    minRank: number;
    maxRank: number;
    groupLimit: string;
    resourceRate: string;
    numServers: number;
    page: number;
}): Promise<DbWipe[]> {
    const { country, minPlayers, maxDist, minRank, maxRank, groupLimit, resourceRate, numServers, page } = params;
    const itemsPerPage = numServers;
    const skip = (page - 1) * itemsPerPage;

    console.log(`Fetching recent wipes with filters:`, params);
    try {
        const recentWipes = await db
            .select()
            .from(rw_parsed_server)
            .where(
                and(
                    eq(rw_parsed_server.region, country),
                    gte(rw_parsed_server.players, minPlayers),
                    between(rw_parsed_server.rank, minRank, maxRank),
                    groupLimit !== 'any' ? eq(rw_parsed_server.group_limit, groupLimit) : undefined,
                    resourceRate !== 'any' ? eq(rw_parsed_server.resource_rate, resourceRate) : undefined,
                ),
            )
            .orderBy(desc(rw_parsed_server.last_wipe))
            .offset(skip)
            .limit(itemsPerPage);

        return recentWipes as DbWipe[];
    } catch (error) {
        console.error('Error fetching recent wipes from DB:', error);
        throw error;
    }
}

export async function getRecentWipesData(searchParams: {
    country: string;
    minPlayers: number;
    maxDist: number;
    minRank: number;
    maxRank: number;
    groupLimit: string;
    resourceRate: string;
    numServers: number;
    page: number;
    forceRefresh: boolean;
}): Promise<Server[]> {
    const { forceRefresh, ...dbParams } = searchParams;
    const dbWipes = await fetchRecentWipesFromDB(dbParams);
    const serverIds = dbWipes.map((server: DbWipe) => server.id);
    const bmServers = await fetchBattleMetricsServers(serverIds, searchParams.numServers, forceRefresh);

    const combinedData: Server[] = dbWipes.map((dbServer: DbWipe) => {
        const bmServer = bmServers.find((bm) => bm.id === dbServer.id.toString());
        return {
            id: dbServer.id,
            attributes: {
                players: bmServer?.attributes.players || dbServer.players,
                maxPlayers: bmServer?.attributes.maxPlayers || null,
                ip: dbServer.ip,
                port: bmServer?.attributes.port || null,
                name: bmServer?.attributes.name || dbServer.title,
                rank: bmServer?.attributes.rank || dbServer.rank,
                details: {
                    rust_last_wipe: bmServer?.attributes.details?.rust_last_wipe || dbServer.last_wipe.toISOString(),
                },
            },
            offline: !bmServer,
        };
    });

    return combinedData;
}

export async function fetchServers(): Promise<RwServer[]> {
    console.log('Fetching servers with Drizzle');
    const servers = await db.select().from(rw_servers).orderBy(asc(rw_servers.o_id));

    console.log('Captured servers successfully');
    return servers;
}

export async function fetchNextWipeInfo(): Promise<NextWipeInfo[]> {
    console.log('Fetching next wipe info with Drizzle');
    const wipeInfo = await db.select().from(next_wipe_info);

    console.log('Captured next wipe info successfully');
    return wipeInfo;
}

export async function fetchMapOptions(): Promise<MapOptions[]> {
    console.log('Fetching map options with Drizzle');
    const options = await db.select().from(map_options).where(eq(map_options.enabled, true));

    console.log('Captured map options successfully');
    return options;
}

export async function fetchMapVotes(): Promise<MapVotes[]> {
    console.log('Fetching map votes with Drizzle');
    const votes = await db.select().from(map_votes);

    console.log('Captured map votes successfully');
    return votes;
}

export async function fetchPlayerStats(serverId?: string): Promise<(PlayerStats & { steamUsername: string; avatarUrl: string })[]> {
    console.log('Fetching player stats with Drizzle');

    let whereClause: SQL | undefined;
    if (serverId) {
        whereClause = eq(player_stats.server_id, serverId);
    }

    const stats = await db.select().from(player_stats).where(whereClause).orderBy(desc(player_stats.kills));

    // Fetch Steam user info for all players
    const statsWithSteamInfo = await Promise.all(
        stats.map(async (stat) => {
            const steamInfo = await fetchSteamUserInfo(stat.steam_id);
            return {
                ...stat,
                steamUsername: steamInfo.personaname,
                avatarUrl: steamInfo.avatarfull,
            };
        }),
    );

    console.log('Captured player stats with Steam info successfully');
    return statsWithSteamInfo;
}

export async function fetchServerInfo(): Promise<{ id: string; name: string }[]> {
    console.log('Fetching server information');
    const serverIds = await db.select({ server_id: player_stats.server_id }).from(player_stats).groupBy(player_stats.server_id);

    const serverInfo = await Promise.all(
        serverIds.map(async ({ server_id }) => {
            const server = await db
                .select({ name: rw_servers.name, connection_url: rw_servers.connection_url })
                .from(rw_servers)
                .where(like(rw_servers.connection_url, `%:${server_id}`))
                .limit(1);

            return {
                id: server_id,
                name: server[0]?.name || `Unknown Server (${server_id})`,
            };
        }),
    );

    console.log('Captured server information successfully');
    return serverInfo;
}

export async function fetchKits(): Promise<KitsWithExtraImages[]> {
    console.log(`Fetching active kits with Drizzle`);
    const kitsWithExtraImages = await db
        .select({
            kit: kits,
            extraImages: KitExtraImages,
        })
        .from(kits)
        .where(eq(kits.active, true))
        .leftJoin(KitExtraImages, eq(KitExtraImages.kit_id, kits.id))
        .orderBy(asc(kits.o_id));

    console.log(`Captured active kits successfully`);

    const formattedKits = kitsWithExtraImages.reduce<KitsWithExtraImages[]>((acc, curr) => {
        const kit = curr.kit;
        const extraImage = curr.extraImages;

        const existingKit = acc.find((k) => k.id === kit.id);

        if (existingKit) {
            if (extraImage) {
                existingKit.extraImages.push(extraImage);
            }
        } else {
            acc.push({
                ...kit,
                extraImages: extraImage ? [extraImage] : [],
            });
        }

        return acc;
    }, []);

    return formattedKits;
}

export async function fetchKitIds(): Promise<number[]> {
    const kitList = await db.select({ id: kits.id }).from(kits).where(eq(kits.active, true));
    return kitList.map((kit) => kit.id);
}

export async function fetchKitById(id: number) {
    const kit = await db
        .select()
        .from(kits)
        .where(and(eq(kits.id, id), eq(kits.active, true)))
        .execute();

    if (kit.length === 0) {
        return null;
    }

    const extraImages = await db
        .select()
        .from(KitExtraImages)
        .where(eq(KitExtraImages.kit_id, id))
        .orderBy(asc(KitExtraImages.id))
        .execute();

    const kitData = {
        ...kit[0],
        extraImages,
    };

    return kitData;
}

export async function fetchKitsByIds(ids: number[]) {
    const kits_data = await db
        .select()
        .from(kits)
        .where(and(inArray(kits.id, ids), eq(kits.active, true)))
        .execute();
    const kitsWithImages = await Promise.all(
        kits_data.map(async (kit) => {
            const extraImages = await db
                .select()
                .from(KitExtraImages)
                .where(eq(KitExtraImages.kit_id, kit.id))
                .orderBy(asc(KitExtraImages.id))
                .execute();

            return {
                ...kit,
                extraImages,
            };
        }),
    );

    return kitsWithImages;
}

export async function fetchAdjacentKitIds(currentId: number) {
    console.log(`Fetching adjacent active kit IDs for kit ID: ${currentId}`);
    const currentKit = await db
        .select()
        .from(kits)
        .where(and(eq(kits.id, currentId), eq(kits.active, true)))
        .limit(1);

    if (currentKit.length === 0) {
        return { next_id: -1, last_id: -1 };
    }

    const currentOId = currentKit[0].o_id;

    // Fetch the next active kit by o_id
    const nextKit = await db
        .select()
        .from(kits)
        .where(and(gt(kits.o_id, currentOId), eq(kits.active, true)))
        .orderBy(asc(kits.o_id))
        .limit(1);

    // Fetch the last active kit by o_id
    const lastKit = await db
        .select()
        .from(kits)
        .where(and(lt(kits.o_id, currentOId), eq(kits.active, true)))
        .orderBy(desc(kits.o_id))
        .limit(1);

    // Fetch the active kit with the minimum o_id
    const firstKit = await db.select().from(kits).where(eq(kits.active, true)).orderBy(asc(kits.o_id)).limit(1);

    // Fetch the active kit with the maximum o_id
    const maxOIdKit = await db.select().from(kits).where(eq(kits.active, true)).orderBy(desc(kits.o_id)).limit(1);

    const next_id = nextKit.length > 0 ? nextKit[0].id : firstKit[0].id;
    const last_id = lastKit.length > 0 ? lastKit[0].id : maxOIdKit[0].id;

    console.log(`Found next_id: ${next_id} and last_id: ${last_id}`);

    return { next_id, last_id };
}

export async function getMostRecentKitId(): Promise<number | null> {
    console.log('Fetching most recent active kit ID...');
    const kit = await db.select().from(kits).where(eq(kits.active, true)).orderBy(desc(kits.o_id)).limit(1);

    return kit[0]?.id || null;
}

export async function fetchKitImageById(id: number) {
    const kit = await db
        .select({
            image_path: kits.image_path,
            width: kits.width,
            height: kits.height,
        })
        .from(kits)
        .where(and(eq(kits.id, id), eq(kits.active, true)))
        .execute();

    return kit[0] || null;
}

async function fetchSteamUserInfo(steamId: string) {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    if (!STEAM_API_KEY) {
        throw new Error('Steam API key is not set');
    }

    const steamApiUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;

    try {
        const response = await fetch(steamApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.response && data.response.players && data.response.players.length > 0) {
            const player = data.response.players[0];
            return {
                personaname: player.personaname,
                avatarfull: player.avatarfull,
                steamid: player.steamid,
            };
        } else {
            console.log('Steam user not found in API response:', data);
            return {
                personaname: 'Unknown',
                avatarfull: '/default-avatar.png', // Make sure to have a default avatar image
                steamid: steamId,
            };
        }
    } catch (error) {
        console.error('Error fetching Steam user info:', error);
        return {
            personaname: 'Unknown',
            avatarfull: '/default-avatar.png',
            steamid: steamId,
        };
    }
}
