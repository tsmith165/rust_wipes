'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicMenuOverlaySignOutButton = dynamic(() => import('./MenuOverlaySignOutButton'), { ssr: false });

interface MenuOverlayClientProps {
    isSignedIn: boolean;
    currentPage: string;
}

export default function MenuOverlayClient({ isSignedIn, currentPage }: MenuOverlayClientProps) {
    return (
        <div key="auth_button">
            <DynamicMenuOverlaySignOutButton />
        </div>
    );
}
