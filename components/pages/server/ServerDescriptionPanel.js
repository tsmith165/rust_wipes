// /components/pages/server/ServerDescriptionPanel.js
'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiChevronDown } from 'react-icons/fi';

const ServerDescriptionPanel = ({ description }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="mt-2.5 rounded-lg bg-dark">
            <button className={`flex w-full items-center justify-between p-2.5 text-xl font-bold text-light`} onClick={toggleCollapse}>
                Description
                <FiChevronDown className={`${isCollapsed ? 'rotate-90' : ''}`} />
            </button>
            {!isCollapsed && (
                <div className="w-full rounded-b-lg bg-grey pb-2.5">
                    <pre className="overflow-auto whitespace-pre-wrap p-2.5 text-lg">{description}</pre>
                </div>
            )}
        </div>
    );
};

ServerDescriptionPanel.propTypes = {
    description: PropTypes.string.isRequired,
};

export default ServerDescriptionPanel;
