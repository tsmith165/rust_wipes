import { create } from 'zustand';
import { ServerStatusData } from '@/app/admin/status/Status.Actions';

type CommandType = 'restart' | 'regularWipe' | 'bpWipe';

interface ServerStatusStore {
    servers: ServerStatusData[];
    setServers: (servers: ServerStatusData[]) => void;
    updateServer: (serverId: string, data: Partial<ServerStatusData>) => void;
    serverErrors: Record<string, string | null>;
    setServerError: (serverId: string, error: string | null) => void;
    clearServerError: (serverId: string) => void;
    serverSuccesses: Record<string, string | null>;
    setServerSuccess: (serverId: string, message: string | null) => void;
    clearServerSuccess: (serverId: string) => void;
    loadingCommands: Record<string, Record<CommandType, boolean>>;
    setCommandLoading: (serverId: string, command: CommandType, isLoading: boolean) => void;
}

export const useServerStatusStore = create<ServerStatusStore>((set) => ({
    servers: [],
    setServers: (servers) => set({ servers }),
    updateServer: (serverId, data) =>
        set((state) => ({
            servers: state.servers.map((server) => (server.server_id === serverId ? { ...server, ...data } : server)),
        })),
    serverErrors: {},
    setServerError: (serverId, error) =>
        set((state) => ({
            serverErrors: {
                ...state.serverErrors,
                [serverId]: error,
            },
        })),
    clearServerError: (serverId) =>
        set((state) => ({
            serverErrors: {
                ...state.serverErrors,
                [serverId]: null,
            },
        })),
    serverSuccesses: {},
    setServerSuccess: (serverId, message) =>
        set((state) => ({
            serverSuccesses: {
                ...state.serverSuccesses,
                [serverId]: message,
            },
        })),
    clearServerSuccess: (serverId) =>
        set((state) => ({
            serverSuccesses: {
                ...state.serverSuccesses,
                [serverId]: null,
            },
        })),
    loadingCommands: {},
    setCommandLoading: (serverId, command, isLoading) =>
        set((state) => ({
            loadingCommands: {
                ...state.loadingCommands,
                [serverId]: {
                    ...state.loadingCommands[serverId],
                    [command]: isLoading,
                },
            },
        })),
}));
