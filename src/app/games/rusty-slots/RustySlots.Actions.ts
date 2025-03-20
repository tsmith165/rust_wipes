'use server';

import { db } from '@/db/db';
import { user_playtime, slot_machine_spins, bonus_spins } from '@/db/schema';
import { eq, and, sql, or, desc } from 'drizzle-orm';
import {
    BONUS_SYMBOL,
    BASE_PAYOUTS,
    WINNING_LINES,
    SLOT_ITEMS_NO_MULTIPLIERS,
    INITIAL_BONUS_SPINS,
    RETRIGGER_BONUS_SPINS,
} from '@/app/games/rusty-slots/RustySlots.Constants';
import { getRandomSymbol, getRandomSymbolExcludingBonus } from '@/app/games/rusty-slots/RustySlots.Utils';

// **Define a standardized response interface**
interface ActionResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

const REEL_SIZE = 5;
// const VISIBLE_ITEMS = 5;
const MIN_SPIN = 80;
const MAX_SPIN = 120;

export interface SpinResult {
    finalVisibleGrid: string[][];
    spinAmounts: number[];
    payout: { item: string; full_name: string; quantity: number }[];
    bonusTriggered: boolean;
    bonusSpinsAwarded: number;
    credits: number;
    freeSpinsAvailable: number;
    winningCells: number[][]; // [x, y]
    bonusCells: number[][]; // [x, y]
    winningLines: number[][][]; // [[x, y]]
    stickyMultipliers?: { x: number; y: number; multiplier: number }[];
    needsBonusTypeSelection?: boolean;
    totalWin?: { item: string; full_name: string; quantity: number }[];
    inProgress?: boolean;
}

interface WinnerWithPictures {
    player_name: string;
    steam_id: string;
    payout: { item: string; full_name: string; quantity: number }[];
    free_spins_won: number;
    bonus_type: string;
    timestamp: string;
    profile_picture_url: string | null;
    pending_bonus_amount: number;
}

interface SteamProfile {
    name: string;
    avatarUrl: string;
    steamId: string;
}

/**
 * Type Guard to verify if data is of type { x: number; y: number; multiplier: number }[]
 */
// function isStickyMultipliersArray(
//     data: { x: number; y: number; multiplier: number }[],
// ): data is { x: number; y: number; multiplier: number }[] {
//     return Array.isArray(data) && data.every((item) => typeof item === 'object' && 'x' in item && 'y' in item && 'multiplier' in item);
// }

/**
 * Type Guard to verify if data is of type string[][]
 */
// function isStringDoubleArray(data: unknown): data is string[][] {
//     return Array.isArray(data) && data.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === 'string'));
// }

/**
 * Standardized spinSlotMachine function with ActionResponse.
 */
