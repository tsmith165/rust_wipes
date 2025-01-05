'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { STATUS_BORDERS } from '@/app/admin/status/Status.Constants';
import { NextWipeInfo } from '@/db/schema';

interface CardContainerProps {
    children: ReactNode;
    status: 'online' | 'offline' | 'restarting';
    server: NextWipeInfo;
    onRestart?: () => void;
    onRegularWipe?: () => void;
    onBpWipe?: () => void;
    isRestartLoading?: boolean;
    isRegularWipeLoading?: boolean;
    isBpWipeLoading?: boolean;
}

export function CardContainer({
    children,
    status,
    server,
    onRestart,
    onRegularWipe,
    onBpWipe,
    isRestartLoading,
    isRegularWipeLoading,
    isBpWipeLoading,
}: CardContainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`relative flex w-[350px] flex-col rounded-lg border-2 bg-stone-950 p-4 shadow-md ${STATUS_BORDERS[status]}`}
        >
            <div className="flex w-full flex-col">{children}</div>
        </motion.div>
    );
}
