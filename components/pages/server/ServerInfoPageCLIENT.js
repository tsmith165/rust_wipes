'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetch_server_data_by_bm_id } from '@/lib/api_calls';
import MapInfoPanel from './MapInfoPanel';
import ServerInfoPanel from './ServerInfoPanel';
import ServerDescriptionPanel from './ServerDescriptionPanel';
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

    const { database_data, bm_api_server_data } = state.data;
    const { attributes } = bm_api_server_data;
    const { details, players, maxPlayers, name, ip, port } = attributes;
    const { rust_maps, rust_description } = details;
    const { thumbnailUrl } = rust_maps;

    const rust_description_final = rust_description.replace(/\\t/g, '');
    console.log('rust_description_final: ', rust_description_final);

    return (
        <div className="h-full w-full overflow-y-auto bg-dark bg-gradient-to-b from-grey to-primary px-5 pt-5 text-primary">
            <div className="mx-auto flex h-full w-full max-w-7xl flex-col md-nav:flex-row">
                <div className="w-full md-nav:max-h-full md-nav:w-3/5">
                    <div className="min-w-fill flex max-h-full flex-col overflow-y-auto">
                        <ServerHeader name={name} />

                        <div className="max-h-72 flex-grow overflow-y-auto rounded-b-lg md-nav:max-h-none">
                            <ServerInfoPanel
                                bm_api_attributes={attributes}
                                database_data={database_data}
                                ip={ip}
                                port={port}
                                players={players}
                                maxPlayers={maxPlayers}
                            />
                        </div>

                        <ServerDescriptionPanel description={rust_description_final} />
                    </div>
                </div>

                <div className="w-full pb-2.5 md-nav:max-h-full md-nav:w-2/5 md-nav:pb-0 md-nav:pl-2.5 md-nav:pt-0 ">
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
