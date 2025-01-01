'use server';

import { db } from '@/db/db';
import { user_playtime } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Fetches and stores a user's Steam profile picture.
 * Returns the profile picture URL.
 */
export async function fetchAndStoreProfilePicture(steamId: string): Promise<string | null> {
    try {
        const STEAM_API_KEY = process.env.STEAM_API_KEY;
        if (!STEAM_API_KEY) {
            console.error('Steam API key is not set');
            return null;
        }

        const steamApiUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;

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
