// components/NumServersSelect.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';

export default function NumServersSelect({ defaultValue, searchParams }) {
    return (
        <select
            id="num_servers"
            className="rounded-md border border-none bg-secondary px-2 py-2.5"
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
    const num_servers = e.target.value;
    window.location.href = `/recent?page=${searchParams.page}&num_servers=${num_servers}`;
};

NumServersSelect.propTypes = {
    defaultValue: PropTypes.number,
    searchParams: PropTypes.object,
};
