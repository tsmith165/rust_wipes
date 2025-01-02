'use server';

import { verifySteamProfile } from '@/app/games/rusty-slots/RustySlots.Actions';
import { getUserCredits } from '@/app/games/rusty-slots/RustySlots.Actions';
import { db } from '@/db/db';
import { user_playtime, bonus_spins } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function verifyAndGetCredits(profileUrl: string, authCode: string) {
    try {
        const profileResponse = await verifySteamProfile(profileUrl);
        if (!profileResponse.success || !profileResponse.data) {
            return { success: false, error: profileResponse.error || 'Failed to verify Steam profile' };
        }

        const creditsResponse = await getUserCredits(profileResponse.data.steamId, authCode);
        if (!creditsResponse.success || !creditsResponse.data) {
            return { success: false, error: creditsResponse.error || 'Failed to retrieve user credits' };
        }

        return {
            success: true,
            data: {
                profile: {
                    ...profileResponse.data,
                    steamId: profileResponse.data.steamId,
                },
                credits: creditsResponse.data.credits,
                freeSpins: creditsResponse.data.freeSpins,
            },
        };
    } catch (error) {
        console.error('Error in verifyAndGetCredits:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function fetchUserCredits(steamId: string, authCode: string) {
    try {
        // First verify the auth code matches
        const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);

        if (!user.length) {
            console.log('User not found');
            return { success: false, error: 'User not found' };
        }

        if (user[0].auth_code !== authCode) {
            console.log('Invalid credentials');
            return { success: false, error: 'Invalid credentials' };
        }

        // Get bonus spins if they exist
        const bonusSpinsData = await db.select().from(bonus_spins).where(eq(bonus_spins.user_id, user[0].id)).limit(1);
        const freeSpins = bonusSpinsData.length > 0 ? bonusSpinsData[0].spins_remaining : 0;

        return {
            success: true,
            data: {
                profile: {
                    name: user[0].player_name || 'Unknown Player',
                    avatarUrl: user[0].profile_picture_url || '/steam_icon_small.png',
                    steamId: user[0].steam_id,
                },
                credits: user[0].credits,
                freeSpins,
            },
        };
    } catch (error) {
        console.error('Error fetching user credits:', error);
        return { success: false, error: 'Failed to fetch user credits' };
    }
}

export async function verifyAuthCode(steamId: string, code: string): Promise<boolean> {
    const user = await db
        .select()
        .from(user_playtime)
        .where(and(eq(user_playtime.steam_id, steamId), eq(user_playtime.auth_code, code)))
        .limit(1);

    return user.length > 0;
}
