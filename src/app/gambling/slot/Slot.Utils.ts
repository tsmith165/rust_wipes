import { SLOT_ITEMS, BONUS_SYMBOL, SYMBOL_PROBABILITIES } from './Slot.Constants';

type SlotItem = (typeof SLOT_ITEMS)[number];

export function getRandomSymbol(): SlotItem {
    const rand = Math.random();
    let cumulativeProbability = 0;

    for (const [symbol, probability] of Object.entries(SYMBOL_PROBABILITIES)) {
        cumulativeProbability += probability;
        if (rand < cumulativeProbability) {
            return symbol as SlotItem;
        }
    }

    return SLOT_ITEMS[SLOT_ITEMS.length - 1];
}

export function getRandomSymbolExcludingBonus(): SlotItem {
    const symbolsExcludingBonus = SLOT_ITEMS.filter((item: SlotItem) => item !== BONUS_SYMBOL);
    const adjustedProbabilities: Partial<Record<SlotItem, number>> = {};
    let totalProb = 0;

    for (const [symbol, probability] of Object.entries(SYMBOL_PROBABILITIES)) {
        if (symbol !== BONUS_SYMBOL) {
            adjustedProbabilities[symbol as SlotItem] = probability;
            totalProb += probability;
        }
    }

    for (const symbol in adjustedProbabilities) {
        if (adjustedProbabilities[symbol as SlotItem] !== undefined) {
            adjustedProbabilities[symbol as SlotItem]! /= totalProb;
        }
    }

    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const [symbol, probability] of Object.entries(adjustedProbabilities)) {
        if (probability !== undefined) {
            cumulativeProbability += probability;
            if (rand < cumulativeProbability) {
                return symbol as SlotItem;
            }
        }
    }

    return symbolsExcludingBonus[symbolsExcludingBonus.length - 1];
}

export function getWrappedSlice(arr: string[], startIndex: number, count: number): string[] {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(arr[(startIndex + i) % arr.length]);
    }
    return result;
}
