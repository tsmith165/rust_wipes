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
        // TODO: Implement actual Steam API call to fetch profile picture
        // For now, return a default avatar
        const defaultAvatar = 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';

        // Update user's profile picture in database
        await db
            .update(user_playtime)
            .set({
                profile_picture_url: defaultAvatar,
            })
            .where(eq(user_playtime.steam_id, steamId));

        return defaultAvatar;
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        return null;
    }
}
