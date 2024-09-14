'use server';

import { db } from '@/db/db';
import { user_playtime, slot_machine_spins, bonus_spins } from '@/db/schema';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import { SLOT_ITEMS, BONUS_SYMBOL, BASE_PAYOUTS, SYMBOL_PROBABILITIES, WINNING_LINES } from './slotMachineConstants';

const REEL_SIZE = 20;
const VISIBLE_ITEMS = 5;
const MIN_SPIN = 80;
const MAX_SPIN = 120;

interface SpinResult {
    finalVisibleGrid: string[][];
    spinAmounts: number[];
    payout: { item: string; full_name: string; quantity: number }[];
    bonusTriggered: boolean;
    bonusSpinsAwarded: number; // Add this line
    credits: number;
    freeSpinsAvailable: number;
    winningCells: number[][]; // [x, y]
    bonusCells: number[][]; // [x, y]
    winningLines: number[][][]; // [[x, y]]
}

export async function spinSlotMachine(steamId: string, code: string): Promise<SpinResult> {
    if (!(await verifyAuthCode(steamId, code))) {
        throw new Error('Invalid auth code');
    }

    const user = await db.select().from(user_playtime).where(eq(user_playtime.steam_id, steamId)).limit(1);

    if (!user.length) {
        throw new Error('User not found');
    }

    const bonusSpinsData = await db.select().from(bonus_spins).where(eq(bonus_spins.user_id, user[0].id)).limit(1);

    let freeSpinsAvailable = bonusSpinsData.length > 0 ? bonusSpinsData[0].spins_remaining : 0;

    if (user[0].credits < 5 && freeSpinsAvailable === 0) {
        throw new Error('Not enough credits or free spins');
    }

    // Generate the entire grid
    const fullGrid = Array(5)
        .fill(0)
        .map(() => {
            const reelSymbols: string[] = [];
            let skipBonusUntilIndex = -1;
            let position = 0;

            while (reelSymbols.length < REEL_SIZE) {
                let symbol: string;

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

            return reelSymbols;
        });

    // Generate spin amounts for each reel
    const spinAmounts = Array(5)
        .fill(0)
        .map(() => Math.floor(Math.random() * (MAX_SPIN - MIN_SPIN + 1)) + MIN_SPIN);

    // Calculate the final visible grid
    const finalVisibleGrid = fullGrid.map((reel) => {
        const startIndex = Math.floor(Math.random() * REEL_SIZE);
        return getWrappedSlice(reel, startIndex, VISIBLE_ITEMS);
    });

    // Calculate winning cells and bonus cells
    const { payout, bonusCount, winningLines } = calculatePayout(finalVisibleGrid);

    const winningCells: number[][] = [];
    winningLines.forEach((line) => {
        line.forEach(([x, y]) => {
            if (!winningCells.some((cell) => cell[0] === x && cell[1] === y)) {
                winningCells.push([x, y]);
            }
        });
    });

    const bonusCells: number[][] = [];
    finalVisibleGrid.forEach((column, x) => {
        column.forEach((symbol, y) => {
            if (symbol === BONUS_SYMBOL) {
                bonusCells.push([x, y]);
            }
        });
    });

    // Update user credits and bonus spins
    let updatedCredits = user[0].credits;

    if (freeSpinsAvailable > 0) {
        freeSpinsAvailable--;
    } else {
        updatedCredits -= 5;
    }

    let spinsAwarded = 0;
    if (bonusCount >= 3) {
        if (bonusCount === 3) {
            spinsAwarded = 10;
        } else if (bonusCount === 4) {
            spinsAwarded = 15;
        } else if (bonusCount >= 5) {
            spinsAwarded = 20;
        }
        freeSpinsAvailable += spinsAwarded;
    }

    await db.update(user_playtime).set({ credits: updatedCredits }).where(eq(user_playtime.id, user[0].id));

    if (bonusSpinsData.length > 0) {
        await db
            .update(bonus_spins)
            .set({ spins_remaining: freeSpinsAvailable, last_updated: new Date() })
            .where(eq(bonus_spins.id, bonusSpinsData[0].id));
    } else if (freeSpinsAvailable > 0) {
        await db.insert(bonus_spins).values({
            user_id: user[0].id,
            spins_remaining: freeSpinsAvailable,
        });
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

    return {
        finalVisibleGrid,
        spinAmounts,
        payout,
        bonusTriggered: bonusCount >= 3,
        bonusSpinsAwarded: spinsAwarded,
        credits: updatedCredits,
        freeSpinsAvailable,
        winningCells,
        bonusCells,
        winningLines,
    };
}

// Helper function to get a wrapped slice of the reel
function getWrappedSlice(arr: string[], startIndex: number, count: number): string[] {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(arr[(startIndex + i) % arr.length]);
    }
    return result;
}

function calculatePayout(grid: string[][]): {
    payout: { item: string; full_name: string; quantity: number }[];
    bonusCount: number;
    winningLines: number[][][]; // [[x, y]]
} {
    let payout: { item: string; full_name: string; quantity: number }[] = [];
    const winningLines: number[][][] = [];

    const checkLine = (line: number[][]) => {
        const symbols = line.map(([x, y]) => grid[x][y]);

        let consecutiveCount = 1;
        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i] === symbols[i - 1]) {
                consecutiveCount++;
            } else {
                break;
            }
        }

        if (consecutiveCount >= 3) {
            const winningSymbols = symbols.slice(0, consecutiveCount);
            const symbol = winningSymbols[0];
            const item = getSymbolPayout(symbol, consecutiveCount);
            if (item) {
                payout.push(item);
                const winningPartOfLine = line.slice(0, consecutiveCount);
                winningLines.push(winningPartOfLine);
            }
        }
    };

    WINNING_LINES.horizontal.forEach(checkLine);
    WINNING_LINES.diagonal.forEach(checkLine);
    WINNING_LINES.zigzag_downwards.forEach(checkLine);
    WINNING_LINES.zigzag_upwards.forEach(checkLine);

    // Count the number of bonus symbols in the final grid
    let bonusCount = 0;
    grid.forEach((column, x) => {
        column.forEach((symbol, y) => {
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

// Helper functions to get random symbols based on probabilities
function getRandomSymbol(): string {
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const [symbol, probability] of Object.entries(SYMBOL_PROBABILITIES)) {
        cumulativeProbability += probability;
        if (rand < cumulativeProbability) {
            return symbol;
        }
    }
    // Fallback in case of rounding errors
    return SLOT_ITEMS[SLOT_ITEMS.length - 1];
}

function getRandomSymbolExcludingBonus(): string {
    const symbolsExcludingBonus = SLOT_ITEMS;
    const adjustedProbabilities = { ...SYMBOL_PROBABILITIES };
    delete adjustedProbabilities[BONUS_SYMBOL];

    // Normalize probabilities
    const totalProb = Object.values(adjustedProbabilities).reduce((sum, prob) => sum + prob, 0);
    for (const symbol in adjustedProbabilities) {
        adjustedProbabilities[symbol] = adjustedProbabilities[symbol] / totalProb;
    }

    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const [symbol, probability] of Object.entries(adjustedProbabilities)) {
        cumulativeProbability += probability;
        if (rand < cumulativeProbability) {
            return symbol;
        }
    }
    // Fallback
    return symbolsExcludingBonus[symbolsExcludingBonus.length - 1];
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
