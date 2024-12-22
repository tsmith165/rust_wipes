'use client';

import React from 'react';
import { useQueryState } from 'nuqs';
import { useIsMobile } from './useIsMobile';
import NetworksClientDesktop from './NetworksClientDesktop';
import NetworksClientMobile from './NetworksClientMobile';
import type { ServerNetwork, ServerDetails } from '@/app/networks/types';
import { fetchNetworkServerDetails } from '@/app/actions';

interface NetworksClientProps {
    networks: ServerNetwork[];
}

export default function NetworksClient({ networks }: NetworksClientProps) {
    const isMobile = useIsMobile();
    const [networkId, setNetworkId] = useQueryState('network', {
        defaultValue: networks[0]?.id.toString() ?? '',
        parse: (value) => value,
    });

    const selectedNetwork = networks.find((n) => n.id.toString() === networkId) ?? networks[0];
    const [serverDetails, setServerDetails] = React.useState<Record<string, ServerDetails>>({});

    // Fetch server details when network is selected
    React.useEffect(() => {
        if (!selectedNetwork) return;

        const serverIds = selectedNetwork.servers.map((s) => s.bm_id);

        async function updateServerDetails() {
            try {
                const bmServers = await fetchNetworkServerDetails(serverIds);

                setServerDetails((prev) => {
                    const updates: Record<string, ServerDetails> = {};

                    bmServers.forEach((bmServer) => {
                        const server = selectedNetwork.servers.find((s) => parseInt(s.bm_id, 10) === bmServer.id);
                        if (server) {
                            updates[server.id] = {
                                ...server,
                                current_pop: bmServer.current_pop,
                                max_pop: bmServer.max_pop,
                                last_wipe: bmServer.last_wipe,
                                next_wipe: bmServer.next_wipe,
                                isLoading: false,
                            };
                        }
                    });

                    return updates;
                });
            } catch (error) {
                console.error('Error updating server details:', error);
                // Mark all servers as not loading on error
                setServerDetails((prev) => {
                    const updates: Record<string, ServerDetails> = {};
                    selectedNetwork.servers.forEach((server) => {
                        updates[server.id] = {
                            ...server,
                            isLoading: false,
                        };
                    });
                    return updates;
                });
            }
        }

        // Reset server details and start loading
        setServerDetails((prev) => {
            const initial: Record<string, ServerDetails> = {};
            selectedNetwork.servers.forEach((server) => {
                initial[server.id] = {
                    ...server,
                    isLoading: true,
                };
            });
            return initial;
        });

        updateServerDetails();

        // Set up polling interval
        const interval = setInterval(updateServerDetails, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [selectedNetwork]);

    const handleNetworkSelect = (network: ServerNetwork) => {
        setNetworkId(network.id.toString());
    };

    const sharedProps = {
        networks,
        selectedNetwork,
        serverDetails,
        onNetworkSelect: handleNetworkSelect,
    };

    return isMobile ? <NetworksClientMobile {...sharedProps} /> : <NetworksClientDesktop {...sharedProps} />;
}
