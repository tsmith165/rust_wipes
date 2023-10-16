import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const formatDate = (timestamp) => {
            const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
            return new Date(timestamp).toLocaleDateString(undefined, dateOptions);
        };
        const formatTime = (timestamp) => {
            return new Date(timestamp).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
            });
        };

        return (
            <div className="custom-tooltip bg-white p-3 border rounded-md shadow-md">
                <p className="label">{formatDate(label)}</p>
                <p className="intro">{formatTime(label)}</p>
                <p className="desc">
                    <span className="dot" style={{ color: '#8884d8' }}>
                        &#x25CF;{' '}
                    </span>
                    Max: {payload[0].payload.max}
                </p>
                <p className="desc">
                    <span className="dot" style={{ color: '#82ca9d' }}>
                        &#x25CF;{' '}
                    </span>
                    Value: {payload[0].payload.value}
                </p>
                <p className="desc">
                    <span className="dot" style={{ color: '#ff7300' }}>
                        &#x25CF;{' '}
                    </span>
                    Min: {payload[0].payload.min}
                </p>
            </div>
        );
    }

    return null;
};

const PlayerCountPanel = ({ player_count_data }) => {
    console.log('player_count_data: ', player_count_data);

    const formatted_data =
        player_count_data?.data?.map((item) => ({
            timestamp: item.attributes?.timestamp,
            max: item.attributes?.max,
            value: item.attributes?.value,
            min: item.attributes?.min,
        })) || [];

    const formatDate = (timestamp) => {
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(timestamp).toLocaleDateString(undefined, dateOptions);
    };

    const xAxisInterval = Math.floor(formatted_data.length / 3) - 1;

    return (
        <div className="w-full h-full bg-medium rounded-lg p-2.5 overflow-hidden">
            <ResponsiveContainer className="w-full h-full">
                <LineChart
                    data={formatted_data}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={(timestamp) => formatDate(timestamp)}
                        interval={xAxisInterval}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="max" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="min" stroke="#ff7300" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PlayerCountPanel;
