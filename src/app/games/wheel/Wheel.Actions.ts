'use server';

import { db } from '@/db/db';
import { user_playtime, wheel_spins, bonus_spins, slot_machine_spins } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { determineWinningSlot, PAYOUTS, WheelResult, WheelColor } from './Wheel.Constants';
import { verifyAuthCode } from '@/app/games/Gambling.Actions';
import { INITIAL_BONUS_SPINS } from '@/app/games/rusty-slots/RustySlots.Constants';
import { setSlotBonusType } from '@/app/games/rusty-slots/RustySlots.Actions';

// Standardized response interface
interface ActionResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Response types
export interface SpinWheelData {
    result: WheelResult;
    totalRotation: number;
    finalDegree: number;
    credits: number;
    userId: number;
    bonusAwarded?: {
        type: 'normal' | 'sticky';
        spins: number;
    };
}

export interface WinnerWithPictures {
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

/**
 * Spins the wheel and determines the result
 * @param steamId - The user's Steam ID
 * @param code - The authentication code
 * @param currentRotation - The current rotation of the wheel
 * @returns ActionResponse containing spin result data
 */
export async function spinWheel(steamId: string, code: string, currentRotation: number): Promise<ActionResponse<SpinWheelData>> {
    try {
        // Verify authentication
        const isAuthValid = await verifyAuthCode(steamId, code);
        if (!isAuthValid) {
            return { success: false, error: 'Invalid authentication code' };
        }

        // Get user data and verify credits
        const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);
        if (!user.length) {
            return { success: false, error: 'User not found' };
        }

        if (user[0].credits < 5) {
            return { success: false, error: 'Not enough credits (5 required)' };
        }

        // Calculate spin result
        const baseRotation = 5 * 360; // 5 full rotations for dramatic effect
        const randomExtraRotation = Math.floor(Math.random() * 360);
        const totalRotation = baseRotation + randomExtraRotation;
        const finalDegree = (currentRotation + totalRotation) % 360;

        const result = determineWinningSlot(finalDegree);
        if (!result) {
            return { success: false, error: 'Failed to determine winning slot' };
        }

        // Update user credits
        await db
            .update(user_playtime)
            .set({ credits: user[0].credits - 5 })
            .where(eq(user_playtime.id, user[0].id));

        // Record spin result
        await db.insert(wheel_spins).values({
            user_id: user[0].id,
            result: PAYOUTS[result.color].displayName,
            in_game_item_name: PAYOUTS[result.color].inGameName,
            timestamp: new Date(), // Add timestamp explicitly
        });

        // Handle bonus win
        let bonusAwarded: { type: 'normal' | 'sticky'; spins: number } | undefined;
        if (PAYOUTS[result.color].displayName === '3x Bonus') {
            // Create pending bonus entry
            await db.insert(bonus_spins).values({
                user_id: user[0].id,
                spins_remaining: 0, // Will be set when type is selected
                bonus_type: '', // Will be set when type is selected
                sticky_multipliers: [],
                pending_bonus: true,
                pending_bonus_amount: 3, // 3x bonus
                last_updated: new Date(),
            });

            bonusAwarded = {
                type: 'normal' as const, // Will be updated when user selects
                spins: 3,
            };
        }

        return {
            success: true,
            data: {
                result,
                totalRotation,
                finalDegree,
                credits: user[0].credits - 5,
                userId: user[0].id,
                bonusAwarded,
            },
        };
    } catch (error) {
        console.error('Error in spinWheel:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        };
    }
}

/**
 * Fetches recent wheel winners with their profile pictures
 * @returns ActionResponse containing array of recent winners
 */
export async function getRecentWinners(): Promise<ActionResponse<WinnerWithPictures[]>> {
    try {
        const recentSpins = await db
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
            .limit(10);

        const winnersWithPictures = recentSpins.map((winner) => {
            // Find the color by matching the display name
            const colorEntry = Object.entries(PAYOUTS).find(([_, payout]) => payout.displayName === winner.result);
            const color = colorEntry ? (colorEntry[0] as WheelColor) : 'Yellow'; // Default to Yellow if not found

            return {
                player_name: winner.player_name || 'Unknown Player',
                steam_id: winner.steam_id,
                result: winner.result,
                timestamp: winner.timestamp?.toISOString() || new Date().toISOString(),
                payout: [
                    {
                        item: PAYOUTS[color].inGameName,
                        full_name: PAYOUTS[color].displayName,
                        quantity: 1,
                    },
                ],
                free_spins_won: 0, // Wheel doesn't have free spins
                color,
                profile_picture_url: winner.profile_picture_url,
            };
        });

        return { success: true, data: winnersWithPictures };
    } catch (error) {
        console.error('Error in getRecentWinners:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch recent winners',
        };
    }
}

/**
 * Creates a fake spin record to show bonus spins in recent winners
 */
export async function createBonusSpinRecord(steamId: string, authCode: string, spinsAwarded: number): Promise<ActionResponse<void>> {
    try {
        // Verify authentication
        const isAuthValid = await verifyAuthCode(steamId, authCode);
        if (!isAuthValid) {
            return { success: false, error: 'Invalid auth code' };
        }

        // Get user ID from user_playtime table
        const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);
        if (!user.length) {
            return { success: false, error: 'User not found' };
        }

        // Create fake spin record
        await db.insert(slot_machine_spins).values({
            user_id: user[0].id,
            result: [], // Empty array for result
            payout: [], // Empty array for payout
            free_spins_won: spinsAwarded,
            free_spins_used: 0,
            redeemed: false,
            payout_redeemed: {}, // Empty object for payout_redeemed
        });

        return { success: true };
    } catch (error) {
        console.error('Error creating bonus spin record:', error);
        return { success: false, error: 'Failed to create bonus spin record' };
    }
}

export const setBonusType = setSlotBonusType;

export async function checkPendingBonus(
    steamId: string,
    code: string,
): Promise<ActionResponse<{ pending: boolean; amount: number; spins_remaining: number; bonus_type: string }>> {
    try {
        // Verify authentication
        const isAuthValid = await verifyAuthCode(steamId, code);
        if (!isAuthValid) {
            return { success: false, error: 'Invalid auth code' };
        }

        // Retrieve user
        const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);
        if (!user.length) {
            return { success: false, error: 'User not found' };
        }

        // Check for pending bonus
        const bonusSpinsData = await db.select().from(bonus_spins).where(eq(bonus_spins.user_id, user[0].id)).limit(1);
        if (!bonusSpinsData.length) {
            return {
                success: true,
                data: {
                    pending: false,
                    amount: 0,
                    spins_remaining: 0,
                    bonus_type: '',
                },
            };
        }

        return {
            success: true,
            data: {
                pending: bonusSpinsData[0].pending_bonus,
                amount: bonusSpinsData[0].pending_bonus_amount,
                spins_remaining: bonusSpinsData[0].spins_remaining,
                bonus_type: bonusSpinsData[0].bonus_type,
            },
        };
    } catch (error) {
        console.error('Error checking pending bonus:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
