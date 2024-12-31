import { SLOT_ITEMS, BONUS_SYMBOL, SYMBOL_PROBABILITIES } from '@/app/games/rusty-slots/RustySlots.Constants';

export type SlotItem = (typeof SLOT_ITEMS)[number];
type ProbabilityMap = Record<SlotItem, number>;

/**
 * Validates that probabilities sum to 1
 * @param probabilities Map of symbols to their probabilities
 * @returns true if valid, throws error if invalid
 */
function validateProbabilities(probabilities: ProbabilityMap): boolean {
    const sum = Object.values(probabilities).reduce((acc, val) => acc + val, 0);
    if (Math.abs(sum - 1) > 0.0001) {
        throw new Error(`Invalid probabilities: sum ${sum} is not equal to 1`);
    }
    return true;
}

/**
 * Gets a random symbol based on the defined probabilities
 * @returns A random slot item
 */
export function getRandomSymbol(): SlotItem {
    validateProbabilities(SYMBOL_PROBABILITIES as ProbabilityMap);

    const rand = Math.random();
    let cumulativeProbability = 0;

    for (const [symbol, probability] of Object.entries(SYMBOL_PROBABILITIES) as [SlotItem, number][]) {
        cumulativeProbability += probability;
        if (rand < cumulativeProbability) {
            return symbol;
        }
    }
    return SLOT_ITEMS[SLOT_ITEMS.length - 1];
}

/**
 * Gets a random symbol excluding the bonus symbol
 * @returns A random slot item (never the bonus symbol)
 */
export function getRandomSymbolExcludingBonus(): SlotItem {
    const symbolsExcludingBonus = SLOT_ITEMS.filter((item: SlotItem) => item !== BONUS_SYMBOL);
    const adjustedProbabilities: Partial<Record<SlotItem, number>> = {};
    let totalProb = 0;

    // Get the total probability of all symbols excluding the bonus symbol
    for (const [symbol, probability] of Object.entries(SYMBOL_PROBABILITIES) as [SlotItem, number][]) {
        if (symbol !== BONUS_SYMBOL) {
            adjustedProbabilities[symbol] = probability;
            totalProb += probability;
        }
    }

    // Normalize probabilities (sum to 1)
    // why do we need to normalize?
    // In case the probabilities don't sum to 1, we need to normalize them
    for (const symbol in adjustedProbabilities) {
        const prob = adjustedProbabilities[symbol as SlotItem];
        if (prob !== undefined) {
            adjustedProbabilities[symbol as SlotItem] = prob / totalProb;
        }
    }

    // Get a random symbol based on the adjusted probabilities
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const [symbol, probability] of Object.entries(adjustedProbabilities) as [SlotItem, number][]) {
        if (probability !== undefined) {
            cumulativeProbability += probability;
            if (rand < cumulativeProbability) {
                return symbol;
            }
        }
    }

    return symbolsExcludingBonus[symbolsExcludingBonus.length - 1];
}

/**
 * Gets a wrapped slice of an array
 * @param arr The array to slice
 * @param startIndex The starting index
 * @param count The number of elements to include
 * @returns A new array with the wrapped slice
 * @throws Error if inputs are invalid
 */
export function getWrappedSlice(arr: string[], startIndex: number, count: number): string[] {
    if (!Array.isArray(arr)) {
        throw new Error('Input must be an array');
    }
    if (arr.length === 0) {
        throw new Error('Array cannot be empty');
    }
    if (startIndex < 0 || count < 0) {
        throw new Error('Start index and count must be non-negative');
    }

    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(arr[(startIndex + i) % arr.length]);
    }
    return result;
}
