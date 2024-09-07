'use server';
import 'server-only';

import { db } from '@/db/db';
import { user_playtime, wheel_spins } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    // Insert wheel spin result
    await db.insert(wheel_spins).values({
        user_id: user[0].id,
        result: result.payout,
    });

    return { result, totalRotation, finalDegree, credits: user[0].credits - 5 };
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
        .orderBy(wheel_spins.timestamp)
        .limit(10);

    return winners;
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
