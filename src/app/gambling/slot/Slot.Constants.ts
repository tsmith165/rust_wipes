// Window size thresholds
export const WINDOW_SIZE_SMALL_THRESHOLD = 400;
export const WINDOW_SIZE_MEDIUM_THRESHOLD = 600;
export const WINDOW_SIZE_LARGE_THRESHOLD = 800;
export const WINDOW_SIZE_EXTRA_LARGE_THRESHOLD = 1300;

// Item sizes for different window sizes
export const ITEM_SIZE_EXTRA_LARGE = 100;
export const ITEM_SIZE_LARGE = 80;
export const ITEM_SIZE_MEDIUM = 60;
export const ITEM_SIZE_SMALL = 50;
export const ITEM_SIZE_EXTRA_SMALL = 40;

// Define available slot items
export const SLOT_ITEMS = [
    'scrap',
    'metal_fragments',
    'high_quality_metal',
    'thompson',
    'm39_rifle',
    'ak47',
    '2x_multiplier',
    '3x_multiplier',
    '5x_multiplier',
    'bonus',
] as const;

// Define probabilities for each symbol (must sum to 1)
export const SYMBOL_PROBABILITIES: Record<string, number> = {
    scrap: 0.25,
    metal_fragments: 0.19,
    high_quality_metal: 0.16,
    thompson: 0.15,
    m39_rifle: 0.12,
    ak47: 0.075,
    bonus: 0.04,
    '2x_multiplier': 0.007,
    '3x_multiplier': 0.005,
    '5x_multiplier': 0.003,
};

export const DB_IMAGE_PATHS = {
    ak47: '/rust_icons/ak47_icon.png',
    m39_rifle: '/rust_icons/m39_icon.png',
    thompson: '/rust_icons/thompson_icon.png',
    scrap: '/rust_icons/scrap_icon.png',
    metal_fragments: '/rust_icons/metal_fragments_icon.png',
    high_quality_metal: '/rust_icons/hqm_icon.png',
    bonus: '/rust_icons/bonus_symbol.png',
    '2x_multiplier': '/rust_icons/2x_multi.png',
    '3x_multiplier': '/rust_icons/3x_multi.png',
    '5x_multiplier': '/rust_icons/5x_multi.png',
};

// Map symbols to image paths
export const SYMBOL_IMAGE_PATHS: Record<string, string> = {
    ak47: '/rust_icons/ak47_icon.png',
    m39_rifle: '/rust_icons/m39_icon.png',
    thompson: '/rust_icons/thompson_icon.png',
    scrap: '/rust_icons/scrap_icon.png',
    metal_fragments: '/rust_icons/metal_fragments_icon.png',
    high_quality_metal: '/rust_icons/hqm_icon.png',
    bonus: '/rust_icons/bonus_symbol.png',
    '2x_multiplier': '/rust_icons/2x_multi.png',
    '3x_multiplier': '/rust_icons/3x_multi.png',
    '5x_multiplier': '/rust_icons/5x_multi.png',
};

// Base payouts for each symbol
export const BASE_PAYOUTS: Record<string, { item: string; full_name: string; base_quantity: number }> = {
    ak47: { item: 'ak47', full_name: 'AK-47', base_quantity: 1 },
    m39_rifle: { item: 'm39_rifle', full_name: 'M39 Rifle', base_quantity: 1 },
    thompson: { item: 'thompson', full_name: 'Thompson', base_quantity: 1 },
    scrap: { item: 'scrap', full_name: 'Scrap', base_quantity: 100 },
    metal_fragments: { item: 'metal_fragments', full_name: 'Metal Fragments', base_quantity: 1000 },
    high_quality_metal: { item: 'high_quality_metal', full_name: 'High Quality Metal', base_quantity: 10 },
};

// Bonus symbol
export const BONUS_SYMBOL = 'bonus';

// Initial bonus spins awarded
export const INITIAL_BONUS_SPINS = {
    normal: {
        3: 10,
        4: 15,
        5: 20,
    },
    sticky: {
        3: 8,
        4: 12,
        5: 15,
    },
} as const;

// Retrigger bonus spins awarded
export const RETRIGGER_BONUS_SPINS = {
    normal: {
        2: 5,
        3: 10,
        4: 15,
        5: 20,
    },
    sticky: {
        2: 3,
        3: 5,
        4: 8,
        5: 10,
    },
} as const;

// Winning line patterns
export const WINNING_LINES = {
    horizontal: [
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
    ],
    diagonal: [
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
    ],
    zigzag_downwards: [
        [
            [0, 0],
            [1, 1],
            [2, 0],
            [3, 1],
            [4, 0],
        ],
        [
            [0, 1],
            [1, 2],
            [2, 1],
            [3, 2],
            [4, 1],
        ],
        [
            [0, 2],
            [1, 3],
            [2, 2],
            [3, 3],
            [4, 2],
        ],
        [
            [0, 3],
            [1, 4],
            [2, 3],
            [3, 4],
            [4, 3],
        ],
    ],
    zigzag_upwards: [
        [
            [0, 4],
            [1, 3],
            [2, 4],
            [3, 3],
            [4, 4],
        ],
        [
            [0, 3],
            [1, 2],
            [2, 3],
            [3, 2],
            [4, 3],
        ],
        [
            [0, 2],
            [1, 1],
            [2, 2],
            [3, 1],
            [4, 2],
        ],
        [
            [0, 1],
            [1, 0],
            [2, 1],
            [3, 0],
            [4, 1],
        ],
    ],
};

// Items that don't use multipliers
export const SLOT_ITEMS_NO_MULTIPLIERS = ['ak47', 'm39_rifle', 'thompson'];
