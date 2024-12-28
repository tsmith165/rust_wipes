'use client';

import React from 'react';
import MachineControlsUser from '@/components/machine/Machine.Controls.User';
import type { MachineControlsProps, MachineControlsUserProps } from './types';

export default function MachineControls({ children, steamProfile, credits, steamInput }: MachineControlsProps & MachineControlsUserProps) {
    return (
        <div className="flex w-full flex-col space-y-4 p-4">
            <MachineControlsUser steamProfile={steamProfile} credits={credits} steamInput={steamInput} />
            <div className="flex w-full justify-end">{children}</div>
        </div>
    );
}
