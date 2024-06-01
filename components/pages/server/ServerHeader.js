import React from 'react';
import PropTypes from 'prop-types';

export default function ServerHeader({ title }) {
    return (
        <div className="hover:bg-secondary_light flex flex-col justify-between rounded-t-lg bg-secondary p-2.5 font-bold xl:flex-row">
            <h2 className="text-primary_light w-auto truncate text-2xl font-bold">{title}</h2>
        </div>
    );
}

ServerHeader.propTypes = {
    title: PropTypes.string.isRequired,
};
