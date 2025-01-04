'use client';

import { ALERT_ICONS, ALERT_COLORS, ALERT_SEVERITY } from '@/app/admin/alerts/Alerts.Constants';

type AlertSeverity = (typeof ALERT_SEVERITY)[keyof typeof ALERT_SEVERITY];

interface AlertHeaderIconProps {
    severity: AlertSeverity;
}

export function AlertHeaderIcon({ severity }: AlertHeaderIconProps) {
    const Icon = ALERT_ICONS[severity];

    return (
        <div className={`mr-3 ${ALERT_COLORS[severity]}`}>
            <Icon className="h-6 w-6" />
        </div>
    );
}
