'use client';

import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useEffect } from 'react';

interface CardSuccessProps {
    message: string;
    onDismiss: () => void;
    autoDismissDelay?: number;
}

export function CardSuccess({ message, onDismiss, autoDismissDelay = 5000 }: CardSuccessProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, autoDismissDelay);

        return () => clearTimeout(timer);
    }, [onDismiss, autoDismissDelay]);

    if (!message) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex items-start justify-between rounded-lg bg-emerald-950/50 px-3 py-2 text-sm text-emerald-200"
        >
            <span className="flex-1 break-words pr-2">{message}</span>
            <button
                onClick={onDismiss}
                className="ml-2 shrink-0 rounded-full p-1 text-emerald-200 transition-colors hover:bg-emerald-900 hover:text-emerald-100"
            >
                <FaTimes className="h-4 w-4" />
            </button>
        </motion.div>
    );
}
