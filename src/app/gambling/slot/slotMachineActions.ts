'use server';

import { db } from '@/db/db';
import { user_playtime, slot_machine_spins, bonus_spins } from '@/db/schema';
import { eq, and, sql, or, desc } from 'drizzle-orm';
import { BONUS_SYMBOL, BASE_PAYOUTS, WINNING_LINES } from './slotMachineConstants';
import { getRandomSymbol, getRandomSymbolExcludingBonus, getWrappedSlice } from './slotMachineUtils';

const REEL_SIZE = 5;
const VISIBLE_ITEMS = 5;
const MIN_SPIN = 80;
const MAX_SPIN = 120;

interface SpinResult {
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
}

export async function spinSlotMachine(
    steamId: string,
    code: string,
    bonusType?: 'normal' | 'sticky', // Optional parameter for bonus type
): Promise<SpinResult> {
    if (!(await verifyAuthCode(steamId, code))) {
        throw new Error('Invalid auth code');
    }

    const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);

    if (!user.length) {
        throw new Error('User not found');
    }

    const bonusSpinsData = await db.select().from(bonus_spins).where(eq(bonus_spins.user_id, user[0].id)).limit(1);

    let freeSpinsAvailable = bonusSpinsData.length > 0 ? bonusSpinsData[0].spins_remaining : 0;
    let existingBonusType: 'normal' | 'sticky' = 'normal';
    let existingStickyMultipliers: { x: number; y: number; multiplier: number }[] = [];

    if (bonusSpinsData.length > 0) {
        existingBonusType = bonusSpinsData[0].bonus_type as 'normal' | 'sticky';
        existingStickyMultipliers = (bonusSpinsData[0].sticky_multipliers as { x: number; y: number; multiplier: number }[]) || [];

        // Sort sticky multipliers by `y` first and then `x` to preserve order
        existingStickyMultipliers.sort((a, b) => a.y - b.y || a.x - b.x);
    }

    if (user[0].credits < 5 && freeSpinsAvailable === 0) {
        throw new Error('Not enough credits or free spins');
    }

    // Determine the selected bonus type
    let selectedBonusType: 'normal' | 'sticky' | '' = '';
    if (bonusType) {
        selectedBonusType = bonusType;
    } else if (existingBonusType === 'sticky') {
        selectedBonusType = 'sticky';
    } else if (existingBonusType === 'normal') {
        selectedBonusType = 'normal';
    }

    // Generate the entire grid with sticky multipliers integrated
    const finalVisibleGrid = Array(5)
        .fill(0)
        .map((_, reelIndex) => {
            const reelSymbols: string[] = [];
            let skipBonusUntilIndex = -1;
            let position = 0;

            while (reelSymbols.length < REEL_SIZE) {
                let symbol: string;

                // Check for sticky multiplier
                const stickyMultiplier = checkForStickyMutliplier(reelIndex, position, existingStickyMultipliers);
                if (stickyMultiplier) {
                    symbol = `${stickyMultiplier.multiplier}x_multiplier`;

                    reelSymbols.push(symbol);
                    position++;
                } else {
                    if (position <= skipBonusUntilIndex) {
                        // Cannot place bonus symbol
                        symbol = getRandomSymbolExcludingBonus();
                    } else {
                        symbol = getRandomSymbol();
                        if (symbol === BONUS_SYMBOL) {
                            // After placing a bonus symbol, set skipBonusUntilIndex
                            skipBonusUntilIndex = position + 4;
                        }
                    }

                    reelSymbols.push(symbol);
                    position++;
                }
            }

            return reelSymbols;
        });

    // Generate spin amounts for each reel
    const spinAmounts = Array(5)
        .fill(0)
        .map(() => Math.floor(Math.random() * (MAX_SPIN - MIN_SPIN + 1)) + MIN_SPIN);

    // Calculate winning cells and bonus cells
    const { payout, bonusCount, winningLines } = calculatePayout(finalVisibleGrid);

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
        if (selectedBonusType === '') {
            // Bonus type not set and not provided
            spinsAwarded = bonusCountFinal;
            needsBonusTypeSelection = true;
        } else {
            // Assign spins based on the selected bonus type
            if (selectedBonusType === 'normal') {
                if (bonusCountFinal === 3) {
                    spinsAwarded = 10;
                } else if (bonusCountFinal === 4) {
                    spinsAwarded = 15;
                } else if (bonusCountFinal >= 5) {
                    spinsAwarded = 20;
                }
            } else if (selectedBonusType === 'sticky') {
                if (bonusCountFinal === 3) {
                    spinsAwarded = 5;
                } else if (bonusCountFinal === 4) {
                    spinsAwarded = 8;
                } else if (bonusCountFinal >= 5) {
                    spinsAwarded = 10;
                }
            }

            freeSpinsAvailable += spinsAwarded;
        }
    }

    // Update user credits and bonus spins
    let updatedCredits = user[0].credits;

    if (freeSpinsAvailable > 0) {
        freeSpinsAvailable--;
    } else {
        updatedCredits -= 5;
    }

    // Update user credits
    await db.update(user_playtime).set({ credits: updatedCredits }).where(eq(user_playtime.id, user[0].id));

    // Check if user has a bonus spin record in the bonus_spins table
    const bonusSpinsExistingData = await db.select().from(bonus_spins).where(eq(bonus_spins.user_id, user[0].id)).limit(1);

    if (bonusSpinsExistingData.length === 0) {
        // If no bonus spin record exists, create a new one
        await db.insert(bonus_spins).values({
            user_id: user[0].id,
            spins_remaining: 0,
            bonus_type: '',
            sticky_multipliers: JSON.stringify([]),
            last_updated: new Date(),
        });
    }

    // Update existing bonus spins with new multipliers and spins_remaining
    await db
        .update(bonus_spins)
        .set({
            spins_remaining: freeSpinsAvailable,
            bonus_type: selectedBonusType,
            sticky_multipliers: JSON.stringify(currentMultipliers),
            last_updated: new Date(),
        })
        .where(eq(bonus_spins.id, bonusSpinsData[0].id));

    // Reset bonus_type and sticky_multipliers if spins_remaining is zero
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

    // Record spin result
    await db.insert(slot_machine_spins).values({
        user_id: user[0].id,
        result: finalVisibleGrid, // Store as JSON
        payout: payout, // Store as JSON
        free_spins_won: spinsAwarded,
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
        winningCells: [], // Update if necessary
        bonusCells: [], // Update if necessary
        winningLines: winningLines, // Update if necessary
        stickyMultipliers: existingStickyMultipliers,
    };

    if (needsBonusTypeSelection) {
        spinResult.needsBonusTypeSelection = true;
    }

    return spinResult;
}

