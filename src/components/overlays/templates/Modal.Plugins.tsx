'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaSync } from 'react-icons/fa';
import { OverlayContainer } from '../core/Overlay.Container';
import { VersionComparisonResult } from '@/app/api/cron/check-plugins/Plugin.Versions';
import { PluginsTable } from '@/app/admin/status/plugins/Plugins.Table';
import { columns } from '@/app/admin/status/plugins/Plugins.Columns';

interface ModalPluginsProps {
    isOpen: boolean;
    onClose: () => void;
    plugins: VersionComparisonResult[];
    onRefresh?: () => void;
    isRefreshing?: boolean;
    lastUpdated?: Date;
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ModalPlugins({ isOpen, onClose, plugins, onRefresh, isRefreshing = false, lastUpdated, containerRef }: ModalPluginsProps) {
    return (
        <OverlayContainer
            isOpen={isOpen}
            onClose={onClose}
            title="Installed Plugins"
            subtitle={lastUpdated ? `Last Updated: ${lastUpdated.toLocaleString()}` : undefined}
            format="card"
            size="md"
            position="center"
            className="bg-stone-900/95"
            containerRef={containerRef}
            showCloseButton={true}
        >
            <div className="flex max-h-[80vh] flex-col space-y-4 overflow-hidden p-4">
                {/* Refresh Button */}
                {onRefresh && (
                    <motion.button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="group flex items-center justify-center space-x-2 rounded-lg bg-stone-800 p-2 text-stone-300 transition-colors hover:bg-stone-700"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FaSync className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : 'transition-transform group-hover:rotate-180'}`} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh Plugins'}</span>
                    </motion.button>
                )}

                {/* Plugin Table */}
                <PluginsTable data={plugins} columns={columns} />
            </div>
        </OverlayContainer>
    );
}
