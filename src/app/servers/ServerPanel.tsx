'use client';

import { useState } from 'react';
import { RwServer, NextWipeInfo, MapOptions, MapVotes } from '@/db/schema';
import { MdFileCopy, MdMap, MdInfo } from 'react-icons/md';
import { GiVote } from 'react-icons/gi';
import { Tooltip } from 'react-tooltip';
import { NextWipePanel } from './panels/NextWipePanel';
import { MapDisplayPanel } from './panels/MapDisplayPanel';
import { MapVotingPanel } from './panels/MapVotingPanel';

interface ServerPanelProps {
    server: RwServer;
    copiedState: boolean;
    onCopy: () => void;
    nextWipeInfo: NextWipeInfo | null;
    mapOptions: MapOptions[];
    mapVotes: MapVotes[];
}

export function ServerPanel({ server, copiedState, onCopy, nextWipeInfo, mapOptions, mapVotes }: ServerPanelProps) {
    const [activePanel, setActivePanel] = useState<'nextWipe' | 'mapDisplay' | 'mapVoting'>('nextWipe');

    const renderPanel = () => {
        switch (activePanel) {
            case 'nextWipe':
                return <NextWipePanel server={server} />;
            case 'mapDisplay':
                return <MapDisplayPanel nextWipeInfo={nextWipeInfo} mapOptions={mapOptions} />;
            case 'mapVoting':
                return <MapVotingPanel mapOptions={mapOptions} mapVotes={mapVotes} />;
            default:
                return <NextWipePanel server={server} />;
        }
    };

    const renderButtons = () => {
        const buttonClass = 'absolute top-0 p-4 text-stone-300 hover:bg-primary_light hover:text-stone-950';
        return (
            <>
                {activePanel !== 'nextWipe' && (
                    <button
                        onClick={() => setActivePanel('nextWipe')}
                        className={`${buttonClass} left-0 rounded-br-lg rounded-tl-lg`}
                        data-tooltip-id={`nextWipe-${server.id}`}
                        data-tooltip-content="Server Info"
                    >
                        <MdInfo size={28} />
                        <Tooltip id={`nextWipe-${server.id}`} />
                    </button>
                )}
                {activePanel !== 'mapDisplay' && (
                    <button
                        onClick={() => setActivePanel('mapDisplay')}
                        className={`${buttonClass} ${
                            activePanel === 'nextWipe' ? 'left-0 rounded-br-lg rounded-tl-lg' : 'right-0 rounded-bl-lg rounded-tr-lg'
                        }`}
                        data-tooltip-id={`mapDisplay-${server.id}`}
                        data-tooltip-content="Current Map"
                    >
                        <MdMap size={28} />
                        <Tooltip id={`mapDisplay-${server.id}`} />
                    </button>
                )}
                {activePanel !== 'mapVoting' && (
                    <button
                        onClick={() => setActivePanel('mapVoting')}
                        className={`${buttonClass} right-0 rounded-bl-lg rounded-tr-lg`}
                        data-tooltip-id={`mapVoting-${server.id}`}
                        data-tooltip-content="Map Voting"
                    >
                        <GiVote size={28} />
                        <Tooltip id={`mapVoting-${server.id}`} />
                    </button>
                )}
            </>
        );
    };

    return (
        <div className="radial-gradient-stone-600 relative flex flex-col rounded-lg bg-stone-950 p-4 shadow-md">
            <div className="mb-4 flex w-full items-center justify-center">
                <h2 className="w-fit bg-gradient-to-b from-primary_light to-primary bg-clip-text text-center text-2xl font-semibold text-transparent">
                    {server.short_title || server.name}
                </h2>
            </div>
            {renderButtons()}
            <div className="mb-4 h-fit max-h-[220px] overflow-y-auto">{renderPanel()}</div>
            <div className="flex flex-row items-center justify-between space-x-2">
                <a
                    href={`steam://connect/${server.connection_url}`}
                    className="flex-grow rounded-lg bg-gradient-to-t from-stone-300 to-stone-500 px-2 py-2 text-center font-bold text-stone-950 transition duration-300 hover:bg-gradient-to-b hover:from-primary_light hover:to-primary_dark hover:text-stone-300"
                >
                    Connect to Server
                </a>
                <button
                    onClick={onCopy}
                    className="rounded-lg bg-gradient-to-t from-stone-300 to-stone-500 px-2 py-2 text-lg text-stone-950 transition duration-300 hover:bg-gradient-to-b hover:from-primary_light hover:to-primary_dark hover:text-stone-300"
                    title="Copy connection URL"
                >
                    <MdFileCopy className="h-6 w-6" />
                </button>
            </div>
            {copiedState && <b className="mt-2 text-center text-sm text-green-500">Copied!</b>}
        </div>
    );
}
