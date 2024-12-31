import type { SpinResult } from '@/app/games/rusty-slots/default/Default.Actions';

export interface SlotGameState {
    // Game State
    isSpinning: boolean;
    currentGrid: string[][];
    winningCells: number[][];
    bonusCells: number[][];
    winningLines: number[][][];
    currentWinningLine: number[][];
    currentWinningLineFlashCount: number;
    spinKey: number;
    spinAmounts: number[];
    autoSpin: boolean;

    // UI State
    lastResult: SpinResult | null;
    showWinOverlay: boolean;
    showBonusModal: boolean;
    bonusSpinsRemaining: number;
    isMuted: boolean;

    // Actions
    setSpinning: (spinning: boolean) => void;
    setGrid: (grid: string[][]) => void;
    setWinningCells: (cells: number[][]) => void;
    setBonusCells: (cells: number[][]) => void;
    setWinningLines: (lines: number[][][]) => void;
    setCurrentWinningLine: (line: number[][]) => void;
    incrementWinningLineFlashCount: () => void;
    setSpinKey: (key: number | ((prev: number) => number)) => void;
    setSpinAmounts: (amounts: number[]) => void;
    setLastResult: (result: SpinResult | null) => void;
    setShowWinOverlay: (show: boolean) => void;
    setShowBonusModal: (show: boolean) => void;
    setBonusSpinsRemaining: (spins: number) => void;
    setMuted: (muted: boolean) => void;
    setAutoSpin: (auto: boolean) => void;
}

export interface SlotControlsProps {
    onSpin: () => Promise<void>;
    isDisabled: boolean;
    onToggleMute: () => void;
    isMuted: boolean;
    onToggleAutoSpin?: () => void;
    isAutoSpinning?: boolean;
    credits?: number;
    freeSpins?: number;
    isLoading?: boolean;
    steamProfile?: {
        name: string;
        avatarUrl: string;
        steamId: string;
    };
}

export interface SlotGridProps {
    grid: string[][];
    spinAmounts: number[];
    spinKey: number;
    isSpinning: boolean;
    winningCells: number[][];
    bonusCells: number[][];
    winningLines: number[][][];
    currentWinningLine: number[][];
    currentWinningLineFlashCount: number;
    onSpinComplete?: () => void;
}
