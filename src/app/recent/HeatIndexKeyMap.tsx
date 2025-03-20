'use client';

import React from 'react';

const HeatIndexKeyMap: React.FC = () => {
    const heatIndexItems = [
        { color: 'bg-hot_wipe', time: 'Wiped < 5mins ago' },
        { color: 'bg-cool_wipe', time: 'Wiped < 15mins ago' },
        { color: 'bg-cold_wipe', time: 'Wiped < 60mins ago' },
        { color: 'hidden', time: 'Wiped > 60mins ago (no indicator)' },
    ];

    return (
        <div className="w-full pt-0">
            <div className="md:text-md flex flex-col gap-2 text-sm">
                {heatIndexItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                        <span className="text-st_lightest">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeatIndexKeyMap;