export async function spinSlotMachine(steamId: string, code: string, bonusType?: 'normal' | 'sticky'): Promise<ActionResponse<SpinResult>> {
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

        // Check if user has a bonus spin record
        const bonusSpinsExistingData = await db.select().from(bonus_spins).where(eq(bonus_spins.user_id, user[0].id)).limit(1);

        if (bonusSpinsExistingData.length === 0) {
            // If no bonus spin record exists, create a new one
            await db.insert(bonus_spins).values({
                user_id: user[0].id,
                spins_remaining: 0,
                bonus_type: '',
                sticky_multipliers: [], // Assign as an empty array
                total_win: [], // Initialize empty total wins
                last_updated: new Date(),
                in_progress: false, // Initialize as not in progress
            });
        }

        const bonusSpinsData = await db.select().from(bonus_spins).where(eq(bonus_spins.user_id, user[0].id)).limit(1);

        let freeSpinsAvailable = bonusSpinsData.length > 0 ? bonusSpinsData[0].spins_remaining : 0;
        let existingBonusType: 'normal' | 'sticky' = 'normal';
        let existingStickyMultipliers: { x: number; y: number; multiplier: number }[] = [];

        if (bonusSpinsData.length > 0) {
            existingBonusType = bonusSpinsData[0].bonus_type as 'normal' | 'sticky';

            // Parse sticky_multipliers from JSON string
            try {
                if (typeof bonusSpinsData[0].sticky_multipliers === 'string') {
                    existingStickyMultipliers = JSON.parse(bonusSpinsData[0].sticky_multipliers);
                } else if (Array.isArray(bonusSpinsData[0].sticky_multipliers)) {
                    existingStickyMultipliers = bonusSpinsData[0].sticky_multipliers;
                }
            } catch (error) {
                console.warn('Error parsing sticky_multipliers:', error);
                existingStickyMultipliers = [];
            }

            // Sort sticky multipliers by `y` first and then `x` to preserve order
            existingStickyMultipliers.sort((a, b) => a.y - b.y || a.x - b.x);
        }

        if (user[0].credits < 5 && freeSpinsAvailable === 0) {
            // Return the current credit amount so the client can update
            return {
                success: false,
                error: 'Not enough credits or free spins',
                data: {
                    finalVisibleGrid: [[]],
                    spinAmounts: [],
                    payout: [],
                    bonusTriggered: false,
                    bonusSpinsAwarded: 0,
                    credits: user[0].credits,
                    freeSpinsAvailable: freeSpinsAvailable,
                    winningCells: [],
                    bonusCells: [],
                    winningLines: [],
                },
            };
        }

        // Determine the selected bonus type
        let selectedBonusType: 'normal' | 'sticky' | '' = '';
        if (bonusType) {
            selectedBonusType = bonusType;
        } else {
            selectedBonusType = existingBonusType;
        }

        // Generate the entire grid with sticky multipliers integrated
        const finalVisibleGrid = Array(REEL_SIZE)
            .fill(0)
            .map((_, reelIndex) => {
                const reelSymbols: string[] = [];
                let skipBonusUntilIndex = -1;
                let position = 0;

                while (reelSymbols.length < REEL_SIZE) {
                    // Check for sticky multiplier first
                    const stickyMultiplier = checkForStickyMultiplier(reelIndex, position, existingStickyMultipliers);
                    if (stickyMultiplier) {
                        // Apply the sticky multiplier
                        reelSymbols.push(`${stickyMultiplier.multiplier}x_multiplier`);
                        position++;
                        continue;
                    }

                    // If no sticky multiplier, proceed with normal symbol generation
                    let symbol: string;
                    if (position <= skipBonusUntilIndex) {
                        symbol = getRandomSymbolExcludingBonus();
                    } else {
                        symbol = getRandomSymbol();
                        if (symbol === BONUS_SYMBOL) {
                            skipBonusUntilIndex = position + 4;
                        }
                    }

                    reelSymbols.push(symbol);
                    position++;
                }

                return reelSymbols;
            });

        // Generate spin amounts for each reel
        const spinAmounts = Array(REEL_SIZE)
            .fill(0)
            .map(() => Math.floor(Math.random() * (MAX_SPIN - MIN_SPIN + 1)) + MIN_SPIN);

        // Calculate payout and get win information
        const { payout, winningLines, winningCells, bonusCells } = calculatePayout(finalVisibleGrid);

        // Identify multipliers in the spin result
        const currentMultipliers: { x: number; y: number; multiplier: number }[] = [];
        finalVisibleGrid.forEach((column, x) => {
            column.forEach((symbol, y) => {
                if (symbol.startsWith('2x_multiplier')) {
                    currentMultipliers.push({ x, y, multiplier: 2 });
                } else if (symbol.startsWith('3x_multiplier')) {
                    currentMultipliers.push({ x, y, multiplier: 3 });
                } else if (symbol.startsWith('5x_multiplier')) {
                    currentMultipliers.push({ x, y, multiplier: 5 });
                }
            });
        });

        // Count the number of bonus symbols in the final grid
        let bonusCountFinal = 0;
        finalVisibleGrid.forEach((column) => {
            column.forEach((symbol) => {
                if (symbol === BONUS_SYMBOL) {
                    bonusCountFinal++;
                }
            });
        });

        // Initialize spinsAwarded
        let spinsAwarded = 0;
        let needsBonusTypeSelection = false;

        if (bonusCountFinal >= 3) {
            // If this is a new bonus trigger (no existing bonus type), set needsBonusTypeSelection
            if (!selectedBonusType) {
                needsBonusTypeSelection = true;
                // Set pending bonus in the database
                await db
                    .update(bonus_spins)
                    .set({
                        pending_bonus: true,
                        pending_bonus_amount: bonusCountFinal,
                        last_updated: new Date(),
                    })
                    .where(eq(bonus_spins.user_id, user[0].id));
            } else {
                // Existing bonus type - award spins based on whether this is a retrigger
                const bonusTable = freeSpinsAvailable > 0 ? RETRIGGER_BONUS_SPINS : INITIAL_BONUS_SPINS;
                spinsAwarded = bonusTable[selectedBonusType][bonusCountFinal as 3 | 4 | 5] || 0;
                freeSpinsAvailable += spinsAwarded;
            }
        }

        // Update user credits and bonus spins
        let updatedCredits = user[0].credits;

        if (freeSpinsAvailable > 0) {
            freeSpinsAvailable--;

            // Get existing total wins
            let existingTotalWins: { item: string; full_name: string; quantity: number }[] = [];
            if (bonusSpinsData.length > 0) {
                try {
                    existingTotalWins = bonusSpinsData[0].total_win as { item: string; full_name: string; quantity: number }[];
                } catch (error) {
                    console.warn('Error parsing existing total wins:', error);
                }
            }

            // Aggregate new wins with existing wins
            const updatedTotalWins = aggregateWins(existingTotalWins, payout);

            // Update bonus_spins table to decrement spins_remaining and update total wins
            await db
                .update(bonus_spins)
                .set({
                    spins_remaining: freeSpinsAvailable,
                    sticky_multipliers: selectedBonusType === 'sticky' ? JSON.stringify(currentMultipliers) : '[]',
                    total_win: updatedTotalWins,
                    last_updated: new Date(),
                })
                .where(eq(bonus_spins.user_id, user[0].id));

            // If this is the final spin, we need to keep the total_win for display
            // We'll reset it in a separate update after the client has shown it
            if (freeSpinsAvailable === 0) {
                // Reset bonus type and sticky multipliers, but keep total_win
                await db
                    .update(bonus_spins)
                    .set({
                        bonus_type: '',
                        sticky_multipliers: '[]',
                        last_updated: new Date(),
                        in_progress: false, // Set to false when bonus ends
                    })
                    .where(eq(bonus_spins.id, bonusSpinsData[0].id));

                // Schedule a cleanup of total_win after client has had time to display it
                setTimeout(async () => {
                    await db
                        .update(bonus_spins)
                        .set({
                            total_win: '[]',
                        })
                        .where(eq(bonus_spins.id, bonusSpinsData[0].id));
                }, 5000); // Give plenty of time for client to show the total win
            }
        } else {
            updatedCredits -= 5;
        }

        // Update user credits
        await db.update(user_playtime).set({ credits: updatedCredits }).where(eq(user_playtime.id, user[0].id));

        // Remove the reset of total_win from here since we handle it above
        if (freeSpinsAvailable === 0 && bonusSpinsData.length > 0) {
            await db
                .update(bonus_spins)
                .set({
                    bonus_type: '',
                    sticky_multipliers: '[]',
                    last_updated: new Date(),
                })
                .where(eq(bonus_spins.id, bonusSpinsData[0].id));
        }

        // Record spin result with pending bonus information
        await db.insert(slot_machine_spins).values({
            user_id: user[0].id,
            result: finalVisibleGrid,
            payout: payout,
            free_spins_won: needsBonusTypeSelection ? 0 : spinsAwarded,
            free_spins_used: freeSpinsAvailable > 0 ? 1 : 0,
            redeemed: payout.length === 0,
        });

        // Prepare the SpinResult
        const spinResult: SpinResult = {
            finalVisibleGrid,
            spinAmounts,
            payout,
            bonusTriggered: bonusCountFinal >= 3,
            bonusSpinsAwarded: spinsAwarded,
            credits: updatedCredits,
            freeSpinsAvailable,
            winningCells,
            bonusCells,
            winningLines,
            stickyMultipliers: selectedBonusType === 'sticky' ? currentMultipliers : [],
            needsBonusTypeSelection,
            totalWin:
                freeSpinsAvailable > 0 || (freeSpinsAvailable === 0 && bonusSpinsData[0]?.total_win)
                    ? (bonusSpinsData[0]?.total_win as { item: string; full_name: string; quantity: number }[])
                    : undefined,
            inProgress: bonusSpinsData[0]?.in_progress || false,
        };

        return { success: true, data: spinResult };
    } catch (error) {
        console.error('Error in spinSlotMachine:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

function checkForStickyMultiplier(
    x: number,
    y: number,
    stickyMultipliers: { x: number; y: number; multiplier: number }[],
): { x: number; y: number; multiplier: number } | null {
    for (const mult of stickyMultipliers) {
        if (mult.x === x && mult.y === y) {
            return mult;
        }
    }
    return null;
}

function calculatePayout(grid: string[][]): {
    payout: { item: string; full_name: string; quantity: number }[];
    bonusCount: number;
    winningLines: number[][][];
    winningCells: number[][];
    bonusCells: number[][];
} {
    const payout: { item: string; full_name: string; quantity: number }[] = [];
    const winningLines: number[][][] = [];
    const winningCells: number[][] = [];
    const bonusCells: number[][] = [];

    // Track bonus cells first
    grid.forEach((column, x) => {
        column.forEach((symbol, y) => {
            if (symbol === BONUS_SYMBOL) {
                bonusCells.push([x, y]);
            }
        });
    });

    // Function to validate a line considering multipliers
    const checkLine = (line: number[][], line_type_string: string) => {
        console.log(`Checking ${line_type_string} line: `, line);

        let consecutiveCount = 0;
        let primarySymbol: string | null = null;
        let shouldMultiply = true;
        const lineMultipliers: number[] = [];
        const lineMatches: number[][] = [];

        for (let i = 0; i < line.length; i++) {
            const [x, y] = line[i];
            const symbol = grid[x][y];

            // If primary symbol is not set yet, set it
            if (
                !primarySymbol &&
                !symbol.startsWith('2x_multiplier') &&
                !symbol.startsWith('3x_multiplier') &&
                !symbol.startsWith('5x_multiplier')
            ) {
                primarySymbol = symbol;
                console.log(`Checking if primary symbol (${primarySymbol}) is in: ${SLOT_ITEMS_NO_MULTIPLIERS}`);
                if (SLOT_ITEMS_NO_MULTIPLIERS.includes(primarySymbol)) {
                    shouldMultiply = false;
                }
                console.log(`Found primary symbol: ${primarySymbol} with shouldMultiply: ${shouldMultiply}`);
                consecutiveCount++; // Start counting matches
                lineMatches.push([x, y]);
            } else if (symbol === primarySymbol) {
                // Continue matching with the primary symbol
                console.log(`Found match: ${symbol} with primarySymbol: ${primarySymbol}`);
                consecutiveCount++;
                lineMatches.push([x, y]);
            } else if (symbol === '2x_multiplier' || symbol === '3x_multiplier' || symbol === '5x_multiplier') {
                // Handle multipliers as wilds
                // Add multiplier to matches and continue to the next reel
                console.log(`Found match: ${symbol} with primarySymbol: ${primarySymbol}`);
                consecutiveCount++;
                lineMultipliers.push(symbol === '2x_multiplier' ? 2 : symbol === '3x_multiplier' ? 3 : 5);
                lineMatches.push([x, y]);
                continue;
            } else {
                // Mismatch found, break the matching sequence
                console.log(`Mismatch found: ${symbol} vs ${primarySymbol}`);
                break;
            }
        }

        console.log(`Final line consecutiveCount: ${consecutiveCount} with primarySymbol: ${primarySymbol}.  Line matches: `, lineMatches);
        // Validate line as winning if at least 3 consecutive symbols/multipliers
        if (consecutiveCount >= 3 && primarySymbol !== null) {
            const item = getSymbolPayout(primarySymbol, consecutiveCount);
            if (item) {
                if (shouldMultiply) {
                    // Apply the cumulative multiplier to the payout
                    console.log(`Applying multipliers with multiplication: ${lineMultipliers} to ${item.quantity}`);
                    for (const multiplier of lineMultipliers) {
                        item.quantity *= multiplier;
                    }
                } else {
                    // Apply the cumulative multiplier to the payout
                    console.log(`Applying multipliers with addition: ${lineMultipliers} to ${item.quantity}`);
                    for (const multiplier of lineMultipliers) {
                        const actualMultiplier = multiplier === 2 ? 1 : multiplier === 3 ? 2 : 3;
                        item.quantity += actualMultiplier;
                    }
                }
                payout.push(item);

                // Add the winning part of the line
                winningLines.push(lineMatches);
                // Add individual cells to winningCells if not already present
                lineMatches.forEach(([x, y]) => {
                    if (!winningCells.some((cell) => cell[0] === x && cell[1] === y)) {
                        winningCells.push([x, y]);
                    }
                });
            }
        }
    };

    // Check all types of lines (horizontal, diagonal, etc.)
    for (const line_type_string of ['horizontal', 'diagonal', 'zigzag_downwards', 'zigzag_upwards'] as const) {
        WINNING_LINES[line_type_string].forEach((line) => checkLine(line, line_type_string));
    }

    // Count the number of bonus symbols in the final grid
    const bonusCount = bonusCells.length;

    return { payout, bonusCount, winningLines, winningCells, bonusCells };
}

/**
 * Retrieves the payout information for a given symbol based on consecutive matches.
 */
function getSymbolPayout(symbol: string, consecutiveCount: number): { item: string; full_name: string; quantity: number } | null {
    const payoutInfo = BASE_PAYOUTS[symbol];
    if (!payoutInfo) return null;

    let quantity = payoutInfo.base_quantity;

    if (['scrap', 'metal_fragments', 'high_quality_metal'].includes(symbol)) {
        // Apply multipliers for resources
        switch (consecutiveCount) {
            case 3:
                quantity *= 1;
                break;
            case 4:
                quantity *= 5;
                break;
            case 5:
                quantity *= 10;
                break;
            default:
                return null;
        }
    } else {
        // For weapons, the quantity is the number of matching symbols minus 2
        quantity = payoutInfo.base_quantity * (consecutiveCount - 2);
    }

    return { item: payoutInfo.item, full_name: payoutInfo.full_name, quantity };
}

/**
 * Sets the bonus type for a user and awards bonus spins accordingly.
 */
export async function setSlotBonusType(steamId: string, code: string, bonusType: 'normal' | 'sticky'): Promise<ActionResponse<number>> {
    try {
        // Verify authentication
        const isAuthValid = await verifyAuthCode(steamId, code);
        if (!isAuthValid) {
            return { success: false, error: 'Invalid auth code' };
        }

        console.log(`Setting bonus type to ${bonusType}`);

        // Retrieve user
        const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);
        if (!user.length) {
            return { success: false, error: 'User not found' };
        }

        // Retrieve the last spin
        const last_win = await db
            .select()
            .from(slot_machine_spins)
            .where(eq(slot_machine_spins.user_id, user[0].id))
            .orderBy(desc(slot_machine_spins.timestamp))
            .limit(1);

        if (last_win.length === 0) {
            console.error('No previous wins found');
            return { success: false, error: 'No previous wins found' };
        }

        // Retrieve bonus spins data to check for pending bonus
        const bonusSpinsData = await db.select().from(bonus_spins).where(eq(bonus_spins.user_id, user[0].id)).limit(1);
        if (!bonusSpinsData.length) {
            return { success: false, error: 'No bonus spins data found' };
        }

        let bonus_spins_awarded = 0;
        if (bonusSpinsData.length > 0 && bonusSpinsData[0].pending_bonus && bonusSpinsData[0].pending_bonus_amount > 0) {
            // Award spins based on the pending amount
            bonus_spins_awarded = INITIAL_BONUS_SPINS[bonusType][bonusSpinsData[0].pending_bonus_amount as 3 | 4 | 5] || 0;

            // Update the existing bonus_spins record
            await db
                .update(bonus_spins)
                .set({
                    bonus_type: bonusType,
                    spins_remaining: bonus_spins_awarded,
                    sticky_multipliers: bonusType === 'sticky' ? bonusSpinsData[0].sticky_multipliers : [], // Keep existing multipliers if sticky
                    pending_bonus: false,
                    pending_bonus_amount: 0,
                    last_updated: new Date(),
                    in_progress: true, // Set to true when bonus starts
                })
                .where(eq(bonus_spins.user_id, user[0].id));

            // Record the awarded spins in slot_machine_spins
            await db.insert(slot_machine_spins).values({
                user_id: user[0].id,
                result: [], // Empty result as this is just recording the bonus
                payout: [], // Empty payout as this is just recording the bonus
                free_spins_won: bonus_spins_awarded,
                free_spins_used: 0,
                redeemed: false,
            });
        } else {
            return { success: false, error: 'No pending bonus found' };
        }

        return { success: true, data: bonus_spins_awarded };
    } catch (error) {
        console.error('Error in setBonusType:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again later.' };
    }
}

/**
 * Retrieves the user's credits and available free spins.
 */
export async function getUserCredits(steamId: string, code: string): Promise<ActionResponse<{ credits: number; freeSpins: number }>> {
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

        // Retrieve bonus spins
        const bonusSpinsData = await db.select().from(bonus_spins).where(eq(bonus_spins.user_id, user[0].id)).limit(1);

        const freeSpinsAvailable = bonusSpinsData.length > 0 ? bonusSpinsData[0].spins_remaining : 0;

        return { success: true, data: { credits: user[0].credits, freeSpins: freeSpinsAvailable } };
    } catch (error) {
        console.error('Error in getUserCredits:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again later.' };
    }
}

