'use client';

import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

interface CardErrorProps {
    error: string;
    onDismiss: () => void;
}

export function CardError({ error, onDismiss }: CardErrorProps) {
    if (!error) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex items-start justify-between rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-200"
        >
            <span className="flex-1 break-words pr-2">{error}</span>
            <button
                onClick={onDismiss}
                className="ml-2 shrink-0 rounded-full p-1 text-red-200 transition-colors hover:bg-red-900 hover:text-red-100"
            >
                <FaTimes className="h-4 w-4" />
            </button>
        </motion.div>
    );
}
