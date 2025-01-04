import { FaServer, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { IconType } from 'react-icons';

export const SERVER_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    RESTARTING: 'restarting',
} as const;

export const SERVER_ICONS: Record<string, IconType> = {
    [SERVER_STATUS.ONLINE]: FaCheckCircle,
    [SERVER_STATUS.OFFLINE]: FaExclamationTriangle,
    [SERVER_STATUS.RESTARTING]: FaServer,
};

export const STATUS_COLORS = {
    [SERVER_STATUS.ONLINE]: 'text-green-500',
    [SERVER_STATUS.OFFLINE]: 'text-red-500',
    [SERVER_STATUS.RESTARTING]: 'text-yellow-500',
} as const;

export const STATUS_BACKGROUNDS = {
    [SERVER_STATUS.ONLINE]: 'bg-green-100',
    [SERVER_STATUS.OFFLINE]: 'bg-red-100',
    [SERVER_STATUS.RESTARTING]: 'bg-yellow-100',
} as const;

export const STATUS_BORDERS = {
    [SERVER_STATUS.ONLINE]: 'border-green-500',
    [SERVER_STATUS.OFFLINE]: 'border-red-500',
    [SERVER_STATUS.RESTARTING]: 'border-yellow-500',
} as const;

export const REFRESH_INTERVAL = 60000; // 60 seconds in milliseconds

interface ServerGroup {
    group: string;
    servers: number[];
}

export const SERVER_GROUPS: ServerGroup[] = [
    { group: 'Normal', servers: [25565, 25571, 25566] },
    { group: 'Offset', servers: [25568, 25572, 25569] },
    { group: 'Extra', servers: [25567, 25570] },
] as const;
