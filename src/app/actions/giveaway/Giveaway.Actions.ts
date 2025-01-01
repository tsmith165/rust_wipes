'use server';

import { db } from '@/db/db';
import { user_playtime } from '@/db/schema';
import { gte, sql } from 'drizzle-orm';
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
    console.log(`[GiveawayActions] Fetching data for page ${page}, playersPerPage: ${playersPerPage}`);
    const offset = page * playersPerPage;

    try {
        // Get count of qualified players (10+ hours)
        const qualifiedCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(user_playtime)
            .where(gte(user_playtime.minutes_played, 600))
            .then((result: QueryResult[]) => {
                const count = result[0].count;
                console.log(`[GiveawayActions] Found ${count} qualified players (10+ hours)`);
                return count;
            });

        // Get total player count
        const totalPlayersResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(user_playtime)
            .then((result: QueryResult[]) => {
                const count = result[0].count;
                console.log(`[GiveawayActions] Total players: ${count}`);
                return count;
            });

        // Get players for current page
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

        console.log(`[GiveawayActions] Retrieved ${rawPlayers.length} players for page ${page}`);

        // Debug log for player minutes
        rawPlayers.forEach((player) => {
            console.log(`[GiveawayActions] Player ${player.player_name}: ${player.minutes_played} minutes`);
        });

        const topPlayers: Player[] = await Promise.all(
            rawPlayers.map(async (player) => {
                let profilePicture = player.profile_picture_url;
                if (player.steam_id && !profilePicture) {
                    try {
                        profilePicture = await fetchAndStoreProfilePicture(player.steam_id);
                    } catch (error) {
                        console.error(`[GiveawayActions] Failed to fetch profile picture for ${player.player_name}:`, error);
                    }
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
    } catch (error) {
        console.error('[GiveawayActions] Error fetching giveaway data:', error);
        throw new Error('Failed to fetch giveaway data. Please try again later.');
    }
}
