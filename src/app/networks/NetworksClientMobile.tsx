'use client';

import React from 'react';
import Link from 'next/link';
import type { ServerNetwork, ServerDetails } from '@/app/networks/types';

interface NetworksClientMobileProps {
    networks: ServerNetwork[];
    selectedNetwork: ServerNetwork | null;
    serverDetails: Record<string, ServerDetails>;
    onNetworkSelect: (network: ServerNetwork) => void;
}

export default function NetworksClientMobile({ networks, selectedNetwork, serverDetails, onNetworkSelect }: NetworksClientMobileProps) {
    return (
        <div className="flex h-full w-full flex-col bg-stone-500 p-4">
            {/* Network Selector */}
            <select
                className="mb-4 w-full rounded-lg bg-stone-800 p-2 text-primary"
                value={selectedNetwork?.id ?? ''}
                onChange={(e) => {
                    const network = networks.find((n) => n.id.toString() === e.target.value);
                    if (network) onNetworkSelect(network);
                }}
            >
                {networks.map((network) => (
                    <option key={network.id} value={network.id}>
                        {network.name ?? 'Unnamed Network'} ({network.servers.length} servers)
                    </option>
                ))}
            </select>

            {/* Server Table */}
            {selectedNetwork ? (
                <div className="overflow-auto">
                    <div className="w-fit rounded-lg bg-stone-800">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-stone-600">
                                    <th className="w-[40%] p-3 text-left text-primary">Server Name</th>
                                    <th className="w-[20%] p-3 text-left text-primary">Pop</th>
                                    <th className="w-[20%] p-3 text-left text-primary">Last Wipe</th>
                                    <th className="w-[20%] p-3 text-left text-primary">Next Wipe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedNetwork.servers.map((server) => {
                                    const details = serverDetails[server.id];
                                    return (
                                        <tr key={server.id} className="border-b border-stone-600 hover:bg-stone-600/20">
                                            <td className="p-3">
                                                <Link href={`/server/${server.id}`} className="hover:text-accent text-primary">
                                                    {server.title ?? 'Untitled Server'}
                                                </Link>
                                            </td>
                                            <td className="p-3 text-primary">
                                                {details?.isLoading
                                                    ? 'Loading...'
                                                    : `${details?.current_pop ?? '?'}/${details?.max_pop ?? '?'}`}
                                            </td>
                                            <td className="p-3 text-primary">
                                                {details?.isLoading
                                                    ? 'Loading...'
                                                    : details?.last_wipe
                                                      ? new Date(details.last_wipe).toLocaleDateString()
                                                      : 'Unknown'}
                                            </td>
                                            <td className="p-3 text-primary">
                                                {details?.isLoading
                                                    ? 'Loading...'
                                                    : details?.next_wipe
                                                      ? new Date(details.next_wipe).toLocaleDateString()
                                                      : 'Unknown'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-primary">Select a network to view its servers</div>
            )}
        </div>
    );
}
