import { NextWipeInfo } from '@/db/schema';
import { SERVER_ALERT_IDS, ALERT_MESSAGES, ALERT_TYPE, AlertId } from '@/app/admin/alerts/Alerts.Constants';
import { differenceInHours, differenceInDays } from 'date-fns';

export interface AlertCheckResult {
    shouldAlert: boolean;
    alertId: AlertId;
    serverId: string;
    title: string;
    message: string;
}

export type AlertCheckFunction = (server: NextWipeInfo) => AlertCheckResult;

export const check_server_uptime: AlertCheckFunction = (server: NextWipeInfo) => {
    const lastRestart = server.last_restart;
    if (!lastRestart) {
        return {
            shouldAlert: true,
            alertId: SERVER_ALERT_IDS.MISSING_RESTART_DATA,
            serverId: server.server_id,
            title: `Missing Data - ${server.server_name || server.server_id}`,
            message: ALERT_MESSAGES[SERVER_ALERT_IDS.MISSING_RESTART_DATA],
        };
    }

    const hoursSinceRestart = differenceInHours(new Date(), lastRestart);
    const shouldAlert = hoursSinceRestart > 10;

    return {
        shouldAlert,
        alertId: SERVER_ALERT_IDS.UPTIME_WARNING,
        serverId: server.server_id,
        title: `Server Uptime Warning - ${server.server_name || server.server_id}`,
        message: `${ALERT_MESSAGES[SERVER_ALERT_IDS.UPTIME_WARNING]} (Current uptime: ${hoursSinceRestart} hours)`,
    };
};

export const check_last_wipe: AlertCheckFunction = (server: NextWipeInfo) => {
    const lastWipe = server.last_wipe;
    if (!lastWipe) {
        return {
            shouldAlert: true,
            alertId: SERVER_ALERT_IDS.MISSING_WIPE_DATA,
            serverId: server.server_id,
            title: `Missing Data - ${server.server_name || server.server_id}`,
            message: ALERT_MESSAGES[SERVER_ALERT_IDS.MISSING_WIPE_DATA],
        };
    }

    const daysSinceWipe = differenceInDays(new Date(), lastWipe);
    const shouldAlert = daysSinceWipe > 4;

    return {
        shouldAlert,
        alertId: SERVER_ALERT_IDS.WIPE_OVERDUE,
        serverId: server.server_id,
        title: `Wipe Overdue - ${server.server_name || server.server_id}`,
        message: `${ALERT_MESSAGES[SERVER_ALERT_IDS.WIPE_OVERDUE]} (Days since last wipe: ${daysSinceWipe})`,
    };
};

// Array of check functions to be executed by the runner
export const alertChecks: AlertCheckFunction[] = [check_server_uptime, check_last_wipe];
