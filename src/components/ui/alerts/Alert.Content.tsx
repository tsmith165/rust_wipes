'use client';

import { RwAlerts } from '@/db/schema';

interface AlertContentProps {
    alert: RwAlerts;
}

export function AlertContent({ alert }: AlertContentProps) {
    const archivedDate = alert.archived_at ? new Date(alert.archived_at) : null;

    return (
        <div className="mt-2">
            <p className="text-gray-700">{alert.message}</p>
            {archivedDate && alert.archived_by && (
                <p className="mt-2 text-sm text-gray-500">
                    Archived on {archivedDate.toLocaleDateString()} by {alert.archived_by}
                </p>
            )}
        </div>
    );
}
