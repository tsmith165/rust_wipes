'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import type { ServerNetwork, ServerDetails } from '@/app/networks/types';
import InputSelect from '@/components/inputs/InputSelect';
import { SERVER_TITLE_RATE_KEYWORDS, type ResourceRateGroup } from './constants';
import { formatTimeDifference } from './utils';

interface NetworksClientMobileProps {
    networks: ServerNetwork[];
    selectedNetwork: ServerNetwork | null;
    serverDetails: Record<string, ServerDetails>;
    onNetworkSelect: (network: ServerNetwork) => void;
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
        const rate = getServerResourceRate(server.title ?? '');
        groups[rate].push(server);
    });

    return groups;
}

function getLoadingGroups(): Record<ResourceRateGroup, { id: number; title: string; isLoading: boolean; bm_id: string }[]> {
    return {
        Vanilla: [{ id: -1, title: 'Loading...', isLoading: true, bm_id: '-1' }],
        '1.5x': [],
        '2x': [],
        '3x': [],
        '5x+': [],
        'Build / Creative': [],
        'Arena / AimTrain': [],
    };
}

export default function NetworksClientMobile({ networks, selectedNetwork, serverDetails, onNetworkSelect }: NetworksClientMobileProps) {
    const networkOptions = useMemo(
        () =>
            networks.map(
                (network) =>
                    [network.id.toString(), `${network.name ?? 'Unnamed Network'} (${network.servers.length} servers)`] as [string, string],
            ),
        [networks],
    );

    const isLoadingTitles = selectedNetwork?.servers.some((server) => !server.title);
    const groupedServers = useMemo(() => {
        if (!selectedNetwork) return null;
        if (isLoadingTitles) return getLoadingGroups();
        return groupServersByRate(selectedNetwork.servers);
    }, [selectedNetwork, isLoadingTitles]);

    return (
        <div className="flex h-full w-full flex-col bg-stone-500 p-4">
            {/* Network Selector */}
            <div className="mb-4">
                <InputSelect
                    idName="network-select"
                    name="Network"
                    select_options={networkOptions}
                    value={selectedNetwork?.id.toString()}
                    onChange={(value: string) => {
                        const network = networks.find((n) => n.id.toString() === value);
                        if (network) onNetworkSelect(network);
                    }}
                />
            </div>

            {/* Server Table */}
            {selectedNetwork && groupedServers ? (
                <div className="overflow-auto">
                    {isLoadingTitles ? (
                        <div className="rounded-lg bg-stone-800 p-4">
                            <div className="text-center text-primary">Loading servers...</div>
                        </div>
                    ) : (
                        (Object.entries(groupedServers) as [ResourceRateGroup, typeof selectedNetwork.servers][])
                            .filter(([_, servers]) => servers.length > 0)
                            .map(([group, servers]) => (
                                <div key={group} className="mb-4">
                                    <h2 className="mb-2 text-center text-lg font-bold text-primary">{group}</h2>
                                    <div className="w-fit rounded-lg bg-stone-800">
                                        <table className="w-full min-w-[600px]">
                                            <thead>
                                                <tr className="border-b border-stone-600">
                                                    <th className="w-[40%] p-3 text-left text-primary">Server Name</th>
                                                    <th className="w-[20%] p-3 text-left text-primary">Pop</th>
                                                    <th className="w-[20%] p-3 text-left text-primary">Since Wipe</th>
                                                    <th className="w-[20%] p-3 text-left text-primary">Until Wipe</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {servers.map((server) => {
                                                    const details = serverDetails[server.id];
                                                    return (
                                                        <tr
                                                            key={server.id}
                                                            className="border-b border-stone-600 bg-stone-600/20 hover:bg-stone-800"
                                                        >
                                                            <td className="p-3">
                                                                <Link
                                                                    href={`/server/${server.id}`}
                                                                    className="hover:text-accent text-primary"
                                                                >
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
                                                                    : formatTimeDifference(
                                                                          details?.last_wipe ? new Date(details.last_wipe) : null,
                                                                          false,
                                                                      )}
                                                            </td>
                                                            <td className="p-3 text-primary">
                                                                {details?.isLoading
                                                                    ? 'Loading...'
                                                                    : formatTimeDifference(
                                                                          details?.next_wipe ? new Date(details.next_wipe) : null,
                                                                          true,
                                                                      )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            ) : (
                <div className="text-primary">Select a network to view its servers</div>
            )}
        </div>
    );
}
