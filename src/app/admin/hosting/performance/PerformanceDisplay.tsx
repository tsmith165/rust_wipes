'use client';

import React from 'react';
import { ServerPerformanceData } from './actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceDisplayProps {
    performanceData: ServerPerformanceData[];
}

export function PerformanceDisplay({ performanceData }: PerformanceDisplayProps) {
    const formatDate = (timestamp: Date) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] rounded-lg bg-stone-600 p-4 text-lg font-bold text-stone-950 md:w-4/5">
                <h2 className="mb-4 text-2xl">Server Performance Metrics</h2>

                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={performanceData.reverse()}>
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
                    <LineChart data={performanceData}>
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
                            {performanceData.map((data) => (
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
