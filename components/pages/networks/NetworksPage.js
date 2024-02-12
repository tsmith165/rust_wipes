'use client';

// /components/pages/networks/NetworksPage.js
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetch_server_networks_data } from '@/lib/api_calls';

const NetworksPage = () => {
    const [state, setState] = useState({
        networks: [],
    });

    useEffect(() => {
        // Fetch the server networks from the database
        // This function is hypothetical, replace with your actual data fetching logic
        fetch_server_networks_data()
            .then((networks) => {
                console.log('Returned Networks: ', networks);
                setState({ ...state, networks: networks?.networks || [] });
            })
            .catch((error) => {
                console.error('Failed to fetch server networks: ', error);
            });
    }, []);

    var network_card_list_jsx = [];

    for (const network of state.networks) {
        console.log('Network: ', network);
        console.log('BM IDs: ', network.bm_ids);
        console.log('Servers: ', network.servers);

        const network_server_list_jsx = [];

        // sort network.servers by its rank key
        for (const server of network.servers.sort((a, b) => a.rank - b.rank)) {
            console.log('Server: ', server);

            const isLastServer = network.servers[network.servers.length - 1].id === server.id;
            network_server_list_jsx.push(
                <Link href={`/server/${server.id}`}>
                    <div
                        key={server.id}
                        className={`truncate px-2.5 py-1 text-grey hover:bg-light hover:text-black ${isLastServer ? 'rounded-b-lg' : ''}`}
                        title={server.title}
                    >
                        <b>{server.title}</b>
                    </div>
                </Link>,
            );
        }

        network_card_list_jsx.push(
            <div key={network.id} className="h-max max-h-full w-fit max-w-md flex-shrink-0 overflow-y-auto p-2">
                <div className="flex h-full flex-col rounded-lg bg-black">
                    <h3 className="p-4 font-bold text-primary">{network.name}</h3>
                    <div className="flex-1 bg-secondary last:rounded-b-lg">{network_server_list_jsx}</div>
                </div>
            </div>,
        );
    }

    return <div className="flew-row flex h-full w-full overflow-x-auto bg-dark">{network_card_list_jsx}</div>;
};

export default NetworksPage;
