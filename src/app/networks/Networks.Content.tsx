import React from 'react';
import Link from 'next/link';
import { Table } from '@/components/tables/Table';
import { TableHeader } from '@/components/tables/Table.Header';
import { TableRow } from '@/components/tables/Table.Row';
import type { ServerNetwork } from './types';
import { SERVER_TITLE_RATE_KEYWORDS, type ResourceRateGroup } from './constants';
import { formatTimeDifference } from './utils';

interface ContentProps {
    network: ServerNetwork | null;
}

const TABLE_COLUMNS = [
    { key: 'name', label: 'Server Name', width: 'w-[40%]' },
    { key: 'pop', label: 'Pop', width: 'w-[20%]' },
    { key: 'sinceWipe', label: 'Since Wipe', width: 'w-[20%]' },
    { key: 'untilWipe', label: 'Until Wipe', width: 'w-[20%]' },
];

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

function NetworksTableContent({ servers }: { servers: ServerNetwork['servers'] }) {
    return (
        <tbody className="bg-stone-600/20">
            {servers.map((server) => (
                <TableRow key={server.id}>
                    <td className="p-3">
                        <Link href={`/server/${server.id}`} className="hover:text-accent">
                            {server.title}
                        </Link>
                    </td>
                    <td className="p-3">{`${server.current_pop ?? '?'}/${server.max_pop ?? '?'}`}</td>
                    <td className="p-3">{formatTimeDifference(server.last_wipe ? new Date(server.last_wipe) : null, false)}</td>
                    <td className="p-3">{formatTimeDifference(server.next_wipe ? new Date(server.next_wipe) : null, true)}</td>
                </TableRow>
            ))}
        </tbody>
    );
}

export function NetworksContent({ network }: ContentProps) {
    const groupedServers = network ? groupServersByRate(network.servers) : null;

    return (
        <div className="flex-grow overflow-y-scroll bg-stone-500 p-4">
            {network && groupedServers ? (
                <div>
                    <h1 className="mb-4 w-full text-center text-2xl font-bold text-stone-800">
                        <a href={`https://www.${network.name}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                            {network.name ?? 'Unnamed Network'}
                        </a>
                    </h1>
                    {Object.entries(groupedServers)
                        .filter(([_, servers]) => servers.length > 0)
                        .map(([group, servers]) => (
                            <div key={group} className="mb-6">
                                <h3 className="mb-2 w-full text-center text-lg font-semibold text-stone-300">{group}</h3>
                                <Table>
                                    <TableHeader columns={TABLE_COLUMNS} />
                                    <NetworksTableContent servers={servers} />
                                </Table>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="text-primary">Select a network to view its servers</div>
            )}
        </div>
    );
}
