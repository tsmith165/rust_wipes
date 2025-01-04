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
