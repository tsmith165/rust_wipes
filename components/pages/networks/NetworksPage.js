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

            const isLastServer =
                network.servers[network.servers.length - 1].id === server.id;
            network_server_list_jsx.push(
                <Link href={`/server/${server.id}`}>
                    <div
                        key={server.id}
                        className={`text-grey px-2.5 py-1 truncate hover:bg-light hover:text-black ${
                            isLastServer ? 'rounded-b-lg' : ''
                        }`}
                        title={server.title}
                    >
                        <b>{server.title}</b>
                    </div>
                </Link>,
            );
        }

        network_card_list_jsx.push(
            <div
                key={network.id}
                className="flex-shrink-0 w-72 max-h-full h-max overflow-y-auto p-2"
            >
                <div className="flex flex-col h-full bg-black rounded-lg">
                    <h3 className="text-light p-4">{network.name}</h3>
                    <div className="flex-1 bg-secondary last:rounded-b-lg">
                        {network_server_list_jsx}
                    </div>
                </div>
            </div>,
        );
    }

    return (
        <div className="flex flew-row h-full w-full overflow-x-auto bg-dark">
            {network_card_list_jsx}
        </div>
    );
};

export default NetworksPage;
