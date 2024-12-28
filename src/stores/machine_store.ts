import { create } from 'zustand';
import type { SlotResult } from '@/app/gambling/slot/types';

interface MachineState {
    spinning: boolean;
    autoSpin: boolean;
    isMuted: boolean;
    showOverlay: boolean;
    showConfetti: boolean;
    error: string;
    windowSize: { width: number; height: number };
    credits: number | null;
    freeSpins: number;
    result: SlotResult | null;
    setSpinning: (spinning: boolean) => void;
    setAutoSpin: (autoSpin: boolean) => void;
    setIsMuted: (isMuted: boolean) => void;
    setShowOverlay: (showOverlay: boolean) => void;
    setShowConfetti: (showConfetti: boolean) => void;
    setError: (error: string) => void;
    setWindowSize: (size: { width: number; height: number }) => void;
    setCredits: (credits: number | null) => void;
    setFreeSpins: (freeSpins: number) => void;
    setResult: (result: SlotResult | null) => void;
}

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

export const useMachineStore = create<MachineState>((set) => ({
    spinning: false,
    autoSpin: false,
    isMuted: false,
    showOverlay: false,
    showConfetti: false,
    error: '',
    windowSize: getInitialWindowSize(),
    credits: null,
    freeSpins: 0,
    result: null,
    setSpinning: (spinning) => set({ spinning }),
    setAutoSpin: (autoSpin) => set({ autoSpin }),
    setIsMuted: (isMuted) => set({ isMuted }),
    setShowOverlay: (showOverlay) => set({ showOverlay }),
    setShowConfetti: (showConfetti) => set({ showConfetti }),
    setError: (error) => set({ error }),
    setWindowSize: (windowSize) => set({ windowSize }),
    setCredits: (credits) => set({ credits }),
    setFreeSpins: (freeSpins) => set({ freeSpins }),
    setResult: (result) => set({ result }),
}));
