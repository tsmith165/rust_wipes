import { SLOT_ITEMS, BONUS_SYMBOL, SYMBOL_PROBABILITIES } from './slotMachineConstants';

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

export function getRandomSymbolExcludingBonus(): string {
    const symbolsExcludingBonus = SLOT_ITEMS.filter((item) => item !== BONUS_SYMBOL);
    const adjustedProbabilities: Record<string, number> = {};
    let totalProb = 0;

    // Calculate total probability excluding bonus
    for (const [symbol, probability] of Object.entries(SYMBOL_PROBABILITIES)) {
        if (symbol !== BONUS_SYMBOL) {
            adjustedProbabilities[symbol] = probability;
            totalProb += probability;
        }
    }

    // Normalize probabilities
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

export function getWrappedSlice(arr: string[], startIndex: number, count: number): string[] {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(arr[(startIndex + i) % arr.length]);
    }
    return result;
}
