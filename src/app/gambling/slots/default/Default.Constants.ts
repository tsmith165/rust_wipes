export const SLOT_ITEMS = [
    'ak47',
    'm39_rifle',
    'thompson',
    'scrap',
    'metal_fragments',
    'high_quality_metal',
    'bonus',
    '2x_multiplier',
    '3x_multiplier',
    '5x_multiplier',
] as const;

export const BONUS_SYMBOL = 'bonus';

export const SYMBOL_PROBABILITIES: Record<string, number> = {
    ak47: 0.05,
    m39_rifle: 0.08,
    thompson: 0.12,
    scrap: 0.2,
    metal_fragments: 0.25,
    high_quality_metal: 0.15,
    bonus: 0.05,
    '2x_multiplier': 0.05,
    '3x_multiplier': 0.03,
    '5x_multiplier': 0.02,
};

export const PAYOUT_VALUES: Record<string, number> = {
    ak47: 500,
    m39_rifle: 300,
    thompson: 200,
    scrap: 100,
    metal_fragments: 50,
    high_quality_metal: 150,
};

export const MULTIPLIER_VALUES: Record<string, number> = {
    '2x_multiplier': 2,
    '3x_multiplier': 3,
    '5x_multiplier': 5,
};

export const WINNING_PATTERNS = [
    // Horizontal lines
    [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
    ],
    [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 1],
    ],
    [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
    ],
    [
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
        [4, 3],
    ],
    [
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
    ],

    // Diagonal lines
    [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
    ],
    [
        [0, 4],
        [1, 3],
        [2, 2],
        [3, 1],
        [4, 0],
    ],

    // V-shapes
    [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 1],
        [4, 0],
    ],
    [
        [0, 4],
        [1, 3],
        [2, 2],
        [3, 3],
        [4, 4],
    ],
];
