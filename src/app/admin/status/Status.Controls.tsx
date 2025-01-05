'use client';

import { NextWipeInfo } from '@/db/schema';
import { CardControls } from '@/components/ui/card/Card.Controls';
import { CardControlButton } from '@/components/ui/card/Card.Controls.Button';
import { FaSync, FaEraser, FaBroom, FaServer, FaChartLine } from 'react-icons/fa';

interface StatusControlsProps {
    server: NextWipeInfo;
    onRestart?: () => void;
    onRegularWipe?: () => void;
    onBpWipe?: () => void;
    isRestartLoading?: boolean;
    isRegularWipeLoading?: boolean;
    isBpWipeLoading?: boolean;
}

export function StatusControls({
    server,
    onRestart,
    onRegularWipe,
    onBpWipe,
    isRestartLoading = false,
    isRegularWipeLoading = false,
    isBpWipeLoading = false,
}: StatusControlsProps) {
    const hasRconAccess = server.rcon_ip && server.rcon_port && server.rcon_password;
    const pterodactylUrl = server.server_uuid ? `https://panel.rustwipes.net/server/${server.server_uuid.split('-')[0]}` : undefined;
    const battlemetricsUrl = server.bm_id ? `https://www.battlemetrics.com/servers/rust/${server.bm_id}` : undefined;

    return (
        <CardControls>
            {/* External Links */}
            {pterodactylUrl && (
                <CardControlButton
                    id={`panel-${server.server_id}`}
                    icon={FaServer}
                    tooltip="Open Pterodactyl Panel"
                    href={pterodactylUrl}
                    isExternal={true}
                    variant="default"
                />
            )}
            {battlemetricsUrl && (
                <CardControlButton
                    id={`bm-${server.server_id}`}
                    icon={FaChartLine}
                    tooltip="View on BattleMetrics"
                    href={battlemetricsUrl}
                    isExternal={true}
                    variant="default"
                />
            )}

            {/* Server Controls */}
            {onRestart && (
                <CardControlButton
                    id={`restart-${server.server_id}`}
                    icon={FaSync}
                    tooltip="Restart Server"
                    onClick={onRestart}
                    variant="warning"
                    disabled={!hasRconAccess}
                    loading={isRestartLoading}
                />
            )}
            {onRegularWipe && (
                <CardControlButton
                    id={`wipe-${server.server_id}`}
                    icon={FaEraser}
                    tooltip="Regular Wipe"
                    onClick={onRegularWipe}
                    variant="error"
                    disabled={!hasRconAccess}
                    loading={isRegularWipeLoading}
                />
            )}
            {onBpWipe && (
                <CardControlButton
                    id={`bp-wipe-${server.server_id}`}
                    icon={FaBroom}
                    tooltip="BP Wipe"
                    onClick={onBpWipe}
                    variant="error"
                    disabled={!hasRconAccess}
                    loading={isBpWipeLoading}
                />
            )}
        </CardControls>
    );
}
