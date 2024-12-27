import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { db } from '@/db/db';
import { rw_server_network, rw_parsed_server } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { fetchNetworkServerDetails } from '@/app/actions';
import { NetworksDisplay } from './NetworksDisplay';
import { createSearchParamsCache } from 'nuqs/server';
import { parseAsString, parseAsInteger } from 'nuqs/server';

export const metadata: Metadata = {
    title: 'Server Networks - Rust Wipes',
    description: 'Discover various server networks on Rust Wipes.',
};

// Define search params using nuqs
const { parse } = createSearchParamsCache({
    networkId: parseAsInteger.withDefault(0),
    region: parseAsString.withDefault('US'),
});

async function getNetworksData() {
    try {
        // Fetch networks from database
        const networks = await db
            .select({
                id: rw_server_network.id,
                name: rw_server_network.name,
                bm_ids: rw_server_network.bm_ids,
                region: rw_server_network.region,
            })
            .from(rw_server_network)
            .where(eq(rw_server_network.region, 'US'));

        // Process each network and its servers
        const networksWithServers = await Promise.all(
            networks.map(async (network) => {
                if (!network.bm_ids) return null;

                const serverIds = network.bm_ids.split(',').map((id) => id.trim());
                const parsedIds = serverIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));

                // Fetch server details from database
                const servers = await db
                    .select({
                        id: rw_parsed_server.id,
                        title: rw_parsed_server.title,
                    })
                    .from(rw_parsed_server)
                    .where(inArray(rw_parsed_server.id, parsedIds));

                if (servers.length === 0) return null;

                // Fetch server details from BattleMetrics
                const bmServers = await fetchNetworkServerDetails(parsedIds.map(String));

                // Combine all server information
                const serversWithDetails = servers.map((server) => {
                    const bmServer = bmServers.find((bm) => bm.id === server.id);
                    return {
                        id: server.id,
                        bm_id: server.id.toString(),
                        title: server.title,
                        current_pop: bmServer?.current_pop ?? 0,
                        max_pop: bmServer?.max_pop ?? 0,
                        last_wipe: bmServer?.last_wipe ?? null,
                        next_wipe: bmServer?.next_wipe ?? null,
                    };
                });

                return {
                    id: network.id,
                    name: network.name,
                    region: network.region,
                    bm_ids: network.bm_ids,
                    servers: serversWithDetails,
                };
            }),
        );

        return networksWithServers.filter((n): n is NonNullable<typeof n> => n !== null);
    } catch (error) {
        console.error('Error fetching networks:', error);
        return [];
    }
}

export default async function Networks({ searchParams }: { searchParams: { [key: string]: string } }) {
    const { networkId } = parse(searchParams);
    const networks = await getNetworksData();

    return (
        <PageLayout page={'networks'}>
            <NetworksDisplay networks={networks} selectedNetworkId={networkId} />
        </PageLayout>
    );
}

// Force dynamic rendering since we're fetching live data
export const dynamic = 'force-dynamic';
