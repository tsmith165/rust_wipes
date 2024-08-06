'use client';

import React, { useState, useEffect } from 'react';
import { ServerPerformanceData } from './actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceDisplayProps {
    performanceData: ServerPerformanceData[];
}

export function PerformanceDisplay({ performanceData }: PerformanceDisplayProps) {
    const [selectedServer, setSelectedServer] = useState<string>('');
    const [filteredData, setFilteredData] = useState<ServerPerformanceData[]>([]);
    const [servers, setServers] = useState<string[]>([]);

    useEffect(() => {
        const uniqueServers = Array.from(new Set(performanceData.map((data) => data.system_id)));
        setServers(uniqueServers);

        if (uniqueServers.length > 0 && !selectedServer) {
            setSelectedServer(uniqueServers[0]);
        }
    }, [performanceData, selectedServer]);

    useEffect(() => {
        const filtered = performanceData.filter((data) => data.system_id === selectedServer);
        setFilteredData(filtered);
    }, [selectedServer, performanceData]);

    const formatDate = (timestamp: Date | null) => {
        return timestamp ? new Date(timestamp).toLocaleTimeString() : 'N/A';
    };

    const handleServerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedServer(event.target.value);
    };

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] rounded-lg bg-stone-600 p-4 text-lg font-bold text-stone-950 md:w-4/5">
                <h2 className="mb-4 text-2xl">Server Performance Metrics</h2>

                <div className="mb-4">
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
                            <option key={server} value={server}>
                                {server}
                            </option>
                        ))}
                    </select>
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
