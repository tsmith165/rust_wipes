import React from 'react';
import Link from 'next/link';
import type { ServerNetwork } from './types';
import { SERVER_TITLE_RATE_KEYWORDS, type ResourceRateGroup } from './Networks.Constants';
import { formatTimeDifference } from '@/utils/Date.Format.TimeDifference';

interface MobileContentProps {
    network: ServerNetwork | null;
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

function ServerCard({ server }: { server: ServerNetwork['servers'][0] }) {
    return (
        <div className="mb-2 rounded-lg bg-stone-600 p-4">
            <Link href={`/server/${server.id}`} className="hover:text-accent block text-center font-medium text-stone-900">
                {server.title}
            </Link>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                    <div className="text-stone-400">Population</div>
                    <div className="text-stone-800">{`${server.current_pop ?? '?'}/${server.max_pop ?? '?'}`}</div>
                </div>
                <div>
                    <div className="text-stone-400">Since Wipe</div>
                    <div className="text-stone-800">
                        {formatTimeDifference(server.last_wipe ? new Date(server.last_wipe) : null, false)}
                    </div>
                </div>
                <div>
                    <div className="text-stone-400">Until Wipe</div>
                    <div className="text-stone-800">{formatTimeDifference(server.next_wipe ? new Date(server.next_wipe) : null, true)}</div>
                </div>
            </div>
        </div>
    );
}

export function NetworksMobileContent({ network }: MobileContentProps) {
    const groupedServers = network ? groupServersByRate(network.servers) : null;

    return (
        <div className="flex-grow overflow-y-auto bg-stone-500 p-4">
            {network && groupedServers ? (
                <div>
                    <h1 className="mb-4 text-center text-xl font-bold text-stone-900">
                        <a href={`https://www.${network.name}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                            {network.name ?? 'Unnamed Network'}
                        </a>
                    </h1>
                    {Object.entries(groupedServers)
                        .filter(([, servers]) => servers.length > 0)
                        .map(([group, servers]) => (
                            <div key={group} className="mb-6">
                                <h3 className="mb-2 text-center text-lg font-semibold text-stone-300">{group}</h3>
                                <div className="space-y-2">
                                    {servers.map((server) => (
                                        <ServerCard key={server.id} server={server} />
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="text-primary">Select a network to view its servers</div>
            )}
        </div>
    );
}
