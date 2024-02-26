'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetch_server_data_by_bm_id } from '@/lib/api_calls';
import MapInfoPanel from './MapInfoPanel';
import ServerInfoPanel from './ServerInfoPanel';
import PlayerCountPanel from './PlayerCountPanel';
import ServerHeader from './ServerHeader';
import { useAnalytics } from '@/lib/helpers/useAnalytics';

export default function ServerInfoPage() {
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

    if (state.error) return <p className="text-xl text-red-500">Error loading data. Please try again later.</p>;
    if (!state.data) return <p className="text-xl text-gray-500">Loading...</p>;

    const { database_data, bm_api_server_data, bm_api_player_count_data } = state.data;
    const { attributes } = bm_api_server_data;
    const { details, players, maxPlayers, name, ip, port } = attributes;
    const { rust_maps, rust_description } = details;
    const { thumbnailUrl } = rust_maps;

    const server_header_container = <ServerHeader name={name} ip={ip} port={port} players={players} maxPlayers={maxPlayers} />;

    const server_description_container = (
        <div className="mb-6 max-h-72 flex-grow overflow-y-auto rounded-b-lg md-nav:max-h-none">
            <pre className="whitespace-pre-wrap p-2.5 text-lg hover:bg-grey">{rust_description}</pre>
        </div>
    );

    const server_info_panel_container = (
        <div className="mt-auto flex flex-col pb-5 md-nav:max-h-[20%] md-nav:flex-row">
            <div className="pb-5 md-nav:min-h-full md-nav:w-1/2 md-nav:pb-0 md-nav:pr-5">
                <ServerInfoPanel bm_api_attributes={attributes} database_data={database_data} />
            </div>

            <div className="min-h-48 md-nav:min-h-full md-nav:w-1/2">
                <PlayerCountPanel player_count_data={bm_api_player_count_data} />
            </div>
        </div>
    );

    return (
        <div className="h-full w-full overflow-y-auto bg-black px-5 pt-5 text-primary">
            <div className="mx-auto flex h-full w-full max-w-7xl flex-col md-nav:flex-row">
                <div className="w-full md-nav:max-h-full md-nav:w-3/5">
                    <div className="min-w-fill flex max-h-full flex-col overflow-y-auto">
                        {server_header_container /* Server Title / Player Count / IP */}

                        {server_description_container /* Server Description */}

                        {server_info_panel_container /* Server Info Panel */}
                    </div>
                </div>

                <div className="w-full pb-5 md-nav:max-h-full md-nav:w-2/5 md-nav:pb-0 md-nav:pl-5 md-nav:pt-0 ">
                    <div className="flex w-full flex-col space-y-2.5">
                        {/* Rust Maps Image*/}
                        <img className="w-full rounded-lg" src={thumbnailUrl} alt={`Thumbnail of ${name}`} />

                        {/* Map Info */}
                        <MapInfoPanel mapData={rust_maps} />

                        {/* AD */}
                        <div className="h-10 rounded-md bg-dark p-2.5 text-center">AD</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
