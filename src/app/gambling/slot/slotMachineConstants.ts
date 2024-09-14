export const SLOT_ITEMS = ['scrap', 'metal_fragments', 'high_quality_metal', 'p2_pistol', 'm92_pistol', 'thompson', 'm39_rifle', 'ak47'];

export const BONUS_SYMBOL = 'bonus';

// Define probabilities for each symbol (must sum to 1)
export const SYMBOL_PROBABILITIES: Record<string, number> = {
    scrap: 0.25,
    metal_fragments: 0.2,
    high_quality_metal: 0.15,
    p2_pistol: 0.1,
    m92_pistol: 0.08,
    thompson: 0.09,
    m39_rifle: 0.06,
    ak47: 0.04,
    bonus: 0.03,
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
