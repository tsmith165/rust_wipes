import { db } from '@/db/db';
import { rw_server_network, rw_parsed_server } from '@/db/schema';
import { eq } from 'drizzle-orm';
import NetworksClient from './NetworksClient';
import type { ServerNetwork } from '@/app/networks/types';

// This function runs server-side during initial page load
async function getBasicNetworkData() {
    try {
        const networks = await db
            .select({
                id: rw_server_network.id,
                name: rw_server_network.name,
                bm_ids: rw_server_network.bm_ids,
                region: rw_server_network.region,
            })
            .from(rw_server_network)
            .where(eq(rw_server_network.region, 'US'));

        const networksWithServers = await Promise.all(
            networks.map(async (network) => {
                const servers = network.bm_ids
                    ? await Promise.all(
                          network.bm_ids.split(',').map(async (bm_id) => {
                              const parsedId = parseInt(bm_id, 10);
                              if (isNaN(parsedId)) return null;

                              const server = await db
                                  .select({
                                      id: rw_parsed_server.id,
                                  })
                                  .from(rw_parsed_server)
                                  .where(eq(rw_parsed_server.id, parsedId))
                                  .limit(1);

                              return server[0]
                                  ? {
                                        id: server[0].id,
                                        bm_id: bm_id.trim(),
                                        title: null,
                                        isLoading: true,
                                    }
                                  : null;
                          }),
                      )
                    : [];

                return {
                    id: network.id,
                    name: network.name,
                    region: network.region,
                    bm_ids: network.bm_ids,
                    servers: servers.filter((s): s is NonNullable<typeof s> => s !== null),
                };
            }),
        );

        return networksWithServers;
    } catch (error) {
        console.error('Error fetching networks:', error);
        return [];
    }
}

export default async function NetworksData() {
    const networks = await getBasicNetworkData();
    return <NetworksClient initialNetworks={networks} />;
}
