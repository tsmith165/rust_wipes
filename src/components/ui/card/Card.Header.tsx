'use client';

import { SERVER_ICONS, STATUS_COLORS } from '@/app/admin/status/Status.Constants';
import { FaSync } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface CardHeaderProps {
    status: 'online' | 'offline' | 'restarting';
    serverName: string;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

export function CardHeader({ status, serverName, onRefresh, isRefreshing }: CardHeaderProps) {
    const StatusIcon = SERVER_ICONS[status];

    return (
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${STATUS_COLORS[status]}`} />
                <h3 className="text-lg font-semibold text-stone-200">{serverName}</h3>
            </div>
            {onRefresh && (
                <motion.button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className={`rounded-full p-1 text-stone-400 transition-colors hover:text-stone-200 ${
                        isRefreshing ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaSync className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </motion.button>
            )}
        </div>
    );
}
