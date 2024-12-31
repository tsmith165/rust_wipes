// Types
export type WheelColor = 'Yellow' | 'Green' | 'Purple' | 'Blue' | 'Red';
export type WheelPayout = 'P2 Pistol' | 'M92 Pistol' | 'Thompson' | 'AK47 Rifle' | '3x Bonus';

// Constants
export const LEGEND_ORDER: WheelColor[] = ['Yellow', 'Green', 'Blue', 'Purple', 'Red'];

export const WHEEL_SLOTS: WheelColor[] = [
    'Yellow',
    'Green',
    'Yellow',
    'Purple',
    'Yellow',
    'Green',
    'Yellow',
    'Blue',
    'Yellow',
    'Blue',
    'Green',
    'Yellow',
    'Purple',
    'Yellow',
    'Green',
    'Yellow',
    'Blue',
    'Yellow',
    'Green',
    'Yellow',
    'Red',
    'Yellow',
    'Green',
    'Yellow',
    'Blue',
];

export const COLOR_CODES: Record<WheelColor, string> = {
    Yellow: '#FFDC00',
    Green: '#2ECC40',
    Blue: '#0074D9',
    Purple: '#B10DC9',
    Red: '#FF4136',
};

export const PAYOUTS: Record<WheelColor, { displayName: WheelPayout; inGameName: string }> = {
    Yellow: { displayName: 'P2 Pistol', inGameName: 'pistol.semiauto' },
    Green: { displayName: 'M92 Pistol', inGameName: 'pistol.m92' },
    Blue: { displayName: 'Thompson', inGameName: 'smg.thompson' },
    Purple: { displayName: 'AK47 Rifle', inGameName: 'rifle.ak' },
    Red: { displayName: '3x Bonus', inGameName: 'bonus.3x' },
};

// Calculations
export const TOTAL_SLOTS = WHEEL_SLOTS.length;
export const DEGREES_PER_SLOT = 360 / TOTAL_SLOTS;

// Types for results and payouts
export interface Payout {
    displayName: string;
    inGameName: string;
}

export interface WheelResult {
    start: number;
    end: number;
    color: WheelColor;
    payout: Payout;
}

// Image paths for items
export const ITEM_IMAGE_PATHS: Record<WheelPayout, string> = {
    'P2 Pistol': '/rust_icons/p2_icon.png',
    'M92 Pistol': '/rust_icons/m92_icon.png',
    Thompson: '/rust_icons/thompson_icon.png',
    'AK47 Rifle': '/rust_icons/ak47_icon.png',
    '3x Bonus': '/rust_icons/3x_multi.png',
};

// Helper functions
export function calculateSlotBoundaries(): WheelResult[] {
    return WHEEL_SLOTS.map((color, index) => ({
        start: index * DEGREES_PER_SLOT,
        end: (index + 1) * DEGREES_PER_SLOT,
        color: color,
        payout: PAYOUTS[color],
    }));
}

export const SLOT_BOUNDARIES: WheelResult[] = calculateSlotBoundaries();

export function determineWinningSlot(finalDegree: number): WheelResult | undefined {
    const normalizedDegree = (360 - (finalDegree % 360)) % 360; // Reverse the direction
    return SLOT_BOUNDARIES.find((boundary) => normalizedDegree >= boundary.start && normalizedDegree < boundary.end);
}

export const SPIN_COST = 5;
