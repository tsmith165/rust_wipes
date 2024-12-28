'use client';

import React, { useEffect, useState } from 'react';
import MachineBackground from '@/components/machine/Machine.Background';
import MachineCharacter from '@/components/machine/Machine.Character';
import MachineGameContainer from '@/components/machine/Machine.Game.Container';
import { WINDOW_SIZE_EXTRA_LARGE_THRESHOLD, WINDOW_SIZE_LARGE_THRESHOLD } from '@/app/gambling/slot/Slot.Constants';

interface MachineContainerProps {
    children: React.ReactNode;
    leftCharacterImage?: string;
    rightCharacterImage?: string;
}

export default function MachineContainer({ children, leftCharacterImage, rightCharacterImage }: MachineContainerProps) {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateWindowSize();
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

    const isLargeScreen = windowSize.width >= WINDOW_SIZE_LARGE_THRESHOLD;
    const isExtraLargeScreen = windowSize.width >= WINDOW_SIZE_EXTRA_LARGE_THRESHOLD;

    return (
        <div className="relative flex h-full w-full flex-col items-center justify-start overflow-x-hidden overflow-y-hidden text-white">
            <MachineBackground />

            {/* Main Game Section */}
            <div className="relative flex h-full w-full flex-col items-center justify-between">
                <div className="relative flex h-full w-full max-w-7xl items-end justify-between px-4">
                    {/* Left Character - Desktop Only */}
                    {leftCharacterImage && isLargeScreen && (
                        <div className="h-full w-1/4">
                            <MachineCharacter imagePath={leftCharacterImage} position="left" />
                        </div>
                    )}

                    {/* Game Container */}
                    <div className={`h-full ${isLargeScreen ? 'w-1/2' : 'w-full'}`}>
                        <MachineGameContainer>{children}</MachineGameContainer>
                    </div>

                    {/* Right Character - Desktop Only */}
                    {rightCharacterImage && isLargeScreen && (
                        <div className="h-full w-1/4">
                            <MachineCharacter imagePath={rightCharacterImage} position="right" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
