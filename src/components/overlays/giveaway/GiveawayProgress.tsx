'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GiveawayProgressProps {
    current: number;
    total: number;
    loading?: boolean;
}

export const GiveawayProgress: React.FC<GiveawayProgressProps> = ({ current, total, loading = false }) => {
    const percentage = Math.min((current / total) * 100, 100);

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
                <span className="text-stone-300">Progress</span>
                <span className="font-medium text-primary_light">{loading ? '...' : `${current}/${total} Players`}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-800/50">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary via-primary_light to-primary"
                    initial={{ width: '0%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>
            <p className="text-xs text-stone-400">{loading ? 'Loading...' : `${total - current} spots remaining for the kit giveaway!`}</p>
        </div>
    );
};
