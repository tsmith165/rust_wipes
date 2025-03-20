'use client';

import React from 'react';
import InputSelect from '@/components/inputs/InputSelect';
import type { ServerNetwork } from './types';

interface MobileFormProps {
    networks: ServerNetwork[];
    selectedNetworkId: number;
}

export function NetworksMobileForm({ networks, selectedNetworkId }: MobileFormProps) {
    const networkOptions = networks.map(
        (network) => [network.id.toString(), `${network.name} (${network.servers.length} servers)`] as [string, string],
    );

    return (
        <div className="w-full bg-stone-800 p-4">
            <InputSelect
                idName="network-select"
                name="Network"
                select_options={networkOptions}
                value={selectedNetworkId.toString()}
                onChange={(value) => {
                    window.location.href = `/networks?networkId=${value}`;
                }}
            />
        </div>
    );
}
