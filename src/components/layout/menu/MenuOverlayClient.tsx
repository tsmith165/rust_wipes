'use client';

import React from 'react';
import MenuOverlayButton from './MenuOverlayButton';
import dynamic from 'next/dynamic';

const DynamicMenuOverlaySignOutButton = dynamic(() => import('./MenuOverlaySignOutButton'), { ssr: false });

const ADD_SIGN_IN_OUT_BUTTON = false;

interface MenuOverlayClientProps {
    isSignedIn: boolean;
    currentPage: string;
}

export default function MenuOverlayClient({ isSignedIn, currentPage }: MenuOverlayClientProps) {
    if (isSignedIn) {
        return (
            <div key="sign_out_button" className="z-0">
                <DynamicMenuOverlaySignOutButton />
            </div>
        );
    }

    if (ADD_SIGN_IN_OUT_BUTTON) {
        return (
            <div key="sign_in">
                <MenuOverlayButton
                    id={'sign_in'}
                    menu_name={'Sign In'}
                    url_endpoint={'/signin'}
                    isActive={currentPage.includes('/signin')}
                />
            </div>
        );
    }

    return null;
}
