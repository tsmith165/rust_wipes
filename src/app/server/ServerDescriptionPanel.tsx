'use client';

import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface ServerDescriptionPanelProps {
    description: string;
}

const ServerDescriptionPanel: React.FC<ServerDescriptionPanelProps> = ({ description }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="mt-2.5 rounded-lg">
            <button
                className={`flex w-full items-center justify-between rounded-t-lg bg-stone-800 p-2.5 text-xl font-bold text-primary_light`}
                onClick={toggleCollapse}
            >
                Description
                <FiChevronDown className={`${isCollapsed ? 'rotate-90' : ''}`} />
            </button>
            {!isCollapsed && (
                <div className="w-full rounded-b-lg bg-stone-800 bg-opacity-30 pb-2.5">
                    <pre className="overflow-auto whitespace-pre-wrap p-2.5 text-lg text-stone-400">{description}</pre>
                </div>
            )}{' '}
        </div>
    );
};

export default ServerDescriptionPanel;
