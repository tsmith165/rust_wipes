import { create } from 'zustand';
import { ServerStatusData } from '@/app/admin/status/Status.Actions';

interface ServerStatusStore {
    servers: ServerStatusData[];
    setServers: (servers: ServerStatusData[]) => void;
    updateServer: (serverId: string, data: Partial<ServerStatusData>) => void;
}

export const useServerStatusStore = create<ServerStatusStore>((set) => ({
    servers: [],
    setServers: (servers) => set({ servers }),
    updateServer: (serverId, data) =>
        set((state) => ({
            servers: state.servers.map((server) => (server.server_id === serverId ? { ...server, ...data } : server)),
        })),
}));
