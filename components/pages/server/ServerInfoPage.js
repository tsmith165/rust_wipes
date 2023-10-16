'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetch_server_data_by_bm_id } from '@/lib/api_calls';
import MapInfoPanel from './MapInfoPanel';
import ServerInfoPanel from './ServerInfoPanel';
import PlayerCountPanel from './PlayerCountPanel';
import ServerHeader from './ServerHeader';
import { useAnalytics } from '@/lib/helpers/useAnalytics';

const ServerInfoPage = () => {
    useAnalytics();

    const [state, setState] = useState({
        data: null,
        error: null,
    });
    const pathname = usePathname();
    const server_id = pathname.split('/').pop();

    useEffect(() => {
        if (server_id) {
            const fetchData = async () => {
                try {
                    const data = await fetch_server_data_by_bm_id(server_id);
                    setState({ data, error: null });
                } catch (error) {
                    console.error('Error fetching data: ', error);
                    setState({ data: null, error });
                }
            };
            fetchData();
        }
    }, [server_id]);

    if (state.error)
        return <p className="text-xl text-red-500">Error loading data. Please try again later.</p>;
    if (!state.data) return <p className="text-xl text-gray-500">Loading...</p>;

    const { database_data, bm_api_server_data, bm_api_player_count_data } = state.data;
    const { attributes } = bm_api_server_data;
    const { details, players, maxPlayers, name, ip, port } = attributes;
    const { rust_maps, rust_description } = details;
    const { thumbnailUrl } = rust_maps;

    const server_header_container = (
        <ServerHeader name={name} ip={ip} port={port} players={players} maxPlayers={maxPlayers} />
    );

    const server_description_container = (
        <div className="flex-grow mb-6 rounded-b-lg overflow-y-auto max-h-72 md-nav:max-h-none">
            <pre className="text-lg whitespace-pre-wrap hover:bg-light p-2.5">
                {rust_description}
            </pre>
        </div>
    );

    const server_info_panel_container = (
        <div className="mt-auto flex flex-col md-nav:flex-row md-nav:max-h-[20%] pb-5">
            <div className="pb-5 md-nav:pb-0 md-nav:w-1/2 md-nav:pr-5 md-nav:min-h-full">
                <ServerInfoPanel bm_api_attributes={attributes} database_data={database_data} />
            </div>

            <div className="md-nav:w-1/2 min-h-48 md-nav:min-h-full">
                <PlayerCountPanel player_count_data={bm_api_player_count_data} />
            </div>
        </div>
    );

    return (
        <div className="h-full w-full bg-dark px-5 pt-5 text-secondary overflow-y-auto">
            <div className="flex flex-col md-nav:flex-row max-w-7xl mx-auto h-full w-full">
                <div className="w-full md-nav:max-h-full md-nav:w-3/5">
                    <div className="flex flex-col min-w-fill max-h-full overflow-y-auto">
                        {server_header_container /* Server Title / Player Count / IP */}

                        {server_description_container /* Server Description */}

                        {server_info_panel_container /* Server Info Panel */}
                    </div>
                </div>

                <div className="w-full md-nav:max-h-full md-nav:w-2/5 pb-5 md-nav:pt-0 md-nav:pl-5 md-nav:pb-0 ">
                    <div className="flex flex-col w-full space-y-2.5">
                        {/* Rust Maps Image*/}
                        <img
                            className="w-full rounded-lg"
                            src={thumbnailUrl}
                            alt={`Thumbnail of ${name}`}
                        />

                        {/* Map Info */}
                        <MapInfoPanel mapData={rust_maps} />

                        {/* AD */}
                        <div className="h-10 text-center p-2.5 bg-medium rounded-md">AD</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerInfoPage;
