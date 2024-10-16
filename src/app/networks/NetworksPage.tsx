import React from 'react';
import { db } from '@/db/db';
import { rw_server_network, rw_parsed_server } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

// Define interfaces based on your database schema
interface ParsedServer {
    id: number;
    title: string | null;
}

interface ServerNetwork {
    id: number;
    name: string | null;
    region: string | null;
    bm_ids: string | null;
    servers: ParsedServer[];
}

const NetworksPage: React.FC = async (): Promise<JSX.Element> => {
    console.log('Fetching server networks data...');
    let dbNetworks: {
        id: number;
        bm_ids: string | null;
        name: string | null;
        region: string | null;
    }[] = [];

    try {
        dbNetworks = await db.select().from(rw_server_network).where(eq(rw_server_network.region, 'US'));
    } catch (error) {
        console.error('Error fetching server networks:', error);
        return <div>Error loading networks.</div>;
    }

    const networks: ServerNetwork[] = dbNetworks.map((network) => ({
        id: network.id,
        bm_ids: network.bm_ids,
        name: network.name,
        region: network.region,
        servers: [],
    }));

    console.log('Fetching server data for each network...');
    for (const network of networks) {
        if (!network.bm_ids) {
            console.warn(`Network '${network.name ?? 'Unnamed Network'}' has no bm_ids.`);
            continue;
        }

        const bmIds = network.bm_ids.split(',').map((id) => id.trim());

        for (const bm_id of bmIds) {
            const parsedId = parseInt(bm_id, 10);
            if (isNaN(parsedId)) {
                console.warn(`Invalid bm_id '${bm_id}' in network '${network.name ?? 'Unnamed Network'}'`);
                continue;
            }

            try {
                const serverResults: ParsedServer[] = await db
                    .select()
                    .from(rw_parsed_server)
                    .where(eq(rw_parsed_server.id, parsedId))
                    .limit(1)
                    .then((results) =>
                        results.map((server) => ({
                            id: server.id,
                            title: server.title,
                        })),
                    );

                if (serverResults.length > 0) {
                    const server = serverResults[0];
                    network.servers.push(server);
                } else {
                    console.warn(`No server found with id '${parsedId}'`);
                }
            } catch (error) {
                console.error(`Error fetching server with id '${parsedId}':`, error);
            }
        }
    }

    console.log('Rendering network cards...');
    return (
        <div className="flex h-full w-full flex-col overflow-x-auto bg-secondary bg-gradient-to-b from-secondary to-secondary_dark md:flex-row">
            {networks.map((network) => (
                <div key={network.id} className="h-max max-h-full w-full flex-shrink-0 overflow-y-auto p-2 md:w-fit md:max-w-md">
                    <div className="flex h-full flex-col rounded-lg bg-secondary_dark">
                        <h3 className="p-4 font-bold text-primary">{network.name ?? 'Unnamed Network'}</h3>
                        <div className="flex-1 bg-gradient-to-t from-primary_dark to-secondary_dark last:rounded-b-lg">
                            {network.servers.length > 0 ? (
                                network.servers.map((server) => (
                                    <Link key={server.id} href={`/server/${server.id}`}>
                                        <div className="truncate px-2.5 py-1 text-secondary_light hover:font-bold">
                                            {server.title ?? 'Untitled Server'}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="px-2.5 py-1 text-secondary_light">No servers available.</div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NetworksPage;
