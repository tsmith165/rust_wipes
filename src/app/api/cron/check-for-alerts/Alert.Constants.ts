import { AlertCheckFunction } from './Alert.Checks';

// Time thresholds for alerts (in hours)
export const ALERT_TIME_THRESHOLDS = {
    SERVER_UPTIME: 24, // Server should be restarted every 24 hours
    WIPE_AGE: 96, // Server should be wiped every 4 days (96 hours)
} as const;

// Alert check configuration
export interface AlertCheckConfig {
    id: string;
    title: (serverName: string) => string;
    message: string;
    timeWindow: number; // minutes before alert can be triggered again
    severity: 'low' | 'medium' | 'high';
}

// Alert check configurations
export const ALERT_CHECKS: Record<string, AlertCheckConfig> = {
    MISSING_RESTART_DATA: {
        id: 'MISSING_RESTART_DATA',
        title: (serverName) => `Missing Data - ${serverName}`,
        message: 'Server is missing last restart data. This could indicate a monitoring issue.',
        timeWindow: 360, // 6 hours
        severity: 'medium',
    },
    UPTIME_WARNING: {
        id: 'UPTIME_WARNING',
        title: (serverName) => `Server Uptime Warning - ${serverName}`,
        message: 'Server has been running for an extended period without a restart.',
        timeWindow: 180, // 3 hours
        severity: 'medium',
    },
    MISSING_WIPE_DATA: {
        id: 'MISSING_WIPE_DATA',
        title: (serverName) => `Missing Data - ${serverName}`,
        message: 'Server is missing last wipe data. This could indicate a monitoring issue.',
        timeWindow: 360, // 6 hours
        severity: 'medium',
    },
    WIPE_OVERDUE: {
        id: 'WIPE_OVERDUE',
        title: (serverName) => `Wipe Overdue - ${serverName}`,
        message: 'Server has not been wiped for an extended period.',
        timeWindow: 360, // 6 hours
        severity: 'high',
    },
} as const;

// Alert types
export const ALERT_TYPES = {
    SYSTEM: 'system',
    USER: 'user',
    MAINTENANCE: 'maintenance',
} as const;

// Helper function to get server display name
export function getServerDisplayName(serverName: string | null, serverId: string): string {
    return serverName || serverId;
}
