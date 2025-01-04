'use client';

import { ALERT_COLORS } from '@/app/admin/alerts/Alerts.Constants';
import { RwAlerts } from '@/db/schema';

interface AlertHeaderTitleProps {
    alert: RwAlerts;
}

export function AlertHeaderTitle({ alert }: AlertHeaderTitleProps) {
    const timestamp = alert.timestamp ? new Date(alert.timestamp) : new Date();

    return (
        <div className="flex flex-col">
            <h3 className={`text-lg font-semibold ${ALERT_COLORS[alert.severity]}`}>{alert.title}</h3>
            <span className="text-sm text-gray-500">
                {timestamp.toLocaleDateString()} - {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
            </span>
        </div>
    );
}
