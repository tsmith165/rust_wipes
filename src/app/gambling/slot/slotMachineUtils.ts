import { SLOT_ITEMS, SYMBOL_PROBABILITIES } from './slotMachineConstants';

// Helper function to get a random symbol based on probabilities
export function getRandomSymbol(): string {
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
