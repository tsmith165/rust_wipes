// File: /src/app/gambling/wheel/wheelConstants.ts

export type WheelColor = 'Yellow' | 'Green' | 'Purple' | 'Blue' | 'Red';
export type WheelPayout = 'P2 Pistol' | 'Tommy Gun' | 'M249' | 'AK47 Rifle' | 'Commander Kit';

export interface WheelSlot {
    color: WheelColor;
    payout: WheelPayout;
}

export const WHEEL_SLOTS: WheelSlot[] = [
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Green', payout: 'Tommy Gun' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Purple', payout: 'M249' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Green', payout: 'Tommy Gun' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Blue', payout: 'AK47 Rifle' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Blue', payout: 'AK47 Rifle' },
    { color: 'Green', payout: 'Tommy Gun' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Purple', payout: 'M249' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Green', payout: 'Tommy Gun' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Blue', payout: 'AK47 Rifle' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Green', payout: 'Tommy Gun' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Red', payout: 'Commander Kit' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Green', payout: 'Tommy Gun' },
    { color: 'Yellow', payout: 'P2 Pistol' },
    { color: 'Blue', payout: 'AK47 Rifle' },
];

export const COLOR_CODES: Record<WheelColor, string> = {
    Yellow: '#FFDC00',
    Green: '#2ECC40',
    Purple: '#B10DC9',
    Blue: '#0074D9',
    Red: '#FF4136',
};

export const TOTAL_SLOTS = WHEEL_SLOTS.length;
export const DEGREES_PER_SLOT = 360 / TOTAL_SLOTS;

export function calculateSlotBoundaries() {
    return WHEEL_SLOTS.map((slot, index) => ({
        start: index * DEGREES_PER_SLOT,
        end: (index + 1) * DEGREES_PER_SLOT,
        color: slot.color,
        payout: slot.payout,
    }));
}

export const SLOT_BOUNDARIES = calculateSlotBoundaries();

export function determineWinningSlot(finalDegree: number) {
    const normalizedDegree = (360 - (finalDegree % 360)) % 360; // Reverse the direction
    return SLOT_BOUNDARIES.find((boundary) => normalizedDegree >= boundary.start && normalizedDegree < boundary.end);
}
