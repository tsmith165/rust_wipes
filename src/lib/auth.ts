'use server';

import { db } from '@/db/db';
import { user_playtime } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Verifies a user's auth code against their stored code.
 */
export async function verifyAuthCode(steamId: string): Promise<boolean> {
    try {
        const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);
        if (!user.length) {
            return false;
        }

        // TODO: Implement actual auth code verification
        // For now, just return true for testing
        return true;
    } catch (error) {
        console.error('Error verifying auth code:', error);
        return false;
    }
}
