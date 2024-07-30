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

    // ... (keep the existing useEffect for countdowns and getNextWipeDate function)

    const handleCopy = (serverId: number, connectionUrl: string) => {
        navigator.clipboard.writeText(connectionUrl);
        setCopiedStates((prev) => ({ ...prev, [serverId]: true }));
        setTimeout(() => {
            setCopiedStates((prev) => ({ ...prev, [serverId]: false }));
        }, 2000);
    };

    const ServerInfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
        <div className="flex flex-row justify-between">
            <div className="font-bold text-primary">{label}:</div>
            <div className="text-stone-300">{value}</div>
        </div>
    );

    return (
        <div className="radial-gradient-stone-950 container max-h-full min-h-full w-full min-w-full overflow-y-auto bg-primary_dark px-4 py-8">
            <h1 className="radial-gradient-primary mb-8 bg-primary_dark bg-clip-text text-center text-4xl font-bold text-transparent">
                Our Servers
            </h1>
            <div className="mx-auto grid w-4/5 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {servers.map((server) => (
                    <div key={server.id} className="radial-gradient-stone-600 rounded-lg bg-stone-950 p-6 shadow-md">
                        <h2 className="radial-gradient-primary_dark mb-4 w-full bg-primary bg-clip-text text-center text-2xl font-semibold text-transparent">
                            {server.short_title}
                        </h2>
                        <div className="flex flex-col space-y-2">
                            <ServerInfoRow label="Group Size" value={server.group_size || '1x'} />
                            <ServerInfoRow label="Drop Rate" value={server.rate} />
                            <ServerInfoRow
                                label="Wipe Days"
                                value={server.wipe_days
                                    .split(',')
                                    .map(
                                        (day) =>
                                            ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][Number(day)],
                                    )
                                    .join(', ')}
                            />
                            <ServerInfoRow label="Wipe Time" value={`${server.wipe_time}:00AM PST`} />
                        </div>
                        <div className="my-4 rounded bg-gradient-to-b from-stone-500 to-stone-300 p-3">
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
