'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface NumServersSelectProps {
    defaultValue: number;
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    onUpdateSearchParams: (updates: Record<string, string>) => void;
}

const NumServersSelect: React.FC<NumServersSelectProps> = ({ defaultValue = 10, onUpdateSearchParams }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // No need to prevent default here as we're using router.replace with scroll: false
        const numServers = e.target.value;
        onUpdateSearchParams({ numServers });
    };

    return (
        <div className="relative">
            <select
                id="num_servers"
                name="numServers"
                className="h-6 appearance-none rounded border-none bg-transparent pr-6 font-medium text-st_lightest focus:outline-none focus:ring-1 focus:ring-primary_light"
                defaultValue={defaultValue}
                onChange={handleChange}
            >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                <ChevronDown size={14} className="text-st_light" />
            </div>
        </div>
    );
};

export default NumServersSelect;
