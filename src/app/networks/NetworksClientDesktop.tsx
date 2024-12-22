'use client';

import React from 'react';
import Link from 'next/link';
import constants from '@/lib/constants';
import type { ServerNetwork, ServerDetails } from '@/app/networks/types';

interface NetworksClientDesktopProps {
    networks: ServerNetwork[];
    selectedNetwork: ServerNetwork | null;
    serverDetails: Record<string, ServerDetails>;
    onNetworkSelect: (network: ServerNetwork) => void;
}

export default function NetworksClientDesktop({ networks, selectedNetwork, serverDetails, onNetworkSelect }: NetworksClientDesktopProps) {
    return (
        <div className="flex h-full w-full">
            {/* Left Column - Network List */}
            <div className="flex w-[20%] min-w-[250px] flex-col bg-stone-800">
                <div className="flex-grow">
                    {networks.map((network) => (
                        <button
                            key={network.id}
                            onClick={() => onNetworkSelect(network)}
                            className={`mb-2 w-full rounded p-2 text-left ${
                                selectedNetwork?.id === network.id ? 'bg-primary text-secondary_dark' : 'text-primary hover:bg-stone-600'
                            }`}
                        >
                            <div className="font-medium">{network.name ?? 'Unnamed Network'}</div>
                            <div className="text-sm opacity-75">
                                ({network.servers.length} server{network.servers.length !== 1 ? 's' : ''})
                            </div>
                        </button>
                    ))}
                </div>

                {/* Contact Link */}
                <div className="mt-4 cursor-pointer rounded p-2 text-sm text-primary hover:bg-stone-500">
                    Want to get your network added? Contact us{' '}
                    <Link href={constants.CONTACT_DISCORD} className="text-blue-400 hover:underline">
                        here!
                    </Link>
                </div>
            </div>

            {/* Right Column - Server Details */}
            <div className="flex-grow overflow-y-scroll bg-stone-500 p-4">
                {selectedNetwork ? (
                    <div>
                        <h2 className="mb-4 text-2xl font-bold text-primary">{selectedNetwork.name ?? 'Unnamed Network'}</h2>

                        <div className="overflow-x-auto rounded-lg bg-stone-800">
                            <table className="w-full">
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
        </div>
    );
}
