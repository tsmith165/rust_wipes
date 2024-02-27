import React from 'react';
import PropTypes from 'prop-types';

export default function ServerHeader({ title }) {
    return (
        <div className="flex flex-col justify-between rounded-t-lg bg-dark p-2.5 font-bold hover:bg-grey xl:flex-row">
            <h2 className="w-auto truncate text-2xl font-bold text-light">{title}</h2>
        </div>
    );
}

ServerHeader.propTypes = {
    title: PropTypes.string.isRequired,
};
