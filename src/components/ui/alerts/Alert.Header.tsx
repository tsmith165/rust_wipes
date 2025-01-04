'use client';

import { RwAlerts } from '@/db/schema';
import { AlertHeaderIcon } from './Alert.Header.Icon';
import { AlertHeaderTitle } from './Alert.Header.Title';

interface AlertHeaderProps {
    alert: RwAlerts;
}

export function AlertHeader({ alert }: AlertHeaderProps) {
    return (
        <div className="flex items-center">
            <AlertHeaderIcon severity={alert.severity} />
            <AlertHeaderTitle alert={alert} />
        </div>
    );
}
