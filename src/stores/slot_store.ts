import { create } from 'zustand';

// Get initial window size safely
const getInitialWindowSize = () => {
    if (typeof window === 'undefined') {
        return { width: 1024, height: 768 }; // Default size for SSR
    }
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
};

interface SlotState {
    reels: string[][];
    spinAmounts: number[];
    spinKey: number;
    winningCells: number[][];
    bonusCells: number[][];
    winningLines: number[][][];
    currentWinningLine: number[][];
    currentWinningLineFlashCount: number;
    currentWinningLineIndex: number;
    lineType: 'horizontal' | 'diagonal' | 'zigzag_downwards' | 'zigzag_upwards' | null;
    lineFlashCount: number;
    showBonusTypeModal: boolean;
    selectedBonusType: 'normal' | 'sticky' | '';
    isBonusPending: boolean;
    stickyMultipliers: { x: number; y: number; multiplier: number }[];
    windowSize: { width: number; height: number };

    // Actions
    setReels: (reels: string[][]) => void;
    setSpinAmounts: (amounts: number[]) => void;
    incrementSpinKey: () => void;
    setWinningCells: (cells: number[][]) => void;
    setBonusCells: (cells: number[][]) => void;
    setWinningLines: (lines: number[][][]) => void;
    setCurrentWinningLine: (line: number[][]) => void;
    setCurrentWinningLineFlashCount: (count: number) => void;
    setCurrentWinningLineIndex: (index: number) => void;
    setLineType: (type: 'horizontal' | 'diagonal' | 'zigzag_downwards' | 'zigzag_upwards' | null) => void;
    setLineFlashCount: (count: number) => void;
    setShowBonusTypeModal: (show: boolean) => void;
    setSelectedBonusType: (type: 'normal' | 'sticky' | '') => void;
    setIsBonusPending: (pending: boolean) => void;
    setStickyMultipliers: (multipliers: { x: number; y: number; multiplier: number }[]) => void;
    setWindowSize: (size: { width: number; height: number }) => void;
    cycleLineType: () => void;
    cycleWinningLine: () => void;
}

export const useSlotStore = create<SlotState>((set) => ({
    reels: [],
    spinAmounts: [],
    spinKey: 0,
    winningCells: [],
    bonusCells: [],
    winningLines: [],
    currentWinningLine: [],
    currentWinningLineFlashCount: 0,
    currentWinningLineIndex: 0,
    lineType: null,
    lineFlashCount: 0,
    showBonusTypeModal: false,
    selectedBonusType: '',
    isBonusPending: false,
    stickyMultipliers: [],
    windowSize: getInitialWindowSize(),

    // Basic setters
    setReels: (reels) => set({ reels }),
    setSpinAmounts: (spinAmounts) => set({ spinAmounts }),
    incrementSpinKey: () => set((state) => ({ spinKey: state.spinKey + 1 })),
    setWinningCells: (winningCells) => set({ winningCells }),
    setBonusCells: (bonusCells) => set({ bonusCells }),
    setWinningLines: (winningLines) => set({ winningLines }),
    setCurrentWinningLine: (currentWinningLine) => set({ currentWinningLine }),
    setCurrentWinningLineFlashCount: (currentWinningLineFlashCount) => set({ currentWinningLineFlashCount }),
    setCurrentWinningLineIndex: (currentWinningLineIndex) => set({ currentWinningLineIndex }),
    setLineType: (lineType) => set({ lineType, lineFlashCount: 0 }),
    setLineFlashCount: (lineFlashCount) => set({ lineFlashCount }),
    setShowBonusTypeModal: (showBonusTypeModal) => set({ showBonusTypeModal }),
    setSelectedBonusType: (selectedBonusType) => set({ selectedBonusType }),
    setIsBonusPending: (isBonusPending) => set({ isBonusPending }),
    setStickyMultipliers: (stickyMultipliers) => set({ stickyMultipliers }),
    setWindowSize: (windowSize) => set({ windowSize }),

    // Complex actions
    cycleLineType: () =>
        set((state) => {
            if (state.lineFlashCount < 3) {
                return { lineFlashCount: state.lineFlashCount + 1 };
            }

            let nextLineType: 'horizontal' | 'diagonal' | 'zigzag_downwards' | 'zigzag_upwards' | null = null;
            if (state.lineType === 'horizontal') nextLineType = 'zigzag_downwards';
            else if (state.lineType === 'zigzag_downwards') nextLineType = 'zigzag_upwards';
            else if (state.lineType === 'zigzag_upwards') nextLineType = 'diagonal';

            return {
                lineType: nextLineType,
                lineFlashCount: 0,
            };
        }),

    cycleWinningLine: () =>
        set((state) => {
            if (state.currentWinningLineFlashCount < 3) {
                return { currentWinningLineFlashCount: state.currentWinningLineFlashCount + 1 };
            }

            const nextIndex = state.winningLines.length > 1 ? (state.currentWinningLineIndex + 1) % state.winningLines.length : 0;
            return {
                currentWinningLineFlashCount: 0,
                currentWinningLineIndex: nextIndex,
                currentWinningLine: state.winningLines[nextIndex] || [],
            };
        }),
}));
