'use client';

import React from 'react';

interface NumServersSelectProps {
    defaultValue: number;
    searchParams?: {
        [key: string]: string | string[] | undefined;
    };
}

const NumServersSelect: React.FC<NumServersSelectProps> = ({ defaultValue, searchParams }) => {
    return (
        <select
            id="num_servers"
            name="numServers"
            className="rounded-md border border-none bg-primary_dark px-2 py-1 text-lg font-bold"
            defaultValue={defaultValue}
            onChange={(e) => onChange(e, searchParams)}
        >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
        </select>
    );
};

const onChange = (e: React.ChangeEvent<HTMLSelectElement>, searchParams?: NumServersSelectProps['searchParams']) => {
    const numServers = parseInt(e.target.value) || 25;
    const page = parseInt((searchParams?.page as string) || '1');
    const minPlayers = parseInt((searchParams?.minPlayers as string) || '2');
    const maxDist = parseInt((searchParams?.maxDist as string) || '5000');
    const minRank = parseInt((searchParams?.minRank as string) || '0');
    const maxRank = parseInt((searchParams?.maxRank as string) || '10000');
    const country = (searchParams?.country as string) || 'US';
    const groupLimit = (searchParams?.groupLimit as string) || 'any';
    const resourceRate = (searchParams?.resourceRate as string) || 'any';

    window.location.href = `/recent?page=${page}&numServers=${numServers}&minPlayers=${minPlayers}&maxDist=${maxDist}&minRank=${minRank}&maxRank=${maxRank}&country=${country}&groupLimit=${groupLimit}&resourceRate=${resourceRate}`;
};

export default NumServersSelect;
