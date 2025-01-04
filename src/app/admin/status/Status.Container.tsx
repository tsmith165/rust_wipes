'use client';

import { useEffect } from 'react';
import { useServerStatusStore } from '@/stores/Store.ServerStatus';
import { ServerStatusData } from './Status.Actions';
import { CardContainer } from '@/components/ui/card/Card.Container';
import { CardHeader } from '@/components/ui/card/Card.Header';
import { CardContent } from '@/components/ui/card/Card.Content';
import { CardRowGroup } from '@/components/ui/card/Card.CardRow';
import { SERVER_GROUPS } from './Status.Constants';

interface StatusContainerProps {
    initialStatus: ServerStatusData[];
}

export function StatusContainer({ initialStatus }: StatusContainerProps) {
    const { servers, setServers } = useServerStatusStore();

    useEffect(() => {
        setServers(initialStatus);
    }, [initialStatus, setServers]);

    const renderServerCard = (server: ServerStatusData) => (
        <CardContainer key={server.server_id} status={server.status}>
            <CardHeader status={server.status} serverName={server.server_name || server.server_id} />
            <CardContent
                serverId={server.server_id}
                playerCount={server.player_count || 0}
                maxPlayers={server.max_players || 0}
                rustBuild={server.rust_build || 'Unknown'}
                lastRestart={server.last_restart}
                lastWipe={server.last_wipe}
                bmId={server.bm_id || ''}
            />
        </CardContainer>
    );

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
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
        </div>
    );
}
