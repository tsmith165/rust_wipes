'use server';

import { db } from '@/db/db';
import { user_playtime } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { fetchAndStoreProfilePicture } from '@/lib/steam';

interface Player {
    player_name: string;
    minutes_played: number;
    steam_id: string;
    profile_picture?: string | null;
}

export interface GiveawayData {
    qualifiedCount: number;
    topPlayers: Player[];
    totalPlayers: number;
}

interface QueryResult {
    count: number;
}

export async function getGiveawayData(page: number = 0, playersPerPage: number = 3): Promise<GiveawayData> {
    const offset = page * playersPerPage;

    const qualifiedCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(user_playtime)
        .where(eq(user_playtime.minutes_played, 600))
        .then((result: QueryResult[]) => result[0].count);

    const totalPlayersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(user_playtime)
        .then((result: QueryResult[]) => result[0].count);

    const rawPlayers = await db
        .select({
            player_name: user_playtime.player_name,
            minutes_played: user_playtime.minutes_played,
            steam_id: user_playtime.steam_id,
            profile_picture_url: user_playtime.profile_picture_url,
        })
        .from(user_playtime)
        .orderBy(sql`${user_playtime.minutes_played} DESC`)
        .limit(playersPerPage)
        .offset(offset);

    const topPlayers: Player[] = await Promise.all(
        rawPlayers.map(async (player) => {
            let profilePicture = player.profile_picture_url;
            if (player.steam_id && !profilePicture) {
                profilePicture = await fetchAndStoreProfilePicture(player.steam_id);
            }
            return {
                player_name: player.player_name ?? 'Anonymous',
                minutes_played: player.minutes_played ?? 0,
                steam_id: player.steam_id ?? '',
                profile_picture: profilePicture,
            };
        }),
    );

    return {
        qualifiedCount,
        topPlayers,
        totalPlayers: totalPlayersResult,
    };
}
