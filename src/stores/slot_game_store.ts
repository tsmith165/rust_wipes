import { create } from 'zustand';
import type { SpinResult } from '@/app/gambling/slots/default/Default.Actions';

interface SlotGameState {
    isSpinning: boolean;
    currentGrid: string[][];
    winningCells: number[][];
    bonusCells: number[][];
    winningLines: {
        lines: number[][][];
        isVisible: boolean;
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
}

export const useSlotGame = create<SlotGameState>((set) => ({
    isSpinning: false,
    currentGrid: [],
    winningCells: [],
    bonusCells: [],
    winningLines: {
        lines: [],
        isVisible: false,
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
        set((state) => ({
            winningLines: { ...state.winningLines, lines },
        })),
    setWinningLinesVisibility: (isVisible) =>
        set((state) => ({
            winningLines: { ...state.winningLines, isVisible },
        })),
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
}));
