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

    return (
        <div className="h-full w-full bg-dark px-5 pt-5 text-secondary overflow-y-auto">
            <div className="flex flex-wrap max-w-7xl mx-auto h-full">
                <div
                    className="md:max-h-full min-w-full md:min-w-[461px]"
                    style={{ flex: '1 1 65%' }}>
                    <div className="flex flex-col min-w-fill max-h-full overflow-y-auto">
                        {/* Server Title / Player Count / IP */}
                        <ServerHeader
                            name={name}
                            ip={ip}
                            port={port}
                            players={players}
                            maxPlayers={maxPlayers}
                        />

                        {/* Server Description */}
                        <div className="flex-grow mb-6 rounded-b-lg overflow-y-auto max-h-72 md:max-h-none">
                            <pre className="text-lg whitespace-pre-wrap hover:bg-light p-2.5">
                                {rust_description}
                            </pre>
                        </div>

                        {/* Server Info Panel */}
                        <div className="mt-auto flex flex-col md:flex-row max-h-[20%] pb-5">
                            <div className="pb-5 md:pb-0 md:w-1/2 md:pr-5">
                                <ServerInfoPanel
                                    bm_api_attributes={attributes}
                                    database_data={database_data}
                                />
                            </div>

                            <div className="md:w-1/2">
                                <PlayerCountPanel player_count_data={bm_api_player_count_data} />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="md:max-h-full pt-5 pb-5 md:pt-0 md:pl-5 md:pb-0"
                    style={{ flex: '1 1 35%', minHeight: '20px' }}>
                    <div className="flex flex-col w-full">
                        {/* Rust Maps Image*/}
                        <img
                            className="w-full mb-2.5 rounded-lg"
                            src={thumbnailUrl}
                            alt={`Thumbnail of ${name}`}
                        />

                        {/* Map Info */}
                        <MapInfoPanel mapData={rust_maps} />

                        {/* AD */}
                        <div className="h-10 mt-2.5 text-center p-2.5 bg-medium rounded-md">AD</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerInfoPage;
