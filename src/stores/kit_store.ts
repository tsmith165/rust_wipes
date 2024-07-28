import { create } from 'zustand';
import { ReactNode } from 'react';
import { Kits } from '@/db/schema';

interface KitsState {
    kits: Kits[];
    kitItems: ReactNode[];
    setKits: (items: Kits[]) => void;
    setKitItems: (items: ReactNode[] | ((prev: ReactNode[]) => ReactNode[])) => void;
}

const useKitsStore = create<KitsState>((set) => ({
    kits: [],
    kitItems: [],
    setKits: (kits) => set({ kits: kits }),
    setKitItems: (kits) =>
        set((state) => ({
            kitItems: typeof kits === 'function' ? kits(state.kitItems) : kits,
        })),
}));

export default useKitsStore;
