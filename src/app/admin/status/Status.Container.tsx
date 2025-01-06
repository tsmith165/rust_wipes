'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useServerStatusStore } from '@/stores/Store.ServerStatus';
import { ServerStatusData, restartServer, regularWipe, bpWipe, checkPlugins } from './Status.Actions';
import { CardContainer } from '@/components/ui/card/Card.Container';
import { CardHeader } from '@/components/ui/card/Card.Header';
import { CardContent } from '@/components/ui/card/Card.Content';
import { CardRowGroup } from '@/components/ui/card/Card.CardRow';
import { CardError } from '@/components/ui/card/Card.Error';
import { CardSuccess } from '@/components/ui/card/Card.Success';
import { SERVER_GROUPS } from './Status.Constants';
import { ModalPlugins } from '@/components/overlays/templates/Modal.Plugins';

const AUTO_REFRESH_SECONDS = 5;
const AUTO_REFRESH_INTERVAL = AUTO_REFRESH_SECONDS * 1000;

interface StatusContainerProps {
    initialStatus: ServerStatusData[];
}

export function StatusContainer({ initialStatus }: StatusContainerProps) {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
    const [showPluginsOverlay, setShowPluginsOverlay] = useState(false);
    const [selectedServer, setSelectedServer] = useState<ServerStatusData | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        servers,
        setServers,
        serverErrors,
        setServerError,
        clearServerError,
        serverSuccesses,
        setServerSuccess,
        clearServerSuccess,
        loadingCommands,
        setCommandLoading,
    } = useServerStatusStore();

    useEffect(() => {
        setServers(initialStatus);
    }, [initialStatus, setServers]);

    // Auto-refresh
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            handleAutoRefresh();
        }, AUTO_REFRESH_INTERVAL);

        return () => clearInterval(refreshInterval);
    }, []);

    const handleAutoRefresh = async () => {
        if (isRefreshing || isAutoRefreshing) return;
        setIsAutoRefreshing(true);
        try {
            router.refresh();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setTimeout(() => {
                setIsAutoRefreshing(false);
            }, 500);
        }
    };

    const handleManualRefresh = async () => {
        if (isRefreshing || isAutoRefreshing) return;
        setIsRefreshing(true);
        try {
            router.refresh();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setTimeout(() => {
                setIsRefreshing(false);
            }, 500);
        }
    };

    const handleRconCommand = async (
        serverId: string,
        command: 'restart' | 'regularWipe' | 'bpWipe' | 'checkPlugins',
        action: (id: string) => Promise<{ success: boolean; error?: string; successMessage?: string }>,
    ) => {
        setCommandLoading(serverId, command, true);
        try {
            const result = await action(serverId);
            if (!result.success) {
                setServerError(serverId, result.error || 'Unknown error occurred');
                clearServerSuccess(serverId);
            } else {
                clearServerError(serverId);
                setServerSuccess(serverId, result.successMessage || 'Command executed successfully');
                handleManualRefresh();
            }
        } catch (error) {
            console.error(`Error executing command for server ${serverId}:`, error);
            setServerError(serverId, 'An unexpected error occurred');
            clearServerSuccess(serverId);
        } finally {
            setCommandLoading(serverId, command, false);
        }
    };

    const handleViewPlugins = async (server: ServerStatusData) => {
        // If no plugins in database, fetch them first
        if (!server.installed_plugins) {
            await handleRconCommand(server.server_id, 'checkPlugins', checkPlugins);
            // After fetching, get the updated server data
            const updatedServer = servers.find((s) => s.server_id === server.server_id);
            if (updatedServer) {
                setSelectedServer(updatedServer);
                setShowPluginsOverlay(true);
            }
        } else {
            // If plugins exist in database, show immediately
            setSelectedServer(server);
            setShowPluginsOverlay(true);
        }
    };

    const handleCheckPlugins = async (serverId: string) => {
        await handleRconCommand(serverId, 'checkPlugins', checkPlugins);
        // After refreshing plugins, update the selected server data
        const updatedServer = servers.find((s) => s.server_id === serverId);
        if (updatedServer) {
            setSelectedServer(updatedServer);
        }
        handleManualRefresh();
    };

    // Update selected server when servers state changes
    useEffect(() => {
        if (selectedServer) {
            const updatedServer = servers.find((s) => s.server_id === selectedServer.server_id);
            if (updatedServer) {
                setSelectedServer(updatedServer);
            }
        }
    }, [servers, selectedServer]);

    const renderServerCard = (server: ServerStatusData) => {
        const serverLoadingState = loadingCommands[server.server_id] || {};

        return (
            <CardContainer
                key={server.server_id}
                status={server.status}
                server={server}
                onRestart={() => handleRconCommand(server.server_id, 'restart', restartServer)}
                onRegularWipe={() => handleRconCommand(server.server_id, 'regularWipe', regularWipe)}
                onBpWipe={() => handleRconCommand(server.server_id, 'bpWipe', bpWipe)}
                onCheckPlugins={() => handleViewPlugins(server)}
                isRestartLoading={serverLoadingState.restart}
                isRegularWipeLoading={serverLoadingState.regularWipe}
                isBpWipeLoading={serverLoadingState.bpWipe}
                isCheckPluginsLoading={serverLoadingState.checkPlugins}
            >
                <CardHeader
                    status={server.status}
                    serverName={server.server_name || server.server_id}
                    onRefresh={handleManualRefresh}
                    isRefreshing={isRefreshing || isAutoRefreshing}
                />
                <CardContent
                    server={server}
                    playerCount={server.player_count || 0}
                    maxPlayers={server.max_players || 0}
                    rustBuild={server.rust_build || 'Unknown'}
                    onRestart={() => handleRconCommand(server.server_id, 'restart', restartServer)}
                    onRegularWipe={() => handleRconCommand(server.server_id, 'regularWipe', regularWipe)}
                    onBpWipe={() => handleRconCommand(server.server_id, 'bpWipe', bpWipe)}
                    onCheckPlugins={() => handleViewPlugins(server)}
                    isRestartLoading={serverLoadingState.restart}
                    isRegularWipeLoading={serverLoadingState.regularWipe}
                    isBpWipeLoading={serverLoadingState.bpWipe}
                    isCheckPluginsLoading={serverLoadingState.checkPlugins}
                />
                {serverErrors[server.server_id] && (
                    <CardError error={serverErrors[server.server_id]!} onDismiss={() => clearServerError(server.server_id)} />
                )}
                {serverSuccesses[server.server_id] && (
                    <CardSuccess message={serverSuccesses[server.server_id]!} onDismiss={() => clearServerSuccess(server.server_id)} />
                )}
            </CardContainer>
        );
    };

    return (
        <div ref={containerRef} className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] md:w-4/5">
                {SERVER_GROUPS.map(({ group, servers: groupServers }) => (
                    <CardRowGroup key={group} groupName={group}>
                        {servers
                            .filter((server) => server.server_id && groupServers.includes(Number(server.server_id)))
                            .map(renderServerCard)}
                    </CardRowGroup>
                ))}
                {servers.length === 0 && <div className="text-center text-gray-500">No servers to display</div>}
            </div>

            {/* Plugin Viewer Overlay */}
            <ModalPlugins
                isOpen={showPluginsOverlay}
                onClose={() => setShowPluginsOverlay(false)}
                plugins={selectedServer?.installed_plugins || []}
                onRefresh={selectedServer ? () => handleCheckPlugins(selectedServer.server_id) : undefined}
                isRefreshing={loadingCommands[selectedServer?.server_id || '']?.checkPlugins}
                lastUpdated={selectedServer?.plugins_updated_at ? new Date(selectedServer.plugins_updated_at) : undefined}
                containerRef={containerRef}
            />
        </div>
    );
}