function checkForStickyMutliplier(x: number, y: number, stickyMultipliers: { x: number; y: number; multiplier: number }[]) {
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
    winningLines: number[][][]; // [[x, y]]
} {
    let payout: { item: string; full_name: string; quantity: number }[] = [];
    const winningLines: number[][][] = [];

    // Function to validate a line considering multipliers
    const checkLine = (line: number[][]) => {
        let consecutiveCount = 0;
        let primarySymbol = null;
        let lineMultiplier = 1;
        let lineMatches = [];

        for (let i = 0; i < line.length; i++) {
            const [x, y] = line[i];
            const symbol = grid[x][y];

            // Handle multipliers as wilds
            if (symbol === '2x_multiplier' || symbol === '3x_multiplier' || symbol === '5x_multiplier') {
                if (symbol === '2x_multiplier') lineMultiplier *= 2;
                if (symbol === '3x_multiplier') lineMultiplier *= 3;
                if (symbol === '5x_multiplier') lineMultiplier *= 5;

                // Add multiplier to matches and continue to the next reel
                consecutiveCount++;
                lineMatches.push([x, y]);
                continue;
            }

            // If primary symbol is not set yet, set it
            if (!primarySymbol) {
                primarySymbol = symbol;
                consecutiveCount++; // Start counting matches
                lineMatches.push([x, y]);
            } else if (symbol === primarySymbol || primarySymbol === null) {
                // Continue matching with the primary symbol
                consecutiveCount++;
                lineMatches.push([x, y]);
            } else {
                // Mismatch found, break the matching sequence
                break;
            }
        }

        // Validate line as winning if at least 3 consecutive symbols/multipliers
        if (consecutiveCount >= 3 && primarySymbol !== null) {
            const item = getSymbolPayout(primarySymbol, consecutiveCount);
            if (item) {
                // Apply the cumulative multiplier to the payout
                item.quantity *= lineMultiplier;
                payout.push(item);

                // Add the winning part of the line
                winningLines.push(lineMatches);
            }
        }
    };

    // Check all types of lines (horizontal, diagonal, etc.)
    WINNING_LINES.horizontal.forEach(checkLine);
    WINNING_LINES.diagonal.forEach(checkLine);
    WINNING_LINES.zigzag_downwards.forEach(checkLine);
    WINNING_LINES.zigzag_upwards.forEach(checkLine);

    // Count the number of bonus symbols in the final grid
    let bonusCount = 0;
    grid.forEach((column) => {
        column.forEach((symbol) => {
            if (symbol === BONUS_SYMBOL) {
                bonusCount++;
            }
        });
    });

    return { payout, bonusCount, winningLines };
}

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

