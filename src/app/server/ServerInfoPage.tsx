import React from 'react';
import MapInfoPanel from './MapInfoPanel';
import ServerInfoPanel from './ServerInfoPanel';
import ServerDescriptionPanel from './ServerDescriptionPanel';
import ServerHeader from './ServerHeader';

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
}

export default function ServerInfoPage({ database_data, bm_api_server_data, params }: ServerInfoPageProps) {
    const { players, maxPlayers, name, ip, port } = bm_api_server_data.attributes;
    const { rust_maps, rust_description } = bm_api_server_data.attributes.details || {};

    // Process the description to remove '\t'
    const rust_description_final = rust_description?.replace(/\\t/g, '') || '';

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
