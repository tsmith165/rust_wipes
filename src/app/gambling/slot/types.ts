export interface SlotResult {
    finalVisibleGrid: string[][];
    spinAmounts: number[];
    winningCells: number[][];
    bonusCells: number[][];
    winningLines: number[][][];
    bonusSpinsAwarded: number;
    needsBonusTypeSelection?: boolean;
    payout: { quantity: number; full_name: string }[];
    bonusTriggered: boolean;
    freeSpinsAvailable: number;
}

export interface SlotControlsProps {
    onSpin: () => void;
    onShowLines: () => void;
}

export interface SlotGameProps {
    reels: string[][];
    spinAmounts: number[];
    spinKey: number;
    winningCells: number[][];
    bonusCells: number[][];
    winningLines: number[][][];
    currentWinningLine: number[][];
    currentWinningLineFlashCount: number;
    ITEM_HEIGHT: number;
    ITEM_WIDTH: number;
    GAP: number;
    VISIBLE_ITEMS: number;
    lineType: 'horizontal' | 'diagonal' | 'zigzag_downwards' | 'zigzag_upwards' | null;
    lineFlashCount: number;
}

export interface SlotContainerProps {
    initialSymbols: string[][];
}

export interface SlotControlsButtonsProps {
    onSpin: () => void;
    onShowLines: () => void;
}

export interface SlotRecentWinnersProps {
    spinning: boolean;
}

export interface Winner {
    steamId: string;
    steamName: string;
    steamAvatar: string;
    winAmount: number;
    timestamp: string;
}
