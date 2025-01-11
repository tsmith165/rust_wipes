import { NextWipeInfo } from '@/db/schema';
import { differenceInHours, differenceInDays } from 'date-fns';
import { ALERT_CHECKS, ALERT_TIME_THRESHOLDS, getServerDisplayName } from './Alert.Constants';

export interface AlertCheckResult {
    shouldAlert: boolean;
    alertId: string;
    serverId: string;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    timeWindow: number;
}

export type AlertCheckFunction = (server: NextWipeInfo) => AlertCheckResult;

export const check_server_uptime: AlertCheckFunction = (server: NextWipeInfo) => {
    const lastRestart = server.last_restart;
    const serverName = getServerDisplayName(server.server_name, server.server_id);

    if (!lastRestart) {
        const config = ALERT_CHECKS.MISSING_RESTART_DATA;
        return {
            shouldAlert: true,
            alertId: config.id,
            serverId: server.server_id,
            title: config.title(serverName),
            message: config.message,
            severity: config.severity,
            timeWindow: config.timeWindow,
        };
    }

    const hoursSinceRestart = differenceInHours(new Date(), lastRestart);
    const shouldAlert = hoursSinceRestart > ALERT_TIME_THRESHOLDS.SERVER_UPTIME;
    const config = ALERT_CHECKS.UPTIME_WARNING;

    return {
        shouldAlert,
        alertId: config.id,
        serverId: server.server_id,
        title: config.title(serverName),
        message: `${config.message} (Current uptime: ${hoursSinceRestart} hours)`,
        severity: config.severity,
        timeWindow: config.timeWindow,
    };
};

export const check_last_wipe: AlertCheckFunction = (server: NextWipeInfo) => {
    const lastWipe = server.last_wipe;
    const serverName = getServerDisplayName(server.server_name, server.server_id);

    if (!lastWipe) {
        const config = ALERT_CHECKS.MISSING_WIPE_DATA;
        return {
            shouldAlert: true,
            alertId: config.id,
            serverId: server.server_id,
            title: config.title(serverName),
            message: config.message,
            severity: config.severity,
            timeWindow: config.timeWindow,
        };
    }

    const hoursSinceWipe = differenceInHours(new Date(), lastWipe);
    const shouldAlert = hoursSinceWipe > ALERT_TIME_THRESHOLDS.WIPE_AGE;
    const config = ALERT_CHECKS.WIPE_OVERDUE;

    return {
        shouldAlert,
        alertId: config.id,
        serverId: server.server_id,
        title: config.title(serverName),
        message: `${config.message} (Hours since last wipe: ${hoursSinceWipe})`,
        severity: config.severity,
        timeWindow: config.timeWindow,
    };
};

// Array of check functions to be executed by the runner
export const alertChecks: AlertCheckFunction[] = [check_server_uptime, check_last_wipe];
