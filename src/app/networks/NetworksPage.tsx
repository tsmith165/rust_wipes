import React, { type JSX } from 'react';
import { db } from '@/db/db';
import { rw_server_network, rw_parsed_server } from '@/db/schema';
import { eq } from 'drizzle-orm';
import NetworksClient from './NetworksClient';
import type { ServerNetwork, ParsedServer } from '@/app/networks/types';

const NetworksPage = async (): Promise<JSX.Element> => {
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

    console.log('Fetching basic server data for each network...');
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
                const serverResults = await db
                    .select({
                        id: rw_parsed_server.id,
                        title: rw_parsed_server.title,
                    })
                    .from(rw_parsed_server)
                    .where(eq(rw_parsed_server.id, parsedId))
                    .limit(1);

                if (serverResults.length > 0) {
                    const dbServer = serverResults[0];
                    network.servers.push({
                        id: dbServer.id,
                        title: dbServer.title,
                        bm_id: bm_id,
                        isLoading: true,
                    });
                }
            } catch (error) {
                console.error(`Error fetching server with id '${parsedId}':`, error);
            }
        }
    }

    return <NetworksClient networks={networks} />;
};

export default NetworksPage;
