import React from 'react';
import { NetworksSidebar } from './Networks.Sidebar';
import { NetworksContent } from './Networks.Content';
import type { ServerNetwork } from './types';

interface NetworksDisplayProps {
    networks: ServerNetwork[];
    selectedNetworkId: number;
}

export function NetworksDisplay({ networks, selectedNetworkId }: NetworksDisplayProps) {
    const selectedNetwork = networks.find((n) => n.id === selectedNetworkId) ?? networks[0];

    return (
        <div className="flex h-full w-full">
            <NetworksSidebar networks={networks} selectedNetworkId={selectedNetworkId} />
            <NetworksContent network={selectedNetwork} />
        </div>
    );
}
