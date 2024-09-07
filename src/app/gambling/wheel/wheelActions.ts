'use server';
import 'server-only';

import { db } from '@/db/db';
import { user_playtime, wheel_spins } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { determineWinningSlot } from './wheelConstants';

export async function spinWheel(steamId: string, code: string, currentRotation: number) {
    if (code !== '99999') {
        throw new Error('Invalid code');
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

export async function recordSpinResult(userId: number, result: string) {
    // Insert wheel spin result
    await db.insert(wheel_spins).values({
        user_id: userId,
        result: result,
    });
}

export async function getRecentWinners() {
    const winners = await db
        .select({
            player_name: user_playtime.player_name,
            result: wheel_spins.result,
            timestamp: wheel_spins.timestamp,
        })
        .from(wheel_spins)
        .innerJoin(user_playtime, eq(user_playtime.id, wheel_spins.user_id))
        .orderBy(desc(wheel_spins.timestamp))
        .limit(10);

    return winners.map((winner) => ({
        ...winner,
        player_name: winner.player_name || 'Unknown Player',
        timestamp: winner.timestamp?.toISOString() || new Date().toISOString(),
    }));
}

export async function getUserCredits(steamId: string, code: string) {
    if (code !== '99999') {
        throw new Error('Invalid code');
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
