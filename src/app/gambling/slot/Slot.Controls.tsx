'use client';

import React from 'react';
import { FaVolumeMute, FaPlay, FaPause, FaInfoCircle, FaCoins } from 'react-icons/fa';
import { FaVolumeHigh } from 'react-icons/fa6';
import { Tooltip } from 'react-tooltip';
import { useMachineStore } from '@/stores/machine_store';
import { useSteamUser } from '@/stores/steam_user_store';
import { MachineControls } from '@/components/machine';
import type { SlotControlsProps } from './types';

export default function SlotControls({ onSpin, onShowLines }: SlotControlsProps) {
    const { spinning, autoSpin, isMuted, freeSpins, setAutoSpin, setIsMuted } = useMachineStore();
    const { isVerified, credits, profile: steamProfile, steamInput } = useSteamUser();

    const handleAutoSpinButton = () => {
        setAutoSpin(!autoSpin);
    };

    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
    };

    return (
        <MachineControls steamProfile={steamProfile} credits={credits} steamInput={steamInput}>
            <div className="flex space-x-2">
                {/* Spin Button */}
                <button
                    data-tooltip-id="spin-tooltip"
                    data-tooltip-place="top"
                    data-tooltip-offset={6}
                    onClick={onSpin}
                    disabled={!isVerified || spinning || (credits !== null && credits < 5 && freeSpins === 0)}
                    className="rounded-lg bg-primary_light p-4 text-stone-800 hover:bg-primary hover:text-stone-300 disabled:bg-gray-400"
                >
                    {freeSpins > 0 ? (
                        <div className="flex h-6 w-6 items-center justify-center">
                            <b className="text-xl">{freeSpins}</b>
                        </div>
                    ) : (
                        <FaCoins className="h-6 w-6" />
                    )}
                </button>
                <Tooltip id="spin-tooltip">
                    {spinning ? 'Spinning...' : freeSpins > 0 ? `${freeSpins} Free Spins Remaining` : `Spin (5 credits)`}
                </Tooltip>

                {/* Auto Spin Button */}
                <button
                    data-tooltip-id="auto-spin-tooltip"
                    data-tooltip-place="top"
                    data-tooltip-offset={6}
                    onClick={handleAutoSpinButton}
                    disabled={!isVerified || (credits !== null && credits < 5 && freeSpins === 0)}
                    className="rounded-lg bg-primary_light p-4 text-stone-800 hover:bg-primary hover:text-stone-300 disabled:bg-gray-400"
                >
                    {autoSpin ? <FaPause className="h-6 w-6" /> : <FaPlay className="h-6 w-6" />}
                </button>
                <Tooltip id="auto-spin-tooltip">{autoSpin ? 'Stop Auto Spins' : 'Start Auto Spins'}</Tooltip>

                {/* Show Lines Button */}
                <button
                    data-tooltip-id="show-lines-tooltip"
                    data-tooltip-place="top"
                    data-tooltip-offset={6}
                    onClick={onShowLines}
                    className="rounded-lg bg-stone-300 p-4 text-primary hover:bg-stone-800 hover:text-primary_light"
                >
                    <FaInfoCircle className="h-6 w-6" />
                </button>
                <Tooltip id="show-lines-tooltip">Show Winning Lines</Tooltip>

                {/* Sound Toggle Button */}
                <button
                    data-tooltip-id="sound-tooltip"
                    data-tooltip-place="top"
                    data-tooltip-offset={6}
                    onClick={handleMuteToggle}
                    className="rounded-lg bg-stone-300 p-4 text-primary hover:bg-stone-800 hover:text-primary_light"
                >
                    {isMuted ? <FaVolumeMute className="h-6 w-6" /> : <FaVolumeHigh className="h-6 w-6" />}
                </button>
                <Tooltip id="sound-tooltip">{isMuted ? 'Turn Sound On' : 'Turn Sound Off'}</Tooltip>
            </div>
        </MachineControls>
    );
}