/**
 * Verifies the Steam profile URL and retrieves user information.
 */
export async function verifySteamProfile(profileUrl: string): Promise<ActionResponse<SteamProfile>> {
    try {
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

/**
 * Retrieves the most recent slot machine winners.
 */
export async function getRecentSlotWinners(): Promise<ActionResponse<WinnerWithPictures[]>> {
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
        console.error('Error in getRecentSlotWinners:', error);
        return { success: false, error: 'Failed to fetch recent winners.' };
    }
}

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

/**
 * Helper function to extract Steam ID from URL.
 */
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

/**
 * Helper function to resolve vanity URL to Steam ID.
 */
async function resolveVanityUrl(vanityUrl: string): Promise<string | null> {
    try {
        const STEAM_API_KEY = process.env.STEAM_API_KEY;
        if (!STEAM_API_KEY) {
            throw new Error('Steam API key is not set');
        }

        const apiUrl = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${vanityUrl}`;

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

/**
 * Verifies the authentication code for a user.
 */
async function verifyAuthCode(steamId: string, code: string): Promise<boolean> {
    try {
        const user = await db
            .select()
            .from(user_playtime)
            .where(and(eq(user_playtime.steam_id, steamId), eq(user_playtime.auth_code, code)))
            .limit(1);

        return user.length > 0;
    } catch (error) {
        console.error('Error verifying auth code:', error);
        return false;
    }
}

/**
 * Checks if a user has a pending bonus that needs type selection.
 */
export async function checkPendingBonus(steamId: string, code: string): Promise<ActionResponse<{ pending: boolean; amount: number }>> {
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
            return { success: true, data: { pending: false, amount: 0 } };
        }

        return {
            success: true,
            data: {
                pending: bonusSpinsData[0].pending_bonus,
                amount: bonusSpinsData[0].pending_bonus_amount,
            },
        };
    } catch (error) {
        console.error('Error checking pending bonus:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

// Add helper function for aggregating wins
function aggregateWins(
    existingWins: { item: string; full_name: string; quantity: number }[],
    newWins: { item: string; full_name: string; quantity: number }[],
): { item: string; full_name: string; quantity: number }[] {
    const winMap = new Map<string, { full_name: string; quantity: number }>();

    // First, add existing wins to the map
    existingWins.forEach((win) => {
        winMap.set(win.item, { full_name: win.full_name, quantity: win.quantity });
    });

    // Then, add or update with new wins
    newWins.forEach((win) => {
        if (winMap.has(win.item)) {
            const existing = winMap.get(win.item)!;
            winMap.set(win.item, {
                ...existing,
                quantity: existing.quantity + win.quantity,
            });
        } else {
            winMap.set(win.item, { full_name: win.full_name, quantity: win.quantity });
        }
    });

    // Convert map back to array
    return Array.from(winMap.entries()).map(([item, { full_name, quantity }]) => ({
        item,
        full_name,
        quantity,
    }));
}
