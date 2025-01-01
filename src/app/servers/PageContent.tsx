'use client';

import React, { useState } from 'react';
import { RwServer, NextWipeInfo, MapOptions, MapVotes } from '@/db/schema';
import { ServersList } from './ServersList';
import { CalendarContainer } from './calendar/CalendarContainer';

interface ViewSwitcherProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, onViewChange }) => (
    <div className="mb-8 flex space-x-4">
        {['Info', 'Calendar'].map((view) => (
            <button
                key={view}
                onClick={() => onViewChange(view)}
                className={`rounded-lg px-6 py-2 font-semibold transition-all ${
                    activeView === view
                        ? 'bg-gradient-to-b from-primary_light to-primary text-stone-950'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
            >
                {view}
            </button>
        ))}
    </div>
);

interface PageContentProps {
    servers: RwServer[];
    nextWipeInfoMap: Record<string, NextWipeInfo>;
    mapOptions: MapOptions[];
    mapVotes: MapVotes[];
}

export function PageContent({ servers, nextWipeInfoMap, mapOptions, mapVotes }: PageContentProps) {
    const [activeView, setActiveView] = useState('Info');

    return (
        <>
            <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
            <div className="w-full">
                {activeView === 'Info' ? (
                    <ServersList servers={servers} nextWipeInfoMap={nextWipeInfoMap} mapOptions={mapOptions} mapVotes={mapVotes} />
                ) : (
                    <CalendarContainer servers={servers} nextWipeInfoMap={nextWipeInfoMap} />
                )}
            </div>
        </>
    );
}
