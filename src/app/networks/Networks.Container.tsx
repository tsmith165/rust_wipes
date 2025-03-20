'use client';

import React, { useState } from 'react';
import NetworksHero from './components/NetworksHero';
import NetworksTableSection from './components/NetworksTableSection';
import LegendOverlay from './components/LegendOverlay';
import type { ServerNetwork } from './types';

interface NetworksDisplayProps {
    networks: ServerNetwork[];
    selectedNetworkId: number;
}

export function NetworksContainer({ networks, selectedNetworkId }: NetworksDisplayProps) {
    const [isLegendOverlayOpen, setIsLegendOverlayOpen] = useState(false);

    const selectedNetwork = networks.find((n) => n.id === selectedNetworkId) ?? networks[0];

    const handleOpenLegendOverlay = () => {
        setIsLegendOverlayOpen(true);
    };

    const handleCloseLegendOverlay = () => {
        setIsLegendOverlayOpen(false);
    };

    return (
        <>
            <NetworksHero />

            <NetworksTableSection
                network={selectedNetwork}
                networks={networks}
                selectedNetworkId={selectedNetworkId}
                onOpenLegendOverlay={handleOpenLegendOverlay}
            />

            <LegendOverlay isOpen={isLegendOverlayOpen} onClose={handleCloseLegendOverlay} />
        </>
    );
}
