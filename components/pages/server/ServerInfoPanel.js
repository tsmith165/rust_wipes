'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const region_dict = {
    NA: 'North America',
    EU: 'Europe',
};

export default function ServerInfoPanel({ bm_api_attributes, database_data, ip, port, players, maxPlayers }) {
    const [copySuccess, setCopySuccess] = useState(false);
    const [hover, setHover] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard
            .writeText(`client.connect ${ip}:${port}`)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000); // hide tooltip after 2 seconds
            })
            .catch((err) => console.error('Could not copy text: ', err));
    };

    if (!bm_api_attributes || !database_data) return <p>Error loading server data.</p>;

    console.log('BM API Attributes: ', bm_api_attributes);
    console.log('Database Data: ', database_data);

    const { details, rank } = bm_api_attributes;
    const { rust_last_wipe } = details || {};
    const { resource_rate, group_limit, region } = database_data;

    // Validate and log the date string
    console.log(`Rust Last Wipe (string): ${rust_last_wipe}`);
    if (!rust_last_wipe) {
        console.error('Rust Last Wipe is null or undefined!');
    }

    // Parse the date string
    const last_wipe_date = new Date(rust_last_wipe);

    // Log the parsed date
    console.log(`Rust Last Wipe (date): ${last_wipe_date}`);

    // Validate the parsed date
    if (isNaN(last_wipe_date)) {
        console.error('Invalid Date Object created!');
    }

    const now = new Date();
    const seconds_since_last_wipe = Math.floor((now - last_wipe_date) / 1000);

    console.log(`Last Wipe Date: ${last_wipe_date} | Seconds Since Last Wipe: ${seconds_since_last_wipe}`);

    const server_info_data = [
        { title: 'Players', value: `${players}/${maxPlayers}` },
        { title: 'Rank', value: rank },
        {
            title: 'Region',
            value: region in region_dict ? region_dict[region] : region,
        },
        { title: 'Group Limit', value: group_limit },
        { title: 'Resource Rate', value: resource_rate },
        { title: 'Last Wipe Time', value: last_wipe_date.toLocaleString() }, // Already a date object
        { title: 'Seconds Since Wipe', value: seconds_since_last_wipe },
    ];

    return (
        <div className="flex flex-col rounded-b-lg bg-grey p-2.5">
            <div
                className="relative flex min-w-[124px] space-x-3 rounded-lg xl:flex-col xl:space-x-0"
                onClick={copyToClipboard}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{ cursor: 'pointer' }}
            >
                <div className=" m-0 flex flex-row space-x-1.5 p-0" key={'ip'}>
                    <b className="text-primary">{`IP: `}</b>
                    <p className="hover:text-bold text-dark hover:font-bold hover:text-light">{`${ip}:${port}`}</p>
                    {copySuccess && <div className="rounded bg-green-400 px-3 py-0 font-bold text-black">Copy Success!</div>}
                    {hover && !copySuccess && <div className="rounded bg-green-600 px-3 py-0 text-black">Click to copy server IP</div>}
                </div>
            </div>
            {server_info_data.map(({ title, value }) => (
                <div className="m-0 flex flex-row space-x-1.5 p-0" key={title}>
                    <b className="text-primary">{`${title}: `}</b>
                    <p className="text-dark hover:font-bold hover:text-light">{value}</p>
                </div>
            ))}
        </div>
    );
}

ServerInfoPanel.propTypes = {
    bm_api_attributes: PropTypes.object.isRequired,
    database_data: PropTypes.object.isRequired,
    ip: PropTypes.string.isRequired,
    port: PropTypes.number.isRequired,
    players: PropTypes.number.isRequired,
    maxPlayers: PropTypes.number.isRequired,
};
