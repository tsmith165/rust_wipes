import React from 'react';
import Link from 'next/link';
import { formatTimeDifference } from './utils';
import { SERVER_TITLE_RATE_KEYWORDS, type ResourceRateGroup } from './constants';
import type { ServerNetwork } from './types';

interface NetworksDisplayProps {
    networks: ServerNetwork[];
    selectedNetworkId: number;
}

function getServerResourceRate(title: string): ResourceRateGroup {
    const lowerTitle = title.toLowerCase();
    for (const [group, keywords] of Object.entries(SERVER_TITLE_RATE_KEYWORDS)) {
        if (keywords.some((keyword) => lowerTitle.includes(keyword))) {
            return group as ResourceRateGroup;
        }
    }
    return 'Vanilla';
}

function groupServersByRate(servers: ServerNetwork['servers']) {
    const groups: Record<ResourceRateGroup, typeof servers> = {
        Vanilla: [],
        '1.5x': [],
        '2x': [],
        '3x': [],
        '5x+': [],
        'Build / Creative': [],
        'Arena / AimTrain': [],
    };

    servers.forEach((server) => {
        if (!server.title) return;
        const rate = getServerResourceRate(server.title);
        groups[rate].push(server);
    });

    return groups;
}

export function NetworksDisplay({ networks, selectedNetworkId }: NetworksDisplayProps) {
    const selectedNetwork = networks.find((n) => n.id === selectedNetworkId) ?? networks[0];
    const groupedServers = selectedNetwork ? groupServersByRate(selectedNetwork.servers) : null;

    return (
        <div className="flex h-full w-full">
            {/* Left Column - Network List */}
            <div className="flex w-[20%] min-w-[250px] flex-col bg-stone-800">
                <div className="flex-grow">
                    {networks.map((network) => (
                        <Link
                            key={network.id}
                            href={`/networks?networkId=${network.id}`}
                            className={`mb-2 block w-full rounded p-2 text-left ${
                                selectedNetwork?.id === network.id ? 'bg-primary text-secondary_dark' : 'text-primary hover:bg-stone-600'
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

            {/* Right Column - Server Details */}
            <div className="flex-grow overflow-y-scroll bg-stone-500 p-4">
                {selectedNetwork && groupedServers ? (
                    <div>
                        <h2 className="mb-4 text-2xl font-bold text-primary">{selectedNetwork.name ?? 'Unnamed Network'}</h2>
                        {Object.entries(groupedServers)
                            .filter(([_, servers]) => servers.length > 0)
                            .map(([group, servers]) => (
                                <div key={group} className="mb-6">
                                    <h3 className="mb-2 text-lg font-semibold text-primary">{group}</h3>
                                    <div className="overflow-x-auto rounded-lg bg-stone-800">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-stone-600">
                                                    <th className="w-[40%] p-3 text-left text-primary">Server Name</th>
                                                    <th className="w-[20%] p-3 text-left text-primary">Pop</th>
                                                    <th className="w-[20%] p-3 text-left text-primary">Since Wipe</th>
                                                    <th className="w-[20%] p-3 text-left text-primary">Until Wipe</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-stone-600/20">
                                                {servers.map((server) => (
                                                    <tr key={server.id} className="border-b border-stone-600 hover:bg-stone-800">
                                                        <td className="p-3">
                                                            <Link href={`/server/${server.id}`} className="hover:text-accent text-primary">
                                                                {server.title}
                                                            </Link>
                                                        </td>
                                                        <td className="p-3 text-primary">
                                                            {`${server.current_pop ?? '?'}/${server.max_pop ?? '?'}`}
                                                        </td>
                                                        <td className="p-3 text-primary">
                                                            {formatTimeDifference(
                                                                server.last_wipe ? new Date(server.last_wipe) : null,
                                                                false,
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-primary">
                                                            {formatTimeDifference(
                                                                server.next_wipe ? new Date(server.next_wipe) : null,
                                                                true,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="text-primary">Select a network to view its servers</div>
                )}
            </div>
        </div>
    );
}
