'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaSync } from 'react-icons/fa';
import { OverlayContainer } from '../core/Overlay.Container';
import { PluginInfo } from '@/app/api/cron/check-plugins/Plugin.Types';

interface ModalPluginsProps {
    isOpen: boolean;
    onClose: () => void;
    plugins: PluginInfo[];
    onRefresh?: () => void;
    isRefreshing?: boolean;
    lastUpdated?: Date;
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ModalPlugins({ isOpen, onClose, plugins, onRefresh, isRefreshing = false, lastUpdated, containerRef }: ModalPluginsProps) {
    // Sort plugins by name
    const sortedPlugins = [...plugins].sort((a, b) => a.name.localeCompare(b.name));

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
            <div className="flex max-h-[60vh] flex-col space-y-4 overflow-y-auto p-4">
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

                {/* Plugin List */}
                <div className="flex flex-col space-y-2">
                    {sortedPlugins.map((plugin, index) => (
                        <motion.div
                            key={plugin.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex flex-col space-y-1 rounded-lg bg-stone-800 p-3"
                        >
                            <div className="text-lg font-semibold text-primary_light">{plugin.name}</div>
                            <div className="text-sm text-stone-400">
                                <span className="font-medium text-stone-300">Version:</span> {plugin.version}
                            </div>
                            <div className="text-sm text-stone-400">
                                <span className="font-medium text-stone-300">Author:</span> {plugin.author}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {plugins.length === 0 && (
                    <div className="text-center text-stone-400">{isRefreshing ? 'Loading plugins...' : 'No plugins found'}</div>
                )}
            </div>
        </OverlayContainer>
    );
}
