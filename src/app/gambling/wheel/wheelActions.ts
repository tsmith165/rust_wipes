'use server';

import { db } from '@/db/db';
import { user_playtime, wheel_spins } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { determineWinningSlot, PAYOUTS, WheelResult, WheelColor, WheelPayout } from './wheelConstants';
import { verifyAuthCode } from '@/app/gambling/Gambling.Actions';

// **Define a precise type for PAYOUTS**
type PayoutsType = {
    [key in WheelColor]: {
        displayName: WheelPayout;
        inGameName: string;
    };
};

// **Ensure PAYOUTS conforms to PayoutsType**
const PAYOUTS_TYPED: PayoutsType = PAYOUTS as PayoutsType;

// **Standardized response interface**
interface ActionResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface WinnerWithPictures {
    player_name: string;
    steam_id: string;
    result: string; // Display name of the payout
    timestamp: string;
    payout: Array<{
        item: string;
        full_name: string;
        quantity: number;
    }>;
    free_spins_won: number;
    color: WheelColor;
    profile_picture_url: string | null;
}

interface SteamProfile {
    name: string;
    avatarUrl: string;
    steamId: string;
}

interface SpinWheelData {
    result: WheelResult;
    totalRotation: number;
    finalDegree: number;
    credits: number;
    userId: number;
}

export interface SpinWheelResponse {
    success: boolean;
    data?: SpinWheelData;
    error?: string;
}

interface RecordSpinResultResponse {
    success: boolean;
    error?: string;
}

export async function spinWheel(steamId: string, code: string, currentRotation: number): Promise<ActionResponse<SpinWheelData>> {
    try {
        // Verify authentication
        const isAuthValid = await verifyAuthCode(steamId, code);
        if (!isAuthValid) {
            return { success: false, error: 'Invalid auth code' };
        }

        const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);

        if (!user.length || user[0].credits < 5) {
            return { success: false, error: 'Not enough credits' };
        }

        const baseRotation = 5 * 360; // 5 full rotations
        const randomExtraRotation = Math.floor(Math.random() * 360);
        const totalRotation = baseRotation + randomExtraRotation;
        const finalDegree = (currentRotation + totalRotation) % 360;

        const result = determineWinningSlot(finalDegree);

        if (!result) {
            return { success: false, error: 'Spin failed' };
        }

        // Update user credits
        await db
            .update(user_playtime)
            .set({ credits: user[0].credits - 5 })
            .where(eq(user_playtime.id, user[0].id));

        // Record the spin result in the database using `result.color` to index PAYOUTS
        await db.insert(wheel_spins).values({
            user_id: user[0].id,
            result: PAYOUTS_TYPED[result.color].displayName,
            in_game_item_name: PAYOUTS_TYPED[result.color].inGameName,
        });

        // Return the successful spin result with `WheelResult`
        return {
            success: true,
            data: {
                result, // WheelResult object
                totalRotation,
                finalDegree,
                credits: user[0].credits - 5,
                userId: user[0].id,
            },
        };
    } catch (error) {
        console.error('Error in spinWheel:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again later.' };
    }
}

export async function recordSpinResult(userId: number, result: WheelColor): Promise<ActionResponse<null>> {
    try {
        const payout = PAYOUTS_TYPED[result];
        // Insert wheel spin result
        await db.insert(wheel_spins).values({
            user_id: userId,
            result: payout.displayName,
            in_game_item_name: payout.inGameName,
        });

        return { success: true };
    } catch (error) {
        console.error('Error in recordSpinResult:', error);
        return { success: false, error: 'Failed to record spin result.' };
    }
}

export async function getRecentWinners(): Promise<ActionResponse<WinnerWithPictures[]>> {
    try {
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

        const winnersWithPictures = winners.map((winner) => {
            // Find the color by matching the display name
            const colorEntry = Object.entries(PAYOUTS).find(([_, payout]) => payout.displayName === winner.result);
            const color = colorEntry ? (colorEntry[0] as WheelColor) : 'Yellow'; // Fallback to Yellow

            return {
                player_name: winner.player_name || 'Unknown Player',
                timestamp: winner.timestamp?.toISOString() || new Date().toISOString(),
                result: winner.result,
                payout: [
                    {
                        item: PAYOUTS[color].inGameName,
                        full_name: PAYOUTS[color].displayName,
                        quantity: 1,
                    },
                ],
                free_spins_won: 0,
                color: color,
                profile_picture_url: winner.profile_picture_url,
                steam_id: winner.steam_id,
            };
        });

        return { success: true, data: winnersWithPictures };
    } catch (error) {
        console.error('Error in getRecentWinners:', error);
        return { success: false, error: 'Failed to fetch recent winners.' };
    }
}

export async function getUserCredits(steamId: string, code: string): Promise<ActionResponse<{ credits: number }>> {
    try {
        if (!(await verifyAuthCode(steamId, code))) {
            return { success: false, error: 'Invalid auth code' };
        }

        const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);

        if (!user.length) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, data: { credits: user[0].credits } };
    } catch (error) {
        console.error('Error in getUserCredits:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again later.' };
    }
}

// Function to verify Steam profile
export async function verifySteamProfile(profileUrl: string): Promise<ActionResponse<SteamProfile>> {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    if (!STEAM_API_KEY) {
        return { success: false, error: 'Steam API key is not set' };
    }

    // Extract the Steam ID from the profile URL
    const steamId = await extractSteamIdFromUrl(profileUrl);
    if (!steamId) {
        return { success: false, error: 'Invalid Steam profile URL' };
    }

    const steamApiUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;

    try {
        const response = await fetch(steamApiUrl);
        if (!response.ok) {
            return { success: false, error: `HTTP error! status: ${response.status}` };
        }
        const data = await response.json();
        console.log('Steam API response:', data);

        if (data.response && data.response.players && data.response.players.length > 0) {
            const player = data.response.players[0];
            return {
                success: true,
                data: {
                    name: player.personaname,
                    avatarUrl: player.avatarfull,
                    steamId: player.steamid,
                },
            };
        } else {
            console.error('Steam user not found in API response:', data);
            return { success: false, error: 'Steam user not found' };
        }
    } catch (error) {
        console.error('Error verifying Steam profile:', error);
        return { success: false, error: 'Error verifying Steam profile' };
    }
}

// Helper function to fetch and store profile picture
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
