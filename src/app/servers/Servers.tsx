'use client';

import React, { useState, useEffect } from 'react';
import { RwServer } from '@/db/schema';
import { fetchServers } from '@/app/actions';
import { MdFileCopy } from 'react-icons/md';

const Servers: React.FC = () => {
    const [servers, setServers] = useState<RwServer[]>([]);
    const [countdowns, setCountdowns] = useState<{ [key: number]: string }>({});
    const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const loadServers = async () => {
            const fetchedServers = await fetchServers();
            setServers(fetchedServers);
        };
        loadServers();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const updatedCountdowns: { [key: number]: string } = {};

            servers.forEach((server) => {
                const nextWipe = getNextWipeDate(server);
                const timeLeft = nextWipe.getTime() - now.getTime();

                if (timeLeft > 0) {
                    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                    updatedCountdowns[server.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
                } else {
                    updatedCountdowns[server.id] = 'Wipe in progress!';
                }
            });

            setCountdowns(updatedCountdowns);
        }, 1000);

        return () => clearInterval(timer);
    }, [servers]);

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

    const handleCopy = (serverId: number, connectionUrl: string) => {
        navigator.clipboard.writeText(connectionUrl);
        setCopiedStates((prev) => ({ ...prev, [serverId]: true }));
        setTimeout(() => {
            setCopiedStates((prev) => ({ ...prev, [serverId]: false }));
        }, 2000);
    };

    return (
        <div className="container max-h-full min-h-full w-full min-w-full overflow-y-auto bg-gradient-to-b from-stone-400 to-stone-800 px-4 py-8">
            <h1 className="radial-gradient-primary mb-8 bg-clip-text text-center text-4xl font-bold text-transparent">Our Servers</h1>
            <div className="mx-auto grid w-4/5 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {servers.map((server) => (
                    <div key={server.id} className="rounded-lg bg-stone-800 p-6 shadow-md">
                        <h2 className="radial-gradient-primary mb-2 w-full bg-stone-300 bg-clip-text text-center text-2xl font-semibold text-transparent">
                            {server.name}
                        </h2>
                        {/* <p className="mb-2 text-stone-300">Resource Rate: {server.rate}</p> */}
                        <p className="mb-2 text-stone-300">
                            Wipe Days:{' '}
                            {server.wipe_days
                                .split(',')
                                .map((day) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][Number(day)])
                                .join(', ')}
                        </p>
                        <p className="mb-4 text-stone-300">Wipe Time: {server.wipe_time}:00AM PST</p>
                        <div className="mb-4 rounded bg-gradient-to-b from-stone-500 to-stone-300 p-3">
                            <p className="text-lg font-semibold">Next Wipe In:</p>
                            <p className="text-2xl font-bold text-primary_light">{countdowns[server.id]}</p>
                        </div>
                        <div className="flex flex-row items-center justify-between space-x-2">
                            <a
                                href={`steam://connect/${server.connection_url}`}
                                className="flex-grow rounded-lg bg-gradient-to-t from-stone-300 to-stone-500 px-2 py-2 text-center font-bold text-stone-950 transition duration-300 hover:bg-gradient-to-b hover:from-primary_light hover:to-primary_dark hover:text-stone-300"
                            >
                                Connect to Server
                            </a>
                            <button
                                onClick={() => handleCopy(server.id, server.connection_url)}
                                className="rounded-lg bg-gradient-to-t from-stone-300 to-stone-500 px-2 py-2 text-lg text-stone-950 transition duration-300 hover:bg-gradient-to-b hover:from-primary_light hover:to-primary_dark hover:text-stone-300"
                                title="Copy connection URL"
                            >
                                <MdFileCopy className="h-6 w-6" />
                            </button>
                        </div>
                        {copiedStates[server.id] && <p className="mt-2 text-center text-sm text-green-500">Copied!</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Servers;
