'use client';

import React, { useState, useEffect } from 'react';
import { ServerPerformanceData, getServerPerformanceData } from './actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceDisplayProps {
    initialPerformanceData: ServerPerformanceData[];
}

export function PerformanceDisplay({ initialPerformanceData }: PerformanceDisplayProps) {
    const [selectedServer, setSelectedServer] = useState<string>('');
    const [filteredData, setFilteredData] = useState<ServerPerformanceData[]>([]);
    const [servers, setServers] = useState<{ id: string; name: string }[]>([]);
    const [updatesPerMinute, setUpdatesPerMinute] = useState<number>(12);
    const [recordsToDisplay, setRecordsToDisplay] = useState<number>(250);
    const [performanceData, setPerformanceData] = useState<ServerPerformanceData[]>(initialPerformanceData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const uniqueServers = Array.from(new Set(performanceData.map((data) => data.system_id))).map((id) => ({
            id,
            name: performanceData.find((data) => data.system_id === id)?.server_name || 'Unknown',
        }));
        setServers(uniqueServers);

        if (uniqueServers.length > 0 && !selectedServer) {
            setSelectedServer(uniqueServers[0].id);
        }
    }, [performanceData, selectedServer]);

    useEffect(() => {
        const filtered = performanceData.filter((data) => data.system_id === selectedServer);
        setFilteredData(filtered.slice(-recordsToDisplay));
    }, [selectedServer, performanceData, recordsToDisplay]);

    useEffect(() => {
        const intervalMs = (60 / updatesPerMinute) * 1000;
        const interval = setInterval(async () => {
            try {
                const newData = await getServerPerformanceData(recordsToDisplay);
                setPerformanceData(newData);
                setError(null);
            } catch (error) {
                console.error('Error fetching performance data:', error);
                setError('Failed to fetch performance data. Please try again later.');
            }
        }, intervalMs);

        return () => clearInterval(interval);
    }, [updatesPerMinute, recordsToDisplay]);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    const formatDate = (timestamp: Date | null) => {
        return timestamp ? new Date(timestamp).toLocaleTimeString() : 'N/A';
    };

    const handleServerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedServer(event.target.value);
    };

    const handleUpdatesPerMinuteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setUpdatesPerMinute(Number(event.target.value));
    };

    const handleRecordsToDisplayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRecordsToDisplay(Number(event.target.value));
    };

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] rounded-lg bg-stone-600 p-4 text-lg font-bold text-stone-950 md:w-4/5">
                <h2 className="mb-4 text-2xl">Server Performance Metrics</h2>

                <div className="mb-4 flex flex-wrap gap-4">
                    <div>
                        <label htmlFor="server-select" className="mr-2">
                            Select Server:
                        </label>
                        <select
                            id="server-select"
                            value={selectedServer}
                            onChange={handleServerChange}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            {servers.map((server) => (
                                <option key={server.id} value={server.id}>
                                    {server.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="updates-per-minute" className="mr-2">
                            Updates per minute:
                        </label>
                        <select
                            id="updates-per-minute"
                            value={updatesPerMinute}
                            onChange={handleUpdatesPerMinuteChange}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            {[12, 6, 3, 1].map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="records-to-display" className="mr-2">
                            Records to display:
                        </label>
                        <select
                            id="records-to-display"
                            value={recordsToDisplay}
                            onChange={handleRecordsToDisplayChange}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            {[50, 100, 250, 500, 1000].map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tickFormatter={formatDate} />
                        <YAxis />
                        <Tooltip labelFormatter={formatDate} />
                        <Legend />
                        <Line type="monotone" dataKey="cpu_usage" name="CPU Usage (%)" stroke="#8884d8" />
                        <Line type="monotone" dataKey="memory_usage" name="Memory Usage (%)" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="disk_usage" name="Disk Usage (%)" stroke="#ffc658" />
                    </LineChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height={400} className="mt-8">
                    <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tickFormatter={formatDate} />
                        <YAxis />
                        <Tooltip labelFormatter={formatDate} />
                        <Legend />
                        <Line type="monotone" dataKey="network_in" name="Network In (MB/s)" stroke="#8884d8" />
                        <Line type="monotone" dataKey="network_out" name="Network Out (MB/s)" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>

                <div className="mt-8 overflow-x-auto">
                    <table className="w-full text-left text-sm text-stone-950">
                        <thead className="bg-stone-400 text-xs uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Timestamp
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    CPU Usage (%)
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Memory Usage (%)
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Disk Usage (%)
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Network In (MB/s)
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Network Out (MB/s)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((data) => (
                                <tr
                                    key={data.id}
                                    className="border-b border-stone-400 bg-stone-950 text-stone-400 hover:bg-stone-400 hover:text-stone-950"
                                >
                                    <td className="px-6 py-4">{formatDate(data.timestamp)}</td>
                                    <td className="px-6 py-4">{data.cpu_usage.toFixed(2)}</td>
                                    <td className="px-6 py-4">{data.memory_usage.toFixed(2)}</td>
                                    <td className="px-6 py-4">{data.disk_usage.toFixed(2)}</td>
                                    <td className="px-6 py-4">{data.network_in.toFixed(2)}</td>
                                    <td className="px-6 py-4">{data.network_out.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
