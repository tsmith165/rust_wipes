'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RwServer, NextWipeInfo, MapOptions, MapVotes } from '@/db/schema';
import { fetchServers, fetchNextWipeInfo, fetchMapOptions, fetchMapVotes } from '@/app/actions';
import { MdFileCopy, MdMap, MdInfo } from 'react-icons/md';
import { GiVote } from 'react-icons/gi';
import { Tooltip } from 'react-tooltip';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    ChartOptions,
    ChartEvent,
    ActiveElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

interface ServerPanelProps {
    server: RwServer;
    copiedState: boolean;
    onCopy: () => void;
    nextWipeInfo: NextWipeInfo | null;
    mapOptions: MapOptions[];
    mapVotes: MapVotes[];
}

const Countdown: React.FC<{ server: RwServer }> = ({ server }) => {
    const [countdown, setCountdown] = useState<string>('...');

    useEffect(() => {
        const getNextWipeDate = (server: RwServer): Date => {
            const now = new Date();
            const currentDay = now.getDay();
            const currentHour = now.getHours();

            const wipeDays = server.wipe_days.split(',').map(Number);
            let nextWipeDay = wipeDays.find((day) => day > currentDay) || wipeDays[0];
            let daysUntilWipe = nextWipeDay - currentDay;

            if (daysUntilWipe <= 0) {
                daysUntilWipe += 7;
            }

            if (daysUntilWipe === 0 && currentHour >= (server.wipe_time || 11)) {
                daysUntilWipe = 7;
            }

            const nextWipe = new Date(now.getTime() + daysUntilWipe * 24 * 60 * 60 * 1000);
            nextWipe.setHours(server.wipe_time || 11, 0, 0, 0);

            return nextWipe;
        };

        const timer = setInterval(() => {
            const now = new Date();
            const nextWipe = getNextWipeDate(server);
            const timeLeft = nextWipe.getTime() - now.getTime();

            if (timeLeft > 0) {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else {
                setCountdown('Wipe in progress!');
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [server]);

    return countdown;
};

const ServerPanel: React.FC<ServerPanelProps> = ({ server, copiedState, onCopy, nextWipeInfo, mapOptions, mapVotes }) => {
    const [activePanel, setActivePanel] = useState<'nextWipe' | 'mapDisplay' | 'mapVoting'>('nextWipe');

    const ServerInfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
        <div className="flex flex-row space-x-2">
            <div className="w-[90px] font-bold text-stone-300">{label}:</div>
            <div className="text-stone-300">{value}</div>
        </div>
    );

    const NextWipePanel = () => (
        <>
            <div className="flex flex-col space-y-2">
                <ServerInfoRow label="Group Size" value={server.group_size || 'N/A'} />
                <ServerInfoRow label="Drop Rate" value={server.rate} />
                <ServerInfoRow
                    label="Wipe Days"
                    value={server.wipe_days
                        .split(',')
                        .map((day) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][Number(day)])
                        .join(', ')}
                />
                <ServerInfoRow label="Wipe Time" value={`${server.wipe_time}:00AM PST`} />
            </div>
            <div className="my-4 rounded bg-gradient-to-b from-stone-500 to-stone-300 p-3">
                <p className="text-lg font-semibold">Next Wipe In:</p>
                <p className="text-2xl font-bold text-primary_light">
                    <Countdown server={server} />
                </p>
            </div>
        </>
    );

    const MapDisplayPanel = () => {
        console.log('MapOptions:', mapOptions);
        console.log('NextWipeInfo:', nextWipeInfo);
        const currentMap = mapOptions.find((option) => option.seed === nextWipeInfo?.map_seed);

        if (!currentMap)
            return (
                <div className="flex h-[230px] max-h-[230px] flex-col items-center justify-center bg-gradient-to-t from-stone-300 to-stone-500 bg-clip-text text-lg text-transparent">
                    No map found
                </div>
            );
        return (
            <div className="flex h-full max-h-[230px] flex-col items-center justify-center">
                <b className="mb-1 h-fit bg-gradient-to-t from-stone-300 to-stone-500 bg-clip-text text-lg text-transparent">
                    Current Selected Next Map
                </b>
                <a
                    href={currentMap.rust_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[calc(100%-30px)] w-full items-center justify-center"
                >
                    <img src={currentMap.rust_maps_image} alt={currentMap.map_name} className="h-full w-fit rounded-lg object-contain" />
                </a>
            </div>
        );
    };

    const MapVotingPanel = () => {
        const chartData = useMemo(() => {
            const labels = mapOptions.map((option) => option.map_name);
            const data = mapOptions.map((option) => mapVotes.filter((vote) => vote.map_id === option.id).length);

            return {
                labels,
                datasets: [
                    {
                        label: 'Votes',
                        data,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            };
        }, [mapOptions, mapVotes]);

        const options: ChartOptions<'bar'> = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#D1D5DB',
                    },
                },
                x: {
                    ticks: {
                        color: '#D1D5DB',
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            return `Votes: ${context.raw}`;
                        },
                    },
                },
            },
            onClick: (_: ChartEvent, elements: ActiveElement[]) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    if (index !== undefined && mapOptions[index]) {
                        window.open(mapOptions[index].rust_maps_url, '_blank');
                    }
                }
            },
        };

        return (
            <div className="flex h-full flex-col">
                <h3 className="mb-2 text-center text-lg font-semibold text-stone-300">Map Voting</h3>
                <div style={{ height: '200px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </div>
        );
    };

    const renderPanel = () => {
        switch (activePanel) {
            case 'nextWipe':
                return <NextWipePanel />;
            case 'mapDisplay':
                return <MapDisplayPanel />;
            case 'mapVoting':
                return <MapVotingPanel />;
            default:
                return <NextWipePanel />;
        }
    };

    const renderButtons = () => {
        const buttonClass = 'absolute top-0 bg-stone-700 p-2 text-stone-300 hover:bg-primary_light hover:text-stone-950';
        return (
            <>
                {activePanel !== 'nextWipe' && (
                    <button
                        onClick={() => setActivePanel('nextWipe')}
                        className={`${buttonClass} left-0 rounded-br-lg rounded-tl-lg`}
                        data-tooltip-id={`nextWipe-${server.id}`}
                        data-tooltip-content="Server Info"
                    >
                        <MdInfo size={28} />
                        <Tooltip id={`nextWipe-${server.id}`} />
                    </button>
                )}
                {activePanel !== 'mapDisplay' && (
                    <button
                        onClick={() => setActivePanel('mapDisplay')}
                        className={`${buttonClass} ${activePanel === 'nextWipe' ? 'left-0 rounded-br-lg rounded-tl-lg' : 'right-0 rounded-bl-lg rounded-tr-lg'}`}
                        data-tooltip-id={`mapDisplay-${server.id}`}
                        data-tooltip-content="Current Map"
                    >
                        <MdMap size={28} />
                        <Tooltip id={`mapDisplay-${server.id}`} />
                    </button>
                )}
                {activePanel !== 'mapVoting' && (
                    <button
                        onClick={() => setActivePanel('mapVoting')}
                        className={`${buttonClass} right-0 rounded-bl-lg rounded-tr-lg`}
                        data-tooltip-id={`mapVoting-${server.id}`}
                        data-tooltip-content="Map Voting"
                    >
                        <GiVote size={28} />
                        <Tooltip id={`mapVoting-${server.id}`} />
                    </button>
                )}
            </>
        );
    };

    return (
        <div className="radial-gradient-stone-600 relative flex flex-col rounded-lg bg-stone-950 p-4 shadow-md">
            <div className="mb-1 flex w-full items-center justify-center">
                <h2 className="radial-gradient-stone-300 w-fit bg-primary_light bg-clip-text text-center text-2xl font-semibold text-transparent">
                    {server.short_title || server.name}
                </h2>
            </div>
            {renderButtons()}
            <div className="max-h-[230px] overflow-y-auto">{renderPanel()}</div>
            <div className="mt-2 flex flex-row items-center justify-between space-x-2">
                <a
                    href={`steam://connect/${server.connection_url}`}
                    className="flex-grow rounded-lg bg-gradient-to-t from-stone-300 to-stone-500 px-2 py-2 text-center font-bold text-stone-950 transition duration-300 hover:bg-gradient-to-b hover:from-primary_light hover:to-primary_dark hover:text-stone-300"
                >
                    Connect to Server
                </a>
                <button
                    onClick={onCopy}
                    className="rounded-lg bg-gradient-to-t from-stone-300 to-stone-500 px-2 py-2 text-lg text-stone-950 transition duration-300 hover:bg-gradient-to-b hover:from-primary_light hover:to-primary_dark hover:text-stone-300"
                    title="Copy connection URL"
                >
                    <MdFileCopy className="h-6 w-6" />
                </button>
            </div>
            {copiedState && <b className="mt-2 text-center text-sm text-green-500">Copied!</b>}
        </div>
    );
};

const Servers: React.FC = () => {
    const [servers, setServers] = useState<RwServer[]>([]);
    const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({});
    const [nextWipeInfos, setNextWipeInfos] = useState<{ [key: string]: NextWipeInfo }>({});
    const [mapOptions, setMapOptions] = useState<MapOptions[]>([]);
    const [mapVotes, setMapVotes] = useState<MapVotes[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const [fetchedServers, fetchedNextWipeInfos, fetchedMapOptions, fetchedMapVotes] = await Promise.all([
                fetchServers(),
                fetchNextWipeInfo(),
                fetchMapOptions(),
                fetchMapVotes(),
            ]);
            setServers(fetchedServers);
            setNextWipeInfos(fetchedNextWipeInfos.reduce((acc, info) => ({ ...acc, [info.server_id]: info }), {}));
            setMapOptions(fetchedMapOptions);
            setMapVotes(fetchedMapVotes);
        };
        loadData();
    }, []);

    const handleCopy = useCallback((serverId: number, connectionUrl: string) => {
        navigator.clipboard.writeText(connectionUrl);
        setCopiedStates((prev) => ({ ...prev, [serverId]: true }));
        setTimeout(() => {
            setCopiedStates((prev) => ({ ...prev, [serverId]: false }));
        }, 2000);
    }, []);

    console.log('Next Wipe Info:', nextWipeInfos);

    return (
        <div className="radial-gradient-stone-950 container flex max-h-full min-h-full w-full min-w-full flex-col items-center overflow-y-auto bg-primary_dark px-4 py-8">
            <h1 className="radial-gradient-primary_dark mb-8 w-fit bg-primary bg-clip-text text-center text-4xl font-bold text-transparent">
                Our Servers
            </h1>
            <div className="mx-auto grid w-4/5 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {servers.map((server) => {
                    console.log('Server:', server);
                    console.log('Server Connection URL:', server.connection_url);
                    const server_port = server.connection_url.split(':')[1];
                    console.log('Server port:', server_port);

                    return (
                        <ServerPanel
                            key={server.id}
                            server={server}
                            copiedState={copiedStates[server.id]}
                            onCopy={() => handleCopy(server.id, server.connection_url)}
                            nextWipeInfo={nextWipeInfos[server_port] || null}
                            mapOptions={mapOptions}
                            mapVotes={mapVotes.filter((vote) => server.connection_url.includes(vote.server_id))}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Servers;
