import { createContext } from 'react';
import { RwServer, NextWipeInfo, MapOptions, MapVotes } from '@/db/schema';

export interface ServerContextType {
    servers: (RwServer & { nextWipeTime: Date })[];
    nextWipeInfoMap: Record<string, NextWipeInfo>;
    mapOptions: MapOptions[];
    mapVotes: MapVotes[];
}

export const ServerContext = createContext<ServerContextType | null>(null);
