'use client';

import { ReactNode } from 'react';
import { RwAlerts } from '@/db/schema';
import { ALERT_BACKGROUNDS, ALERT_BORDERS } from '@/app/admin/alerts/Alerts.Constants';
import { motion } from 'framer-motion';

interface AlertContainerProps {
    alert: RwAlerts;
    children: ReactNode;
    onArchive?: () => void;
    onRestore?: () => void;
}

export function AlertContainer({ alert, children, onArchive, onRestore }: AlertContainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 rounded-lg border-2 p-4 shadow-md ${ALERT_BACKGROUNDS[alert.severity]} ${ALERT_BORDERS[alert.severity]}`}
        >
            {children}
            <div className="mt-4 flex justify-end space-x-2">
                {alert.active && onArchive && (
                    <button onClick={onArchive} className="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600">
                        Archive
                    </button>
                )}
                {!alert.active && onRestore && (
                    <button onClick={onRestore} className="rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600">
                        Restore
                    </button>
                )}
            </div>
        </motion.div>
    );
}
