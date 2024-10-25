'use client';

import React from 'react';

interface NumServersSelectProps {
    defaultValue: number;
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    onUpdateSearchParams: (updates: Record<string, string>) => void;
}

const NumServersSelect: React.FC<NumServersSelectProps> = ({ defaultValue, onUpdateSearchParams }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const numServers = e.target.value;
        onUpdateSearchParams({ numServers });
    };

    return (
        <select
            id="num_servers"
            name="numServers"
            className="rounded-md border border-none bg-primary_dark px-2 py-1 text-lg font-bold"
            defaultValue={defaultValue}
            onChange={handleChange}
        >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
        </select>
    );
};

export default NumServersSelect;
