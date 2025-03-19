'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaCoins, FaPlay, FaPause, FaInfoCircle, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { useSlotGame } from '@/stores/Store.Games.RustySlots';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface BaseGameControlsProps {
    onSpin: () => void;
    onToggleMute: () => void;
    onToggleAutoSpin: () => void;
    onVolumeChange: (volume: number) => void;
    isMuted: boolean;
    volume: number;
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

export function BaseGameControls({
    onSpin,
    onToggleMute,
    onToggleAutoSpin,
    onVolumeChange,
    isMuted,
    volume,
    isAutoSpinning,
    credits,
    freeSpins,
    isLoading,
    steamProfile,
}: BaseGameControlsProps) {
    const {
        possibleLines: { isVisible: isPossibleLinesVisible },
        setPossibleLinesVisibility,
        setWinningLinesVisibility,
        setWinningCells,
        setBonusCells,
    } = useSlotGame();

    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

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
                    <span className="text-xl font-bold text-st_white">{credits || '0'}</span>
                </div>
                <Tooltip id="credits-tooltip" className="z-[200]" place="top" offset={8} classNameArrow="!left-[calc(50%-14px)]">
                    Credits
                </Tooltip>
                <Tooltip id="steam-id-tooltip" className="z-[200]" place="top" offset={8} classNameArrow="!left-[calc(50%-14px)]">
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
                        data-tooltip-offset={8}
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
                    <Tooltip id="spin-tooltip" className="z-[200]" place="top" offset={8} classNameArrow="!left-[calc(50%-14px)]">
                        {isLoading ? 'Spinning...' : freeSpins > 0 ? `${freeSpins} Free Spins Remaining` : `Spin (5 credits)`}
                    </Tooltip>

                    {/* Auto Spin Button */}
                    <button
                        data-tooltip-id="auto-spin-tooltip"
                        data-tooltip-place="top"
                        data-tooltip-offset={8}
                        onClick={onToggleAutoSpin}
                        disabled={credits !== null && credits < 5 && freeSpins === 0}
                        className="rounded-lg bg-primary_light p-3 text-stone-800 hover:bg-primary hover:text-stone-300 disabled:bg-gray-400"
                    >
                        {isAutoSpinning ? <FaPause className="h-6 w-6" /> : <FaPlay className="h-6 w-6" />}
                    </button>
                    <Tooltip id="auto-spin-tooltip" className="z-[200]" place="top" offset={8} classNameArrow="!md:left-[calc(50%-14px)]">
                        {isAutoSpinning ? 'Stop Auto Spins' : 'Start Auto Spins'}
                    </Tooltip>
                </div>
                <div className="flex flex-row space-x-2">
                    {/* Show Possible Lines Button */}
                    <button
                        data-tooltip-id="show-lines-tooltip"
                        data-tooltip-place="top"
                        data-tooltip-offset={8}
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
                    <Tooltip id="show-lines-tooltip" className="z-[200]" place="top" offset={8} classNameArrow="!left-[calc(50%-14px)]">
                        {isPossibleLinesVisible ? 'Hide Possible Lines' : 'Show Possible Lines'}
                    </Tooltip>

                    {/* Sound Control with Volume Slider */}
                    <div className="relative">
                        <button
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            onMouseLeave={() => setShowVolumeSlider(false)}
                            onClick={onToggleMute}
                            className="rounded-lg bg-stone-300 p-3 text-primary hover:bg-stone-800 hover:text-primary_light"
                        >
                            {isMuted ? <FaVolumeMute className="h-6 w-6" /> : <FaVolumeUp className="h-6 w-6" />}
                        </button>

                        <AnimatePresence>
                            {showVolumeSlider && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full left-[calc(50%-16px)] z-[200] mb-2 -translate-x-1/2 transform"
                                    onMouseEnter={() => setShowVolumeSlider(true)}
                                    onMouseLeave={() => setShowVolumeSlider(false)}
                                >
                                    <div className="flex h-32 w-8 flex-col items-center justify-center rounded-lg bg-stone-800 p-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={volume * 100}
                                            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                                            className="h-24 w-24 -rotate-90 appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-stone-600 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary_light"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
