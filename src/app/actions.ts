'use server';

import { eq, desc, asc, gt, lt, and, inArray, like } from 'drizzle-orm';
import { db, kits, KitExtraImages, rw_servers, player_stats, next_wipe_info, map_options, map_votes } from '@/db/db';
import { KitsWithExtraImages, RwServer, PlayerStats, NextWipeInfo, MapOptions, MapVotes } from '@/db/schema';
import { SQL } from 'drizzle-orm';

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
        .orderBy(desc(kits.o_id));

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
            console.error('Steam user not found in API response:', data);
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
