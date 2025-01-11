'use client';

import React from 'react';
import { OverlayContainer } from '../core/Overlay.Container';
import { VersionComparisonResult } from '@/app/api/cron/check/plugins/Plugin.Versions';
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
                {/* Plugin Table */}
                <PluginsTable data={plugins} columns={columns} onRefresh={onRefresh ?? (() => {})} isRefreshing={isRefreshing} />
            </div>
        </OverlayContainer>
    );
}
