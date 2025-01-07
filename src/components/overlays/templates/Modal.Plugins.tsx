'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaSync, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { OverlayContainer } from '../core/Overlay.Container';
import { VersionComparisonResult } from '@/app/api/cron/check-plugins/Plugin.Versions';

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
                            <div className="flex items-center justify-between">
                                <div className="text-lg font-semibold text-primary_light">{plugin.name}</div>
                                {plugin.needsUpdate ? (
                                    <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                                ) : (
                                    <FaCheckCircle className="h-5 w-5 text-green-500" />
                                )}
                            </div>
                            <div className="text-sm text-stone-400">
                                <span className="font-medium text-stone-300">Current Version:</span>{' '}
                                <span className={plugin.needsUpdate ? 'text-red-400' : 'text-green-400'}>{plugin.currentVersion}</span>
                            </div>
                            <div className="text-sm text-stone-400">
                                <span className="font-medium text-stone-300">Expected Version:</span>{' '}
                                <span className="text-blue-400">{plugin.expectedVersion}</span>
                            </div>
                            <div className="text-sm text-stone-400">
                                <span className="font-medium text-stone-300">Highest Seen:</span>{' '}
                                <span className="text-purple-400">{plugin.highestSeenVersion}</span>
                            </div>
                            {plugin.author && (
                                <div className="text-sm text-stone-400">
                                    <span className="font-medium text-stone-300">Author:</span> {plugin.author}
                                </div>
                            )}
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
