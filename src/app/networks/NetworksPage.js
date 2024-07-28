// /components/pages/networks/NetworksPage.js
import React from 'react';
import { db } from '@/db/db';
import { rw_server_network, rw_parsed_server } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function NetworksPage() {
    console.log('Fetching server networks data...');
    const networks = await db.select().from(rw_server_network).where(eq(rw_server_network.region, 'US'));

    console.log('Fetching server data for each network...');
    for (const network of networks) {
        network.servers = [];
        for (const bm_id of network.bm_ids.split(', ')) {
            const server = await db
                .select()
                .from(rw_parsed_server)
                .where(eq(rw_parsed_server.id, parseInt(bm_id)))
                .limit(1);
            if (server.length > 0) {
                network.servers.push(server[0]);
            }
        }
    }

    console.log('Rendering network cards...');
    return (
        <div className="to-secondary_dark flex h-full w-full flex-col overflow-x-auto bg-secondary bg-gradient-to-b from-secondary md:flex-row">
            {networks.map((network) => (
                <div key={network.id} className="h-max max-h-full w-full flex-shrink-0 overflow-y-auto p-2 md:w-fit md:max-w-md">
                    <div className="bg-secondary_dark flex h-full flex-col rounded-lg">
                        <h3 className="p-4 font-bold text-primary">{network.name}</h3>
                        <div className="from-primary_dark to-secondary_dark flex-1 bg-gradient-to-t last:rounded-b-lg">
                            {network.servers.map((server) => (
                                <Link key={server.id} href={`/server/${server.id}`}>
                                    <div className="text-secondary_light truncate px-2.5 py-1 hover:font-bold">{server.title}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
