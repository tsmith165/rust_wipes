import React from 'react';
import PropTypes from 'prop-types';

export default function ServerHeader({ name }) {
    return (
        <div className="flex flex-col justify-between rounded-t-lg bg-dark p-2.5 font-bold hover:bg-grey xl:flex-row">
            <h2 className="w-auto truncate text-2xl font-bold text-light">{name}</h2>
        </div>
    );
}

ServerHeader.propTypes = {
    name: PropTypes.string.isRequired,
};
