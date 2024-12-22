import React from 'react';
import MapInfoPanel from './MapInfoPanel';
import ServerInfoPanel from './ServerInfoPanel';
import ServerDescriptionPanel from './ServerDescriptionPanel';
import PlayerCountPanel from './PlayerCountPanel';

interface ServerInfoPageProps {
    params?: {
        server_id?: string;
    };
    database_data: any;
    bm_api_server_data: {
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
    player_history: Array<{
        timestamp: string;
        players: number;
    }>;
}

export default function ServerInfoPage({ database_data, bm_api_server_data, player_history, params }: ServerInfoPageProps) {
    console.log('Player history data:', player_history);
    if (!player_history || player_history.length === 0) {
        console.warn('No player history data available');
    }

    const { players, maxPlayers, name, ip, port } = bm_api_server_data.attributes;
    const { rust_maps, rust_description } = bm_api_server_data.attributes.details || {};

    // Process the description to remove '\t'
    const rust_description_final = rust_description?.replace(/\\t/g, '') || '';

    return (
        <div className="h-[calc(100vh-50px)] w-full overflow-y-scroll bg-gradient-to-b from-stone-800 to-stone-500 p-5 text-primary">
            <div className="mx-auto flex h-full w-full max-w-7xl flex-col space-y-2.5 md-nav:flex-row md-nav:space-y-0">
                <div className="w-full md-nav:max-h-full md-nav:w-3/5">
                    <div className="min-w-fill flex max-h-full flex-col overflow-y-auto">
                        <h1 className="w-auto truncate text-2xl font-bold text-primary_light">{bm_api_server_data.attributes.name}</h1>

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
                <div className="w-full pb-2.5 md-nav:max-h-full md-nav:w-2/5 md-nav:pb-0 md-nav:pl-2.5 md-nav:pt-0">
                    <div className="flex w-full flex-col space-y-2.5">
                        {rust_maps?.thumbnailUrl && <MapInfoPanel mapData={rust_maps} name={name} />}
                    </div>
                    <div className="mt-2.5 h-[350px] w-full">
                        <PlayerCountPanel player_count_data={player_history} />
                    </div>
                </div>
            </div>
        </div>
    );
}
