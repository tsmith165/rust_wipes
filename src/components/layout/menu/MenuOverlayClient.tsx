'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LogOut, LogIn } from 'lucide-react';

const DynamicMenuOverlaySignOutButton = dynamic(() => import('./MenuOverlaySignOutButton'), { ssr: false });

interface MenuOverlayClientProps {
    isSignedIn: boolean;
    currentPage: string;
}

export default function MenuOverlayClient({ isSignedIn, currentPage }: MenuOverlayClientProps) {
    return (
        <div className="flex flex-col border-t border-stone-700/30 pt-2">
            <div className="mb-1 px-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Account</h3>
            </div>

            <div className="overflow-hidden rounded-lg">
                <DynamicMenuOverlaySignOutButton compact={true} currentPage={currentPage} />
            </div>
        </div>
    );
}
