export type WheelColor = 'Yellow' | 'Green' | 'Purple' | 'Blue' | 'Red';
export type WheelPayout = 'P2 Pistol' | 'M92 Pistol' | 'Thompson' | 'M39 Rifle' | 'AK47 Rifle';

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
    Purple: { displayName: 'M39 Rifle', inGameName: 'rifle.m39' },
    Red: { displayName: 'AK47 Rifle', inGameName: 'rifle.ak' },
};

export const TOTAL_SLOTS = WHEEL_SLOTS.length;
export const DEGREES_PER_SLOT = 360 / TOTAL_SLOTS;

export function calculateSlotBoundaries() {
    return WHEEL_SLOTS.map((color, index) => ({
        start: index * DEGREES_PER_SLOT,
        end: (index + 1) * DEGREES_PER_SLOT,
        color: color,
        payout: PAYOUTS[color],
    }));
}

export const SLOT_BOUNDARIES = calculateSlotBoundaries();

export function determineWinningSlot(finalDegree: number) {
    const normalizedDegree = (360 - (finalDegree % 360)) % 360; // Reverse the direction
    return SLOT_BOUNDARIES.find((boundary) => normalizedDegree >= boundary.start && normalizedDegree < boundary.end);
}