export async function setBonusType(steamId: string, code: string, bonusType: 'normal' | 'sticky'): Promise<number> {
    if (!(await verifyAuthCode(steamId, code))) {
        throw new Error('Invalid auth code');
    }

    console.log(`Setting bonus type to ${bonusType}`);

    const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);
    const last_win = await db
        .select()
        .from(slot_machine_spins)
        .where(eq(slot_machine_spins.user_id, user[0].id))
        .orderBy(desc(slot_machine_spins.timestamp))
        .limit(1);
    if (last_win.length === 0) {
        console.error('No previous wins found');
        throw new Error('No previous wins found');
    }
    let number_of_bonus_symbols_in_last_win = 0;
    if (typeof last_win[0].result === 'object' && last_win[0].result !== null) {
        Object.values(last_win[0].result).forEach((reel) => {
            for (const cell_value of reel) {
                if (cell_value === 'bonus') {
                    number_of_bonus_symbols_in_last_win++;
                }
            }
        });
    }

    if (!user.length) {
        throw new Error('User not found');
    }

    let bonus_spins_awarded = 0;
    // prettier-ignore
    if (bonusType === 'normal') {
        bonus_spins_awarded = number_of_bonus_symbols_in_last_win == 5 ? 20 : number_of_bonus_symbols_in_last_win == 4 ? 15 : number_of_bonus_symbols_in_last_win == 3 ? 10 : 0;
    } else if (bonusType === 'sticky') {
        bonus_spins_awarded = number_of_bonus_symbols_in_last_win == 5 ? 10 : number_of_bonus_symbols_in_last_win == 4 ? 8 : number_of_bonus_symbols_in_last_win == 3 ? 5 : 0;
    }

    await db
        .update(bonus_spins)
        .set({ bonus_type: bonusType, spins_remaining: bonus_spins_awarded, last_updated: new Date() })
        .where(eq(bonus_spins.user_id, user[0].id));

    // return number of spins remaining
    return bonus_spins_awarded;
}

export async function getUserCredits(steamId: string, code: string) {
    if (!(await verifyAuthCode(steamId, code))) {
        throw new Error('Invalid auth code');
    }

    const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);

    if (!user.length) {
        throw new Error('User not found');
    }

    const bonusSpinsData = await db.select().from(bonus_spins).where(eq(bonus_spins.user_id, user[0].id)).limit(1);

    const freeSpinsAvailable = bonusSpinsData.length > 0 ? bonusSpinsData[0].spins_remaining : 0;

    return { credits: user[0].credits, freeSpins: freeSpinsAvailable };
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

async function verifyAuthCode(steamId: string, code: string): Promise<boolean> {
    const user = await db
        .select()
        .from(user_playtime)
        .where(and(eq(user_playtime.steam_id, steamId), eq(user_playtime.auth_code, code)))
        .limit(1);

    return user.length > 0;
}

export async function getRecentSlotWinners() {
    const winners = await db
        .select({
            player_name: user_playtime.player_name,
            steam_id: user_playtime.steam_id,
            payout: slot_machine_spins.payout,
            timestamp: slot_machine_spins.timestamp,
            profile_picture_url: user_playtime.profile_picture_url,
            free_spins_won: slot_machine_spins.free_spins_won,
        })
        .from(slot_machine_spins)
        .innerJoin(user_playtime, eq(user_playtime.id, slot_machine_spins.user_id))
        .where(or(sql`${slot_machine_spins.payout} != '[]'`, sql`${slot_machine_spins.free_spins_won} > 0`))
        .orderBy(desc(slot_machine_spins.timestamp))
        .limit(25);

    const winnersWithPictures = await Promise.all(
        winners.map(async (winner) => {
            let profilePictureUrl = winner.profile_picture_url;
            if (!profilePictureUrl) {
                profilePictureUrl = await fetchAndStoreProfilePicture(winner.steam_id);
            }

            let payoutData = winner.payout;
            if (Array.isArray(payoutData)) {
                // It's already an array
            } else if (payoutData && typeof payoutData === 'object') {
                // It's an object, wrap it in an array
                payoutData = [payoutData];
            } else {
                // Unexpected type, set to empty array
                payoutData = [];
            }

            return {
                player_name: winner.player_name || 'Unknown Player',
                timestamp: winner.timestamp?.toISOString() || new Date().toISOString(),
                payout: payoutData as { item: string; full_name: string; quantity: number }[],
                free_spins_won: winner.free_spins_won,
                profile_picture_url: profilePictureUrl,
                steam_id: winner.steam_id,
            };
        }),
    );

    return winnersWithPictures;
}

// Helper function to fetch and store profile picture (reuse from wheelActions.ts)
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
