'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ParsedServer } from '@/db/schema';
interface ServerInfoPanelProps {
    bm_api_attributes: {
        players: number;
        maxPlayers: number;
        name: string;
        ip: string;
        port: number;
        details?: {
            rust_maps?: {
                thumbnailUrl?: string;
                [key: string]: unknown;
            };
            rust_description?: string;
            rust_last_wipe?: string;
        };
        rank?: number;
    };
    database_data: ParsedServer[];
    ip: string;
    port: number;
    players: number;
    maxPlayers: number;
}

const region_dict: { [key: string]: string } = {
    NA: 'North America',
    EU: 'Europe',
};

export default function ServerInfoPanel({ bm_api_attributes, database_data, ip, port, players, maxPlayers }: ServerInfoPanelProps) {
    const [copySuccess, setCopySuccess] = useState(false);
    const [hover, setHover] = useState(false);

    const server_info_data = useMemo(() => {
        const { details, rank } = bm_api_attributes;
        const { rust_last_wipe } = details || {};
        const serverData = database_data[0];
        const resource_rate = serverData?.resource_rate || '';
        const group_limit = serverData?.group_limit || '';
        const region = serverData?.region || '';

        const last_wipe_date = rust_last_wipe ? new Date(rust_last_wipe) : new Date();
        const seconds_since_last_wipe = Math.floor((new Date().getTime() - last_wipe_date.getTime()) / 1000);

        return [
            { title: 'Players', value: `${players}/${maxPlayers}` },
            { title: 'Rank', value: rank },
            {
                title: 'Region',
                value: region in region_dict ? region_dict[region] : region,
            },
            { title: 'Group Limit', value: group_limit },
            { title: 'Resource Rate', value: resource_rate },
            {
                title: 'Last Wipe Time',
                value: last_wipe_date.toLocaleString('en-US', {
                    timeZone: 'UTC',
                }),
            },
            {
                title: 'Seconds Since Wipe',
                value: seconds_since_last_wipe.toString(),
            },
        ];
    }, [bm_api_attributes, database_data, players, maxPlayers]);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard
            .writeText(`client.connect ${ip}:${port}`)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch((err) => console.error('Could not copy text: ', err));
    }, [ip, port]);

    return (
        <div className="flex flex-col">
            <div
                className="relative flex min-w-[124px] space-x-3 rounded-lg xl:flex-col xl:space-x-0"
                onClick={copyToClipboard}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{ cursor: 'pointer' }}
            >
                <div className="m-0 flex flex-row space-x-1.5 p-0" key={'ip'}>
                    <b className="text-primary_light">{`IP: `}</b>
                    <p className="hover:text-bold text-st_lightest hover:font-bold hover:text-primary_light">{`${ip}:${port}`}</p>
                    {copySuccess && <div className="rounded bg-green-400 px-3 py-0 font-bold text-st_darkest">Copy Success!</div>}
                    {hover && !copySuccess && <div className="rounded bg-green-600 px-3 py-0 text-st_darkest">Click to copy server IP</div>}
                </div>
            </div>
            {server_info_data.map(({ title, value }) => (
                <div className="m-0 flex flex-row space-x-1.5 p-0" key={title}>
                    <b className="text-primary_light">{`${title}: `}</b>
                    <p className="text-st_lightest hover:font-bold hover:text-primary_light">{value}</p>
                </div>
            ))}
        </div>
    );
}
