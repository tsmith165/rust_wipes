'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/db';
import { user_playtime, slot_machine_spins, bonus_spins } from '@/db/schema';
import { eq, and, sql, or, desc } from 'drizzle-orm';
import { getRandomSymbol, getRandomSymbolExcludingBonus, getWrappedSlice } from './Default.Utils';
import { SLOT_ITEMS, PAYOUT_VALUES, MULTIPLIER_VALUES, WINNING_PATTERNS, BONUS_SYMBOL } from './Default.Constants';

/**
 * Helper function to fetch and store profile picture.
 */
async function fetchAndStoreProfilePicture(steamId: string): Promise<string | null> {
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

// Base response type for all API responses
export interface ActionResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Payout item type
export interface PayoutItem {
    quantity: number;
    full_name: string;
    item: string;
}

// Multiplier type
export interface StickyMultiplier {
    x: number;
    y: number;
    multiplier: number;
}

// Spin result type
export interface SpinResult {
    finalVisibleGrid: string[][];
    spinAmounts: number[];
    credits: number;
    freeSpinsAvailable: number;
    winningCells: number[][];
    bonusCells: number[][];
    winningLines: number[][][];
    bonusSpinsAwarded: number;
    stickyMultipliers: StickyMultiplier[];
    needsBonusTypeSelection: boolean;
    payout: PayoutItem[];
    bonusTriggered: boolean;
}

// Steam profile type
export interface SteamProfile {
    name: string;
    avatarUrl: string;
    steamId: string;
}

// Winner type
export interface Winner {
    player_name: string;
    steam_id: string;
    payout: PayoutItem[];
    free_spins_won: number;
    bonus_type: string;
    timestamp: string;
    profile_picture_url: string | null;
    pending_bonus_amount: number;
}

// Winner with pictures type
export interface WinnerWithPictures {
    player_name: string;
    steam_id: string;
    payout: Array<{ item: string; full_name: string; quantity: number }>;
    free_spins_won: number;
    bonus_type: string;
    timestamp: string;
    profile_picture_url: string | null;
    pending_bonus_amount: number;
}

export async function spin(steamId: string, code: string): Promise<ActionResponse<SpinResult>> {
    try {
        const response = await fetch('/api/gambling/slots/default/spin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ steamId, code }),
        });

        if (!response.ok) {
            throw new Error('Failed to spin');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error during spin:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred during spin',
        };
    }
}

/**
 * Retrieves the most recent slot machine winners.
 */
export async function getRecentWinners(): Promise<ActionResponse<WinnerWithPictures[]>> {
    try {
        // First, get all recent wins from slot_machine_spins
        const winners = await db
            .select({
                player_name: user_playtime.player_name,
                steam_id: user_playtime.steam_id,
                payout: slot_machine_spins.payout,
                timestamp: slot_machine_spins.timestamp,
                profile_picture_url: user_playtime.profile_picture_url,
                free_spins_won: slot_machine_spins.free_spins_won,
                user_id: user_playtime.id,
            })
            .from(slot_machine_spins)
            .innerJoin(user_playtime, eq(user_playtime.id, slot_machine_spins.user_id))
            .where(or(sql`${slot_machine_spins.payout} != '[]'`, sql`${slot_machine_spins.free_spins_won} > 0`))
            .orderBy(desc(slot_machine_spins.timestamp))
            .limit(25);

        // Also get any pending bonuses that haven't been recorded in slot_machine_spins yet
        const pendingBonuses = await db
            .select({
                player_name: user_playtime.player_name,
                steam_id: user_playtime.steam_id,
                profile_picture_url: user_playtime.profile_picture_url,
                user_id: user_playtime.id,
                pending_bonus_amount: bonus_spins.pending_bonus_amount,
                last_updated: bonus_spins.last_updated,
            })
            .from(bonus_spins)
            .innerJoin(user_playtime, eq(user_playtime.id, bonus_spins.user_id))
            .where(eq(bonus_spins.pending_bonus, true));

        // Convert pending bonuses to the same format as winners
        const pendingBonusWinners = pendingBonuses.map((bonus) => ({
            player_name: bonus.player_name || 'Unknown Player',
            steam_id: bonus.steam_id,
            payout: [],
            timestamp: bonus.last_updated,
            profile_picture_url: bonus.profile_picture_url,
            free_spins_won: -1, // Use -1 to indicate pending
            user_id: bonus.user_id,
            pending_bonus_amount: bonus.pending_bonus_amount,
        }));

        // Combine and sort all winners
        const allWinners = [...winners, ...pendingBonusWinners]
            .sort((a, b) => {
                const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 25); // Keep only the 25 most recent

        const winnersWithPictures: WinnerWithPictures[] = await Promise.all(
            allWinners.map(async (winner) => {
                let profilePictureUrl = winner.profile_picture_url;
                if (!profilePictureUrl) {
                    const fetchResult = await fetchAndStoreProfilePicture(winner.steam_id);
                    profilePictureUrl = fetchResult;
                }

                // Get bonus type for this spin if free spins were won
                let bonusType = '';
                if (winner.free_spins_won > 0) {
                    const bonusSpinData = await db
                        .select()
                        .from(bonus_spins)
                        .where(eq(bonus_spins.user_id, winner.user_id))
                        .orderBy(desc(bonus_spins.last_updated))
                        .limit(1);

                    if (bonusSpinData.length > 0) {
                        bonusType = bonusSpinData[0].bonus_type;
                    }
                }

                let payoutData: { item: string; full_name: string; quantity: number }[] = [];
                try {
                    if (Array.isArray(winner.payout)) {
                        payoutData = winner.payout as { item: string; full_name: string; quantity: number }[];
                    } else {
                        console.warn('Payout data is not an array. Skipping payout.');
                    }
                } catch (parseError) {
                    console.error('Error parsing payout data:', parseError);
                }

                return {
                    player_name: winner.player_name || 'Unknown Player',
                    timestamp: winner.timestamp ? new Date(winner.timestamp).toISOString() : new Date().toISOString(),
                    payout: Array.isArray(payoutData) ? payoutData : [payoutData],
                    free_spins_won: winner.free_spins_won,
                    bonus_type: bonusType,
                    profile_picture_url: profilePictureUrl,
                    steam_id: winner.steam_id,
                    pending_bonus_amount: ('pending_bonus_amount' in winner ? winner.pending_bonus_amount : 0) as number,
                };
            }),
        );

        return { success: true, data: winnersWithPictures };
    } catch (error) {
        console.error('Error in getRecentWinners:', error);
        return { success: false, error: 'Failed to fetch recent winners.' };
    }
}

export async function selectBonusType(steamId: string, code: string, bonusType: 'normal' | 'sticky'): Promise<ActionResponse<SpinResult>> {
    try {
        const response = await fetch('/api/gambling/slots/default/select-bonus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ steamId, code, bonusType }),
        });

        if (!response.ok) {
            throw new Error('Failed to select bonus type');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error selecting bonus type:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred while selecting bonus type',
        };
    }
}
