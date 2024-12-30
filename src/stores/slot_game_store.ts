import { create } from 'zustand';
import type { SpinResult } from '@/app/gambling/slots/default/Default.Actions';
import { WINNING_PATTERNS } from '@/app/gambling/slots/default/Default.Constants';

interface SlotGameState {
    isSpinning: boolean;
    currentGrid: string[][];
    winningCells: number[][];
    bonusCells: number[][];
    winningLines: {
        lines: number[][][];
        isVisible: boolean;
        currentLineIndex: number;
        flashCount: number;
    };
    possibleLines: {
        lines: {
            horizontal: number[][][];
            vShaped: number[][][];
            invertedV: number[][][];
            diagonal: number[][][];
        };
        isVisible: boolean;
        currentGroup: 'horizontal' | 'vShaped' | 'invertedV' | 'diagonal';
        flashCount: number;
    };
    gridDimensions: {
        itemSize: { width: number; height: number };
        gap: number;
    };
    currentWinningLine: number[][];
    currentWinningLineFlashCount: number;
    spinKey: number;
    spinAmounts: number[];
    lastResult: SpinResult | null;
    showWinOverlay: boolean;
    showBonusModal: boolean;
    bonusSpinsRemaining: number;
    isMuted: boolean;
    volume: number;
    isAutoSpinning: boolean;

    // Actions
    setSpinning: (isSpinning: boolean) => void;
    setGrid: (grid: string[][]) => void;
    setWinningCells: (cells: number[][]) => void;
    setBonusCells: (cells: number[][]) => void;
    setWinningLines: (lines: number[][][]) => void;
    setWinningLinesVisibility: (isVisible: boolean) => void;
    setPossibleLines: (lines: { horizontal: number[][][]; vShaped: number[][][]; invertedV: number[][][]; diagonal: number[][][] }) => void;
    setPossibleLinesVisibility: (isVisible: boolean) => void;
    cyclePossibleLines: () => void;
    setGridDimensions: (dimensions: { width: number; height: number }, gap: number) => void;
    setCurrentWinningLine: (line: number[][]) => void;
    incrementWinningLineFlashCount: () => void;
    setSpinKey: (key: number) => void;
    setSpinAmounts: (amounts: number[]) => void;
    setLastResult: (result: SpinResult | null) => void;
    setShowWinOverlay: (show: boolean) => void;
    setShowBonusModal: (show: boolean) => void;
    setBonusSpinsRemaining: (spins: number) => void;
    setMuted: (isMuted: boolean) => void;
    setVolume: (volume: number) => void;
    setAutoSpinning: (isAutoSpinning: boolean) => void;
    cycleWinningLines: () => void;
}

