import React from 'react';
import { NetworksDesktopForm } from './Networks.Desktop.Form';
import { NetworksDesktopContent } from './Networks.Desktop.Content';
import { NetworksMobileForm } from './Networks.Mobile.Form';
import { NetworksMobileContent } from './Networks.Mobile.Content';
import type { ServerNetwork } from './types';

interface NetworksDisplayProps {
    networks: ServerNetwork[];
    selectedNetworkId: number;
}

export function NetworksContainer({ networks, selectedNetworkId }: NetworksDisplayProps) {
    const selectedNetwork = networks.find((n) => n.id === selectedNetworkId) ?? networks[0];

    return (
        <>
            {/* Desktop View */}
            <div className="hidden h-full w-full md:!flex">
                <NetworksDesktopForm networks={networks} selectedNetworkId={selectedNetworkId} />
                <NetworksDesktopContent network={selectedNetwork} />
            </div>

            {/* Mobile View */}
            <div className="flex h-full w-full flex-col md:!hidden">
                <NetworksMobileForm networks={networks} selectedNetworkId={selectedNetworkId} />
                <NetworksMobileContent network={selectedNetwork} />
            </div>
        </>
    );
}
