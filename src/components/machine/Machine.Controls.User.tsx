'use client';

import React from 'react';
import Image from 'next/image';
import type { MachineControlsUserProps } from './types';

export default function MachineControlsUser({ steamProfile, credits, steamInput }: MachineControlsUserProps) {
    return (
        <div className="flex w-full flex-row justify-between">
            {/* User Info */}
            <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                    <Image
                        src={steamProfile?.avatarUrl || '/steam_icon_small.png'}
                        alt="Steam Avatar"
                        width={32}
                        height={32}
                        className="mr-2 rounded-full"
                    />
                    <span className="text-lg font-bold text-white">{steamProfile?.name || 'Unknown Player'}</span>
                </div>
            </div>

            {/* Credits */}
            <div className="flex items-center">
                <div className="flex items-center">
                    <span className="text-lg font-bold text-white">{credits || 0} Credits</span>
                </div>
            </div>
        </div>
    );
}