export const useSlotGame = create<SlotGameState>((set) => ({
    isSpinning: false,
    currentGrid: [],
    winningCells: [],
    bonusCells: [],
    winningLines: {
        lines: [],
        isVisible: false,
        currentLineIndex: 0,
        flashCount: 0,
    },
    possibleLines: {
        lines: {
            horizontal: WINNING_PATTERNS.horizontal,
            vShaped: WINNING_PATTERNS.zigzag_downwards,
            invertedV: WINNING_PATTERNS.zigzag_upwards,
            diagonal: WINNING_PATTERNS.diagonal,
        },
        isVisible: false,
        currentGroup: 'horizontal',
        flashCount: 0,
    },
    gridDimensions: {
        itemSize: { width: 80, height: 80 }, // Default medium size
        gap: 2,
    },
    currentWinningLine: [],
    currentWinningLineFlashCount: 0,
    spinKey: 0,
    spinAmounts: [],
    lastResult: null,
    showWinOverlay: false,
    showBonusModal: false,
    bonusSpinsRemaining: 0,
    isMuted: false,
    volume: 1,
    isAutoSpinning: false,

    // Actions
    setSpinning: (isSpinning) => set({ isSpinning }),
    setGrid: (grid) => set({ currentGrid: grid }),
    setWinningCells: (cells) => set({ winningCells: cells }),
    setBonusCells: (cells) => set({ bonusCells: cells }),
    setWinningLines: (lines) =>
        set({
            winningLines: {
                lines,
                isVisible: true,
                currentLineIndex: 0,
                flashCount: 0,
            },
        }),
    setWinningLinesVisibility: (isVisible) =>
        set((state) => ({
            winningLines: {
                ...state.winningLines,
                isVisible,
                currentLineIndex: isVisible ? state.winningLines.currentLineIndex : 0,
                flashCount: isVisible ? state.winningLines.flashCount : 0,
            },
        })),
    setPossibleLines: (lines: { horizontal: number[][][]; vShaped: number[][][]; invertedV: number[][][]; diagonal: number[][][] }) =>
        set((state) => ({
            possibleLines: { ...state.possibleLines, lines },
        })),
    setPossibleLinesVisibility: (isVisible) =>
        set((state) => ({
            possibleLines: {
                ...state.possibleLines,
                isVisible,
                flashCount: 0,
                currentGroup: 'horizontal',
            },
            // Clear winning state when showing possible lines
            winningLines: isVisible ? { lines: [], isVisible: false, currentLineIndex: 0, flashCount: 0 } : state.winningLines,
            winningCells: isVisible ? [] : state.winningCells,
            bonusCells: isVisible ? [] : state.bonusCells,
        })),
    cyclePossibleLines: () =>
        set((state) => {
            const newFlashCount = state.possibleLines.flashCount + 1;

            // After 3 flashes, move to next group
            if (newFlashCount >= 6) {
                const groups: ('horizontal' | 'vShaped' | 'invertedV' | 'diagonal')[] = ['horizontal', 'vShaped', 'invertedV', 'diagonal'];
                const currentIndex = groups.indexOf(state.possibleLines.currentGroup);
                const nextGroup = groups[(currentIndex + 1) % groups.length];

                return {
                    ...state,
                    possibleLines: {
                        ...state.possibleLines,
                        currentGroup: nextGroup,
                        flashCount: 0,
                    },
                };
            }

            return {
                ...state,
                possibleLines: {
                    ...state.possibleLines,
                    flashCount: newFlashCount,
                },
            };
        }),
    setGridDimensions: (itemSize, gap) =>
        set({
            gridDimensions: { itemSize, gap },
        }),
    setCurrentWinningLine: (line) => set({ currentWinningLine: line }),
    incrementWinningLineFlashCount: () =>
        set((state) => ({
            currentWinningLineFlashCount: state.currentWinningLineFlashCount + 1,
        })),
    setSpinKey: (key) => set({ spinKey: key }),
    setSpinAmounts: (amounts) => set({ spinAmounts: amounts }),
    setLastResult: (result) => set({ lastResult: result }),
    setShowWinOverlay: (show) => set({ showWinOverlay: show }),
    setShowBonusModal: (show) => set({ showBonusModal: show }),
    setBonusSpinsRemaining: (spins) => set({ bonusSpinsRemaining: spins }),
    setMuted: (isMuted) => set({ isMuted }),
    setVolume: (volume) => set({ volume }),
    setAutoSpinning: (isAutoSpinning) => set({ isAutoSpinning }),
    cycleWinningLines: () =>
        set((state) => {
            if (!state.winningLines.isVisible || state.winningLines.lines.length === 0) {
                return state;
            }

            const newFlashCount = state.winningLines.flashCount + 1;

            // After 2 cycles (draw + pause + fade), move to next line
            if (newFlashCount >= 2) {
                const nextLineIndex = (state.winningLines.currentLineIndex + 1) % state.winningLines.lines.length;
                return {
                    ...state,
                    winningLines: {
                        ...state.winningLines,
                        currentLineIndex: nextLineIndex,
                        flashCount: 0,
                    },
                    winningCells: state.winningLines.lines[nextLineIndex],
                };
            }

            return {
                ...state,
                winningLines: {
                    ...state.winningLines,
                    flashCount: newFlashCount,
                },
                // Keep cells visible during the animation sequence
                winningCells: state.winningLines.lines[state.winningLines.currentLineIndex],
            };
        }),
}));
