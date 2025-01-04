'use client';

import { ReactNode } from 'react';
import { RwAlerts } from '@/db/schema';
import { ALERT_BACKGROUNDS, ALERT_BORDERS } from '@/app/admin/alerts/Alerts.Constants';
import { motion } from 'framer-motion';
import { AlertControls } from './Alert.Controls';

interface AlertContainerProps {
    alert: RwAlerts;
    children: ReactNode;
    onArchive?: () => void;
    onRestore?: () => void;
    onResendEmail?: () => void;
}

export function AlertContainer({ alert, children, onArchive, onRestore, onResendEmail }: AlertContainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 w-full rounded-lg border-2 p-4 shadow-md ${ALERT_BACKGROUNDS[alert.severity]} ${ALERT_BORDERS[alert.severity]}`}
        >
            {children}
            <AlertControls alert={alert} onArchive={onArchive} onRestore={onRestore} onResendEmail={onResendEmail} />
        </motion.div>
    );
}
