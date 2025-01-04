'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { STATUS_BORDERS } from '@/app/admin/status/Status.Constants';

interface CardContainerProps {
    children: ReactNode;
    status: 'online' | 'offline' | 'restarting';
}

export function CardContainer({ children, status }: CardContainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`relative flex flex-col rounded-lg border-2 bg-stone-950 p-4 shadow-md ${STATUS_BORDERS[status]}`}
        >
            {children}
        </motion.div>
    );
}
