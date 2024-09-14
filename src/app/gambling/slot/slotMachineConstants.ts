export const SLOT_ITEMS = ['scrap', 'metal_fragments', 'high_quality_metal', 'p2_pistol', 'm92_pistol', 'thompson', 'm39_rifle', 'ak47'];

export const BONUS_SYMBOL = 'bonus';

// Define probabilities for each symbol (must sum to 1)
export const SYMBOL_PROBABILITIES: Record<string, number> = {
    scrap: 0.25,
    metal_fragments: 0.19,
    high_quality_metal: 0.16,
    thompson: 0.15,
    m39_rifle: 0.12,
    ak47: 0.1,
    bonus: 0.03,
};

// Define base payouts
export const BASE_PAYOUTS: Record<string, { item: string; full_name: string; base_quantity: number }> = {
    scrap: { item: 'scrap', full_name: 'Scrap', base_quantity: 200 },
    metal_fragments: { item: 'metal_fragments', full_name: 'Metal Fragments', base_quantity: 1000 },
    high_quality_metal: { item: 'high_quality_metal', full_name: 'High Quality Metal', base_quantity: 100 },
    p2_pistol: { item: 'pistol.semiauto', full_name: 'P2 Pistol', base_quantity: 1 },
    m92_pistol: { item: 'pistol.m92', full_name: 'M92 Pistol', base_quantity: 1 },
    thompson: { item: 'smg.thompson', full_name: 'Thompson', base_quantity: 1 },
    m39_rifle: { item: 'rifle.m39', full_name: 'M39 Rifle', base_quantity: 1 },
    ak47: { item: 'rifle.ak', full_name: 'AK47 Rifle', base_quantity: 1 },
};

// Ensure the sum of probabilities is 1
const totalProbability = Object.values(SYMBOL_PROBABILITIES).reduce((sum, prob) => sum + prob, 0);
if (Math.abs(totalProbability - 1) > 0.001) {
    throw new Error('Symbol probabilities must sum to 1');
}

// prettier-ignore
export const WINNING_LINES = {
    horizontal: [
        [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
        [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
        [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
        [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3]],
        [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4]],
    ],
    diagonal: [
        [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4],],
        [[0, 4], [1, 3], [2, 2], [3, 1], [4, 0],],
    ],
    zigzag: [
        [[0, 0], [1, 1], [2, 0], [3, 1], [4, 0]],
        [[0, 1], [1, 0], [2, 1], [3, 0], [4, 1]],
        [[0, 1], [1, 2], [2, 1], [3, 2], [4, 1]],
        [[0, 2], [1, 1], [2, 2], [3, 1], [4, 2]],
        [[0, 2], [1, 3], [2, 2], [3, 3], [4, 2]],
        [[0, 3], [1, 2], [2, 3], [3, 2], [4, 3]],
        [[0, 3], [1, 4], [2, 3], [3, 4], [4, 3]],
        [[0, 4], [1, 3], [2, 4], [3, 3], [4, 4]],
    ],
};
