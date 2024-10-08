'use server';
import 'server-only';

import { db } from '@/db/db';
import { user_playtime, wheel_spins } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { determineWinningSlot, PAYOUTS, WheelColor } from './wheelConstants';

async function verifyAuthCode(steamId: string, code: string): Promise<boolean> {
    const user = await db
        .select()
        .from(user_playtime)
        .where(and(eq(user_playtime.steam_id, steamId), eq(user_playtime.auth_code, code)))
        .limit(1);

    return user.length > 0;
}

export async function spinWheel(steamId: string, code: string, currentRotation: number) {
    if (!(await verifyAuthCode(steamId, code))) {
        throw new Error('Invalid auth code');
    }

    const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);

    if (!user.length || user[0].credits < 5) {
        throw new Error('Not enough credits');
    }

    const baseRotation = 5 * 360; // 5 full rotations
    const randomExtraRotation = Math.floor(Math.random() * 360);
    const totalRotation = baseRotation + randomExtraRotation;
    const finalDegree = (currentRotation + totalRotation) % 360;

    const result = determineWinningSlot(finalDegree);

    if (!result) {
        throw new Error('Spin failed');
    }

    // Update user credits
    await db
        .update(user_playtime)
        .set({ credits: user[0].credits - 5 })
        .where(eq(user_playtime.id, user[0].id));

    // Return the result without inserting into wheel_spins yet
    return { result, totalRotation, finalDegree, credits: user[0].credits - 5, userId: user[0].id };
}

export async function recordSpinResult(userId: number, result: WheelColor) {
    const payout = PAYOUTS[result];
    // Insert wheel spin result
    await db.insert(wheel_spins).values({
        user_id: userId,
        result: payout.displayName,
        in_game_item_name: payout.inGameName,
    });
}

export async function getRecentWinners() {
    const winners = await db
        .select({
            player_name: user_playtime.player_name,
            steam_id: user_playtime.steam_id,
            result: wheel_spins.result,
            timestamp: wheel_spins.timestamp,
            profile_picture_url: user_playtime.profile_picture_url,
        })
        .from(wheel_spins)
        .innerJoin(user_playtime, eq(user_playtime.id, wheel_spins.user_id))
        .orderBy(desc(wheel_spins.timestamp))
        .limit(25);

    const winnersWithPictures = await Promise.all(
        winners.map(async (winner) => {
            let profilePictureUrl = winner.profile_picture_url;
            if (!profilePictureUrl) {
                profilePictureUrl = await fetchAndStoreProfilePicture(winner.steam_id);
            }
            const wheelColor = Object.entries(PAYOUTS).find(([_, payout]) => payout.displayName === winner.result)?.[0] as WheelColor;
            return {
                ...winner,
                player_name: winner.player_name || 'Unknown Player',
                timestamp: winner.timestamp?.toISOString() || new Date().toISOString(),
                color: wheelColor || 'Yellow',
                profile_picture_url: profilePictureUrl,
            };
        }),
    );

    return winnersWithPictures;
}

async function fetchAndStoreProfilePicture(steamId: string): Promise<string | null> {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    if (!STEAM_API_KEY) {
        console.error('Steam API key is not set');
        return null;
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
            const profilePictureUrl = player.avatarfull;

            // Store the profile picture URL in the database
            await db.update(user_playtime).set({ profile_picture_url: profilePictureUrl }).where(eq(user_playtime.steam_id, steamId));

            return profilePictureUrl;
        } else {
            console.error('Steam user not found in API response:', data);
            return null;
        }
    } catch (error) {
        console.error('Error fetching Steam profile picture:', error);
        return null;
    }
}

export async function getUserCredits(steamId: string, code: string) {
    if (!(await verifyAuthCode(steamId, code))) {
        throw new Error('Invalid auth code');
    }

    const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);

    if (!user.length) {
        throw new Error('User not found');
    }

    return { credits: user[0].credits };
}

// Function to verify Steam profile
export async function verifySteamProfile(profileUrl: string) {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    if (!STEAM_API_KEY) {
        throw new Error('Steam API key is not set');
    }

    // Extract the Steam ID from the profile URL
    const steamId = await extractSteamIdFromUrl(profileUrl);
    if (!steamId) {
        throw new Error('Invalid Steam profile URL');
    }

    const steamApiUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;

    try {
        const response = await fetch(steamApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Steam API response:', data);

        if (data.response && data.response.players && data.response.players.length > 0) {
            const player = data.response.players[0];
            return {
                name: player.personaname,
                avatarUrl: player.avatarfull,
                steamId: player.steamid,
            };
        } else {
            console.error('Steam user not found in API response:', data);
            throw new Error('Steam user not found');
        }
    } catch (error) {
        console.error('Error verifying Steam profile:', error);
        throw error;
    }
}

// Helper function to extract Steam ID from URL
async function extractSteamIdFromUrl(url: string): Promise<string | null> {
    // Custom ID format: https://steamcommunity.com/id/[custom_id]
    const customIdMatch = url.match(/steamcommunity\.com\/id\/([^\/]+)/);
    if (customIdMatch) {
        // For custom IDs, we need to make an additional API call to get the Steam ID
        return await resolveVanityUrl(customIdMatch[1]);
    }

    // Steam ID format: https://steamcommunity.com/profiles/[steam_id]
    const steamIdMatch = url.match(/steamcommunity\.com\/profiles\/(\d+)/);
    if (steamIdMatch) {
        return steamIdMatch[1];
    }

    return null;
}

// Helper function to resolve vanity URL
async function resolveVanityUrl(vanityUrl: string): Promise<string | null> {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    if (!STEAM_API_KEY) {
        throw new Error('Steam API key is not set');
    }

    const apiUrl = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${vanityUrl}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.response && data.response.success === 1) {
            return data.response.steamid;
        } else {
            console.error('Failed to resolve vanity URL:', data);
            return null;
        }
    } catch (error) {
        console.error('Error resolving vanity URL:', error);
        return null;
    }
}
