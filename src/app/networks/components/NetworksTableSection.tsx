'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/tables/Table';
import { TableHeader } from '@/components/tables/Table.Header';
import { TableRow } from '@/components/tables/Table.Row';
import { BookOpen, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import type { ServerNetwork } from '../types';
import { SERVER_TITLE_RATE_KEYWORDS, type ResourceRateGroup } from '../Networks.Constants';
import { formatTimeDifference } from '@/utils/Date.Format.TimeDifference';

interface NetworksTableSectionProps {
    network: ServerNetwork | null;
    networks: ServerNetwork[];
    selectedNetworkId: number;
    onOpenLegendOverlay: () => void;
}

const TABLE_COLUMNS = [
    { key: 'name', label: 'Server Name', width: 'w-[40%]' },
    { key: 'pop', label: 'Pop', width: 'w-[20%]' },
    { key: 'sinceWipe', label: 'Since Wipe', width: 'w-[20%]' },
    { key: 'untilWipe', label: 'Until Wipe', width: 'w-[20%]' },
];

// Number of cards to display at once - defined at the top level
const VISIBLE_COUNT = 3;

function getServerResourceRate(title: string): ResourceRateGroup {
    const lowerTitle = title.toLowerCase();
    for (const [group, keywords] of Object.entries(SERVER_TITLE_RATE_KEYWORDS)) {
        if (keywords.some((keyword) => lowerTitle.includes(keyword))) {
            return group as ResourceRateGroup;
        }
    }
    return 'Vanilla';
}

function groupServersByRate(servers: ServerNetwork['servers']) {
    const groups: Record<ResourceRateGroup, typeof servers> = {
        Vanilla: [],
        '1.5x': [],
        '2x': [],
        '3x': [],
        '5x+': [],
        'Build / Creative': [],
        'Arena / AimTrain': [],
    };

    servers.forEach((server) => {
        if (!server.title) return;
        const rate = getServerResourceRate(server.title);
        groups[rate].push(server);
    });

    return groups;
}

function NetworksTableContent({ servers }: { servers: ServerNetwork['servers'] }) {
    return (
        <tbody className="bg-st_darker">
            {servers.map((server) => (
                <TableRow key={server.id}>
                    <td className="p-3">
                        <Link href={`/server/${server.id}`} className="hover:text-primary_light">
                            {server.title}
                        </Link>
                    </td>
                    <td className="p-3">{`${server.current_pop ?? '?'}/${server.max_pop ?? '?'}`}</td>
                    <td className="p-3">{formatTimeDifference(server.last_wipe ? new Date(server.last_wipe) : null, false)}</td>
                    <td className="p-3">{formatTimeDifference(server.next_wipe ? new Date(server.next_wipe) : null, true)}</td>
                </TableRow>
            ))}
        </tbody>
    );
}

// Network Card component
const NetworkCard = ({ network, isSelected, onClick }: { network: ServerNetwork; isSelected: boolean; onClick: () => void }) => (
    <div
        onClick={onClick}
        className={`flex min-w-[220px] max-w-[220px] flex-col items-center rounded-lg p-5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] ${
            isSelected
                ? 'bg-primary text-st_white shadow-lg ring-2 ring-primary_light/50'
                : 'bg-st_dark text-st_lightest hover:bg-st/80 hover:shadow-md'
        } cursor-pointer`}
    >
        <div className={`mb-3 rounded-full p-3 ${isSelected ? 'bg-primary_dark/50' : 'bg-st_darker'}`}>
            <Building size={28} />
        </div>
        <div className="mb-3 text-center text-lg font-medium">{network.name ?? 'Unnamed Network'}</div>
        <div className="mt-1 rounded-full bg-st_darkest/50 px-4 py-1.5 text-sm">
            {network.servers.length} server{network.servers.length !== 1 ? 's' : ''}
        </div>
    </div>
);

export default function NetworksTableSection({ network, networks, selectedNetworkId, onOpenLegendOverlay }: NetworksTableSectionProps) {
    const router = useRouter();
    const carouselRef = useRef<HTMLDivElement>(null);
    const groupedServers = network ? groupServersByRate(network.servers) : null;
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Find current network index
    const currentIndex = networks.findIndex((n) => n.id === selectedNetworkId);

    // Calculate the visible networks based on the selected network
    const visibleNetworks = useMemo(() => {
        // If we have 3 or fewer networks, just show all of them
        if (networks.length <= VISIBLE_COUNT) {
            return networks;
        }

        // Create a circular array for infinite scrolling
        const circularNetworks = [...networks, ...networks];

        // Try to position the selected network in the middle
        if (currentIndex === 0) {
            // For first item, show it as first with next two
            return [circularNetworks[currentIndex], circularNetworks[currentIndex + 1], circularNetworks[currentIndex + 2]];
        } else if (currentIndex === networks.length - 1) {
            // For last item, show it as last with previous two
            return [circularNetworks[currentIndex - 2], circularNetworks[currentIndex - 1], circularNetworks[currentIndex]];
        } else {
            // For middle items, center the selected network
            return [circularNetworks[currentIndex - 1], circularNetworks[currentIndex], circularNetworks[currentIndex + 1]];
        }
    }, [networks, currentIndex]);

    // Handle navigation to slide one network at a time
    const slideRight = () => {
        if (isTransitioning) return;

        // Calculate next index with circular wrapping
        const nextIndex = (currentIndex + 1) % networks.length;
        const nextNetworkId = networks[nextIndex].id;

        setIsTransitioning(true);

        // Update URL immediately
        router.push(`/networks?networkId=${nextNetworkId}`, { scroll: false });

        // Reset transition state after animation completes
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const slideLeft = () => {
        if (isTransitioning) return;

        // Calculate previous index with circular wrapping
        const prevIndex = (currentIndex - 1 + networks.length) % networks.length;
        const prevNetworkId = networks[prevIndex].id;

        setIsTransitioning(true);

        // Update URL immediately
        router.push(`/networks?networkId=${prevNetworkId}`, { scroll: false });

        // Reset transition state after animation completes
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const handleNetworkSelect = (networkId: number) => {
        if (networkId === selectedNetworkId || isTransitioning) return;
        setIsTransitioning(true);
        router.push(`/networks?networkId=${networkId}`, { scroll: false });
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    return (
        <section className="bg-st_darkest py-8">
            <div className="container mx-auto px-4">
                {/* Network Selector */}
                <div id="networks-carousel" className="bg-st_darker mb-8 overflow-hidden rounded-lg">
                    <div className="relative p-4 pb-8">
                        {/* Navigation Arrows */}
                        <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-2">
                            <button
                                onClick={slideLeft}
                                className="bg-st_darker flex h-10 w-10 items-center justify-center rounded-full text-st_lightest shadow-md transition-colors hover:bg-primary hover:text-st_white active:scale-90"
                                data-tooltip-id="prev-network-tooltip"
                                data-tooltip-content="Previous Network"
                                disabled={isTransitioning}
                            >
                                <ChevronLeft size={20} />
                            </button>
                        </div>
                        <Tooltip id="prev-network-tooltip" place="top" />

                        {/* Network Cards */}
                        <div className="relative mx-12 h-[200px] overflow-hidden">
                            <div
                                ref={carouselRef}
                                className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform gap-6 transition-all duration-300"
                            >
                                {visibleNetworks.map((network) => (
                                    <NetworkCard
                                        key={network.id}
                                        network={network}
                                        isSelected={selectedNetworkId === network.id}
                                        onClick={() => handleNetworkSelect(network.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="absolute inset-y-0 right-0 z-10 flex items-center pr-2">
                            <button
                                onClick={slideRight}
                                className="bg-st_darker flex h-10 w-10 items-center justify-center rounded-full text-st_lightest shadow-md transition-colors hover:bg-primary hover:text-st_white active:scale-90"
                                data-tooltip-id="next-network-tooltip"
                                data-tooltip-content="Next Network"
                                disabled={isTransitioning}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <Tooltip id="next-network-tooltip" place="top" />
                    </div>
                </div>

                {/* Network Content */}
                <div className="relative mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <h2 className="text-2xl font-bold text-primary_light">
                        {network?.name ? `${network.name} Servers` : 'Network Servers'}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Legend Button */}
                        <button
                            onClick={onOpenLegendOverlay}
                            className="flex h-10 items-center rounded-lg bg-st_dark px-3 text-st_lightest transition-colors hover:text-primary_light"
                            data-tooltip-id="legend-tooltip"
                            data-tooltip-content="Open Legend"
                        >
                            <BookOpen size={18} />
                        </button>
                        <Tooltip id="legend-tooltip" place="top" />
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg shadow-lg">
                    {network && groupedServers ? (
                        <div>
                            {Object.entries(groupedServers)
                                .filter(([, servers]) => servers.length > 0)
                                .map(([group, servers]) => (
                                    <div key={group} className="mb-6 last:mb-0">
                                        <h3 className="mb-2 w-full p-2 text-center text-lg font-semibold text-st_lightest">{group}</h3>
                                        <Table>
                                            <TableHeader columns={TABLE_COLUMNS} />
                                            <NetworksTableContent servers={servers} />
                                        </Table>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="bg-st_darker flex h-40 items-center justify-center rounded-lg">
                            <div className="text-st_lightest">Select a network to view its servers</div>
                        </div>
                    )}
                </div>

                {network && (
                    <div className="mt-4 text-right text-sm text-st_lightest">
                        {network.servers.length} {network.servers.length === 1 ? 'server' : 'servers'} found
                    </div>
                )}
            </div>
        </section>
    );
}
