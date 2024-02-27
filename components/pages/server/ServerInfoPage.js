import React from 'react';
import Image from 'next/image';
import axios from 'axios';

import { prisma } from '@/lib/prisma';
import MapInfoPanel from './MapInfoPanel';
import ServerInfoPanel from './ServerInfoPanel';
import ServerDescriptionPanel from './ServerDescriptionPanel';
import ServerHeader from './ServerHeader';

export default async function ServerInfoPage({ params }) {
    const server_id = params.server_id || '1';

    // Directly fetch server data using Prisma
    const database_data = await prisma.server_parsed.findUnique({
        where: { id: parseInt(server_id) },
    });

    if (!database_data) {
        return <p className="text-xl text-red-500">Server not found.</p>;
    }

    console.log(database_data);

    // Fetch BattleMetrics API data
    const bmApiUrl = `https://api.battlemetrics.com/servers/${server_id}`;
    const bm_api_server_data_response = await axios.get(bmApiUrl);
    const bm_api_server_data = bm_api_server_data_response.data.data;

    console.log('DB Data: ', database_data);
    console.log('BM API Data: ', bm_api_server_data);

    // Assuming `serverData` contains all necessary details
    const { players, maxPlayers, name, ip, port } = bm_api_server_data.attributes;
    const { rust_maps, rust_description } = bm_api_server_data.attributes.details || {};

    console.log(`IP: ${ip}:${port}`);
    console.log('Rust Description: ', rust_description);

    // Process the description to remove '\t'
    const rust_description_final = rust_description.replace(/\t/g, '');

    return (
        <div className="h-full w-full overflow-y-auto bg-dark bg-gradient-to-b from-grey to-primary px-5 pt-5 text-primary">
            <div className="mx-auto flex h-full w-full max-w-7xl flex-col md-nav:flex-row">
                <div className="w-full md-nav:max-h-full md-nav:w-3/5">
                    <div className="min-w-fill flex max-h-full flex-col overflow-y-auto">
                        <ServerHeader title={name} />
                        <ServerInfoPanel
                            bm_api_attributes={bm_api_server_data.attributes}
                            database_data={database_data}
                            ip={ip}
                            port={port}
                            players={players}
                            maxPlayers={maxPlayers}
                        />
                        <ServerDescriptionPanel description={rust_description_final} />
                    </div>
                </div>
                <div className="w-full pb-2.5 md-nav:max-h-full md-nav:w-2/5 md-nav:pb-0 md-nav:pl-2.5 md-nav:pt-0 ">
                    <div className="flex w-full flex-col space-y-2.5">
                        <Image
                            className="w-full rounded-lg"
                            src={rust_maps.thumbnailUrl}
                            alt={`Thumbnail of ${name}`}
                            width={100}
                            height={100}
                        />
                        <MapInfoPanel mapData={rust_maps} />
                        {/* Placeholder for AD */}
                        <div className="h-10 rounded-md bg-dark p-2.5 text-center">AD</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
