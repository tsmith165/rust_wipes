import { FaBell, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { IconType } from 'react-icons';

export const ALERT_EMAIL_RECIPIENTS = ['torreysmith165@gmail.com'];

export const ALERT_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
} as const;

export const ALERT_TYPE = {
    SYSTEM: 'system',
    USER: 'user',
    MAINTENANCE: 'maintenance',
} as const;

export const ALERT_ICONS: Record<string, IconType> = {
    [ALERT_SEVERITY.LOW]: FaInfoCircle,
    [ALERT_SEVERITY.MEDIUM]: FaBell,
    [ALERT_SEVERITY.HIGH]: FaExclamationTriangle,
};

export const ALERT_COLORS = {
    [ALERT_SEVERITY.LOW]: 'text-blue-500',
    [ALERT_SEVERITY.MEDIUM]: 'text-yellow-500',
    [ALERT_SEVERITY.HIGH]: 'text-red-500',
} as const;

export const ALERT_BACKGROUNDS = {
    [ALERT_SEVERITY.LOW]: 'bg-blue-100',
    [ALERT_SEVERITY.MEDIUM]: 'bg-yellow-100',
    [ALERT_SEVERITY.HIGH]: 'bg-red-100',
} as const;

export const ALERT_BORDERS = {
    [ALERT_SEVERITY.LOW]: 'border-blue-500',
    [ALERT_SEVERITY.MEDIUM]: 'border-yellow-500',
    [ALERT_SEVERITY.HIGH]: 'border-red-500',
} as const;

export const ALERT_TABS = {
    CURRENT: 'current',
    HISTORY: 'history',
} as const;

// Alert IDs for server status checks
export const SERVER_ALERT_IDS = {
    UPTIME_WARNING: 'server_uptime_warning',
    WIPE_OVERDUE: 'server_wipe_overdue',
    MISSING_RESTART_DATA: 'server_missing_restart_data',
    MISSING_WIPE_DATA: 'server_missing_wipe_data',
    WIPE_PROCESS_FAILURE: 'wipe_process_failure',
    SERVER_START_FAILURE: 'server_start_failure',
} as const;

export type AlertId = (typeof SERVER_ALERT_IDS)[keyof typeof SERVER_ALERT_IDS];

// Alert messages mapped to alert IDs
export const ALERT_MESSAGES: Record<AlertId, string> = {
    [SERVER_ALERT_IDS.UPTIME_WARNING]: 'Server has been running for over 10 hours without restart',
    [SERVER_ALERT_IDS.WIPE_OVERDUE]: 'Server has not been wiped for over 4 days',
    [SERVER_ALERT_IDS.MISSING_RESTART_DATA]: 'Server is missing last restart time data',
    [SERVER_ALERT_IDS.MISSING_WIPE_DATA]: 'Server is missing last wipe time data',
    [SERVER_ALERT_IDS.WIPE_PROCESS_FAILURE]: 'Server wipe process failed',
    [SERVER_ALERT_IDS.SERVER_START_FAILURE]: 'Server failed to start after wipe process',
} as const;

// Time windows for duplicate prevention (in minutes)
export const ALERT_TIME_WINDOWS: Record<AlertId, number> = {
    [SERVER_ALERT_IDS.UPTIME_WARNING]: 60, // Check every hour
    [SERVER_ALERT_IDS.WIPE_OVERDUE]: 360, // Check every 6 hours
    [SERVER_ALERT_IDS.MISSING_RESTART_DATA]: 1440, // Check once per day
    [SERVER_ALERT_IDS.MISSING_WIPE_DATA]: 1440, // Check once per day
    [SERVER_ALERT_IDS.WIPE_PROCESS_FAILURE]: 60, // Check every hour
    [SERVER_ALERT_IDS.SERVER_START_FAILURE]: 60, // Check every hour
} as const;

// Severity levels for each alert type
export const ALERT_ID_SEVERITY: Record<AlertId, (typeof ALERT_SEVERITY)[keyof typeof ALERT_SEVERITY]> = {
    [SERVER_ALERT_IDS.UPTIME_WARNING]: ALERT_SEVERITY.MEDIUM,
    [SERVER_ALERT_IDS.WIPE_OVERDUE]: ALERT_SEVERITY.HIGH,
    [SERVER_ALERT_IDS.MISSING_RESTART_DATA]: ALERT_SEVERITY.HIGH,
    [SERVER_ALERT_IDS.MISSING_WIPE_DATA]: ALERT_SEVERITY.HIGH,
    [SERVER_ALERT_IDS.WIPE_PROCESS_FAILURE]: ALERT_SEVERITY.HIGH,
    [SERVER_ALERT_IDS.SERVER_START_FAILURE]: ALERT_SEVERITY.HIGH,
} as const;
