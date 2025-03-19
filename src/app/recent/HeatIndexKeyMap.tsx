'use client';

import React from 'react';

const HeatIndexKeyMap: React.FC = () => {
    const heatIndexItems = [
        { color: 'bg-green-700', time: '< 5mins' },
        { color: 'bg-blue-700', time: '< 15mins' },
        { color: 'bg-purple-700', time: '< 60mins' },
    ];

    return (
        <div className="w-full p-2 pt-0">
            <div className="md:text-md flex flex-row items-center justify-center space-x-4 text-sm">
                {heatIndexItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                        <span className="text-st_white">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeatIndexKeyMap;
