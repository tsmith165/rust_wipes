// components/NumServersSelect.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';

export default function NumServersSelect({ defaultValue, searchParams }) {
    return (
        <select
            id="num_servers"
            name="numServers"
            className="rounded-md border border-none bg-secondary px-2 py-1 text-lg font-bold"
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
}

const onChange = (e, searchParams) => {
    const numServers = parseInt(e.target.value) || 25;
    const page = parseInt(searchParams.page) || 1;
    const minPlayers = parseInt(searchParams.minPlayers) || 2;
    const maxDist = parseInt(searchParams.maxDist) || 5000;
    const country = searchParams.country || 'NA';
    window.location.href = `/recent?page=${page}&numServers=${numServers}&minPlayers=${minPlayers}&maxDist=${maxDist}&country=${country}`;
};

NumServersSelect.propTypes = {
    defaultValue: PropTypes.number,
    searchParams: PropTypes.object,
};
