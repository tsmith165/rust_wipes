'use client';

import { RwServer, NextWipeInfo, MapOptions, MapVotes } from '@/db/schema';
import { ServerPanel } from './ServerPanel';
import { useState, useCallback } from 'react';

interface ServersListProps {
    servers: RwServer[];
    nextWipeInfoMap: Record<string, NextWipeInfo>;
    mapOptions: MapOptions[];
    mapVotes: MapVotes[];
}

export function ServersList({ servers, nextWipeInfoMap, mapOptions, mapVotes }: ServersListProps) {
    const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({});

    const handleCopy = useCallback((serverId: number, connectionUrl: string) => {
        navigator.clipboard.writeText(connectionUrl);
        setCopiedStates((prev) => ({ ...prev, [serverId]: true }));
        setTimeout(() => {
            setCopiedStates((prev) => ({ ...prev, [serverId]: false }));
        }, 2000);
    }, []);

    return (
        <div className="mx-auto grid w-4/5 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {servers.map((server) => {
                const server_port = server.connection_url.split(':')[1];
                return (
                    <ServerPanel
                        key={server.id}
                        server={server}
                        copiedState={copiedStates[server.id]}
                        onCopy={() => handleCopy(server.id, server.connection_url)}
                        nextWipeInfo={nextWipeInfoMap[server_port] || null}
                        mapOptions={mapOptions}
                        mapVotes={mapVotes.filter((vote) => server.connection_url.includes(vote.server_id))}
                    />
                );
            })}
        </div>
    );
}
