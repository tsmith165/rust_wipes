// File 2: /app/server/ServerInfoPage.tsx

import React from 'react';
import axios from 'axios';
import { db } from '@/db/db';
import { rw_parsed_server } from '@/db/schema';
import { eq } from 'drizzle-orm';
import MapInfoPanel from './MapInfoPanel';
import ServerInfoPanel from './ServerInfoPanel';
import ServerDescriptionPanel from './ServerDescriptionPanel';
import ServerHeader from './ServerHeader';

interface ServerInfoPageProps {
    params?: {
        server_id?: string;
    };
}

interface BattleMetricsServerData {
    data: {
        attributes: {
            players: number;
            maxPlayers: number;
            name: string;
            ip: string;
            port: number;
            details?: {
                rust_maps: any;
                rust_description: string;
            };
        };
    };
}

export default async function ServerInfoPage({ params }: ServerInfoPageProps) {
    const server_id = params?.server_id || '1';

    // Directly fetch server data using Drizzle
    const database_data = await db
        .select()
        .from(rw_parsed_server)
        .where(eq(rw_parsed_server.id, parseInt(server_id)))
        .limit(1);

    if (database_data.length === 0) {
        return <p className="text-xl text-red-500">Server not found.</p>;
    }

    console.log(database_data);

    // Fetch BattleMetrics API data
    const bmApiUrl = `https://api.battlemetrics.com/servers/${server_id}`;
    const bm_api_server_data_response = await axios.get<BattleMetricsServerData>(bmApiUrl);
    const bm_api_server_data = bm_api_server_data_response.data.data;

    console.log('DB Data: ', database_data);
    console.log('BM API Data: ', bm_api_server_data);

    // Assuming `serverData` contains all necessary details
    const { players, maxPlayers, name, ip, port } = bm_api_server_data.attributes;
    const { rust_maps, rust_description } = bm_api_server_data.attributes.details || {};

    console.log(`IP: ${ip}:${port}`);
    console.log('Rust Description: ', rust_description);

    // Process the description to remove '\t'
    const rust_description_final = rust_description?.replace(/\\t/g, '') || '';
    console.log('rust_description_final: ', rust_description_final);

    return (
        <div className="h-full w-full overflow-y-auto bg-secondary bg-gradient-to-b from-secondary_light to-primary px-5 pt-5 text-primary">
            <div className="mx-auto flex h-full w-full max-w-7xl flex-col space-y-2.5 md-nav:flex-row md-nav:space-y-0">
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
                        <MapInfoPanel mapData={rust_maps} name={name} />
                        {/* Placeholder for AD */}
                        <div className="h-10 rounded-md bg-secondary p-2.5 text-center">AD</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
