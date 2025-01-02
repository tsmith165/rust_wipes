import { create } from 'zustand';
import type { WheelResult } from '@/app/games/wheel/Wheel.Constants';

interface WheelState {
    // Wheel state
    isSpinning: boolean;
    setSpinning: (isSpinning: boolean) => void;
    spinKey: number;
    setSpinKey: (key: number) => void;

    // Auto-spin state
    isAutoSpinning: boolean;
    setAutoSpinning: (isAutoSpinning: boolean) => void;

    // Current rotation
    currentRotation: number;
    setCurrentRotation: (rotation: number) => void;

    // Result state
    result: WheelResult | null;
    setResult: (result: WheelResult | null) => void;

    // Sound state
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;

    // Overlay state
    showOverlay: boolean;
    setShowOverlay: (show: boolean) => void;

    // Bonus modal state
    showBonusModal: boolean;
    setShowBonusModal: (show: boolean) => void;
    pendingBonusType: 'normal' | 'sticky' | null;
    setPendingBonusType: (type: 'normal' | 'sticky' | null) => void;
}

export const useWheelStore = create<WheelState>((set) => ({
    // Wheel state
    isSpinning: false,
    setSpinning: (isSpinning) => set({ isSpinning }),
    spinKey: 0,
    setSpinKey: (key) => set({ spinKey: key }),

    // Auto-spin state
    isAutoSpinning: false,
    setAutoSpinning: (isAutoSpinning) => set({ isAutoSpinning }),

    // Current rotation
    currentRotation: 0,
    setCurrentRotation: (rotation) => set({ currentRotation: rotation }),

    // Result state
    result: null,
    setResult: (result) => set({ result }),

    // Sound state
    soundEnabled: true,
    setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
    volume: 0.1,
    setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

    // Overlay state
    showOverlay: false,
    setShowOverlay: (show) => set({ showOverlay: show }),

    // Bonus modal state
    showBonusModal: false,
    setShowBonusModal: (show) => set({ showBonusModal: show }),
    pendingBonusType: null,
    setPendingBonusType: (type) => set({ pendingBonusType: type }),
}));
