'use client';

import React from 'react';
import Image from 'next/image';
import { FaCoins, FaPlay, FaPause, FaInfoCircle, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { useSlotGame } from '@/stores/slot_game_store';
import { cn } from '@/lib/utils';

export interface SlotControlsProps {
    onSpin: () => void;
    onToggleMute: () => void;
    onToggleAutoSpin: () => void;
    isMuted: boolean;
    isAutoSpinning: boolean;
    credits: number | null;
    freeSpins: number;
    isLoading: boolean;
    steamProfile?: {
        name: string;
        avatarUrl: string;
        steamId: string;
    };
}

export function SlotControls({
    onSpin,
    onToggleMute,
    onToggleAutoSpin,
    isMuted,
    isAutoSpinning,
    credits,
    freeSpins,
    isLoading,
    steamProfile,
}: SlotControlsProps) {
    const {
        possibleLines: { isVisible: isPossibleLinesVisible },
        setPossibleLinesVisibility,
        setWinningLinesVisibility,
        setWinningCells,
        setBonusCells,
    } = useSlotGame();

    const handleShowPossibleLines = () => {
        // Stop all current animations and sounds
        setWinningLinesVisibility(false);
        setWinningCells([]);
        setBonusCells([]);

        // Toggle possible lines visibility
        setPossibleLinesVisibility(!isPossibleLinesVisible);
    };

    return (
        <div className="flex w-full flex-row items-start justify-between sm:items-center">
            {/* User info and credits */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <div className="flex" data-tooltip-id="steam-id-tooltip">
                    <Image
                        src={steamProfile?.avatarUrl || '/steam_icon_small.png'}
                        alt="Steam Avatar"
                        width={40}
                        height={40}
                        className="mr-2 rounded-full"
                    />
                    <span className="text-xl font-bold">{steamProfile?.name || 'Unknown Player'}</span>
                </div>
                <div className="flex space-x-2" data-tooltip-id="credits-tooltip">
                    <FaCoins className="h-10 w-10 text-primary_light" />
                    <span className="text-xl font-bold text-white">{credits || '0'}</span>
                </div>
                <Tooltip id="credits-tooltip" className="z-[100]">
                    Credits
                </Tooltip>
                <Tooltip id="steam-id-tooltip" className="z-[100]">
                    Steam ID: {steamProfile?.steamId}
                </Tooltip>
            </div>

            {/* Control buttons */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <div className="flex flex-row space-x-2">
                    {/* Spin Button */}
                    <button
                        data-tooltip-id="spin-tooltip"
                        data-tooltip-place="top"
                        data-tooltip-offset={6}
                        onClick={onSpin}
                        disabled={isLoading || (credits !== null && credits < 5 && freeSpins === 0)}
                        className="rounded-lg bg-primary_light p-3 text-stone-800 hover:bg-primary hover:text-stone-300 disabled:bg-gray-400"
                    >
                        {freeSpins > 0 ? (
                            <div className="flex h-6 w-6 items-center justify-center">
                                <b className="text-2xl">{freeSpins}</b>
                            </div>
                        ) : (
                            <FaCoins className="h-6 w-6" />
                        )}
                    </button>
                    <Tooltip id="spin-tooltip" className="z-[100]">
                        {isLoading ? 'Spinning...' : freeSpins > 0 ? `${freeSpins} Free Spins Remaining` : `Spin (5 credits)`}
                    </Tooltip>

                    {/* Auto Spin Button */}
                    <button
                        data-tooltip-id="auto-spin-tooltip"
                        data-tooltip-place="top"
                        data-tooltip-offset={6}
                        onClick={onToggleAutoSpin}
                        disabled={credits !== null && credits < 5 && freeSpins === 0}
                        className="rounded-lg bg-primary_light p-3 text-stone-800 hover:bg-primary hover:text-stone-300 disabled:bg-gray-400"
                    >
                        {isAutoSpinning ? <FaPause className="h-6 w-6" /> : <FaPlay className="h-6 w-6" />}
                    </button>
                    <Tooltip id="auto-spin-tooltip" className="z-[100]">
                        {isAutoSpinning ? 'Stop Auto Spins' : 'Start Auto Spins'}
                    </Tooltip>
                </div>
                <div className="flex flex-row space-x-2">
                    {/* Show Possible Lines Button */}
                    <button
                        data-tooltip-id="show-lines-tooltip"
                        data-tooltip-place="top"
                        data-tooltip-offset={6}
                        onClick={handleShowPossibleLines}
                        className={cn(
                            'rounded-lg p-3 text-primary transition-colors',
                            isPossibleLinesVisible
                                ? 'bg-stone-800 text-primary_light'
                                : 'bg-stone-300 hover:bg-stone-800 hover:text-primary_light',
                        )}
                    >
                        <FaInfoCircle className="h-6 w-6" />
                    </button>
                    <Tooltip id="show-lines-tooltip" className="z-[100]">
                        {isPossibleLinesVisible ? 'Hide Possible Lines' : 'Show Possible Lines'}
                    </Tooltip>

                    {/* Sound Toggle Button */}
                    <button
                        data-tooltip-id="sound-tooltip"
                        data-tooltip-place="top"
                        data-tooltip-offset={6}
                        onClick={onToggleMute}
                        className="rounded-lg bg-stone-300 p-3 text-primary hover:bg-stone-800 hover:text-primary_light"
                    >
                        {isMuted ? <FaVolumeMute className="h-6 w-6" /> : <FaVolumeUp className="h-6 w-6" />}
                    </button>
                    <Tooltip id="sound-tooltip" className="z-[100]">
                        {isMuted ? 'Unmute' : 'Mute'}
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
