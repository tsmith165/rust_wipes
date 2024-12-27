import React from 'react';
import Link from 'next/link';
import type { ServerNetwork } from './types';

interface SidebarProps {
    networks: ServerNetwork[];
    selectedNetworkId: number;
}

const SELECTED_NETWORK_CLASS = 'bg-primary_dark text-stone-300';
const UNSELECTED_NETWORK_CLASS = 'text-stone-400 hover:bg-stone-700';

export function NetworksSidebar({ networks, selectedNetworkId }: SidebarProps) {
    return (
        <div className="flex w-[20%] min-w-[250px] flex-col bg-stone-800">
            <div className="flex-grow">
                {networks.map((network) => (
                    <Link
                        key={network.id}
                        href={`/networks?networkId=${network.id}`}
                        className={`mb-2 block w-full rounded-r-xl p-2 text-left ${
                            selectedNetworkId === network.id ? SELECTED_NETWORK_CLASS : UNSELECTED_NETWORK_CLASS
                        }`}
                        prefetch={false}
                    >
                        <div className="font-medium">{network.name ?? 'Unnamed Network'}</div>
                        <div className="text-sm opacity-75">
                            ({network.servers.length} server{network.servers.length !== 1 ? 's' : ''})
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
