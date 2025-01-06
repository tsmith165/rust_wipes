'use client';

import React, { memo, useCallback } from 'react';
import { useClerk, useSession } from '@clerk/nextjs';
import Link from 'next/link';

const MenuOverlaySignOutButton: React.FC = memo(() => {
    const { signOut } = useClerk();
    const { isLoaded, isSignedIn } = useSession();

    const handleSignOut = useCallback(() => {
        signOut();
    }, [signOut]);

    if (!isLoaded) return null;

    const commonClasses =
        'relative z-50 flex h-[40px] items-center justify-center rounded-bl-xl border-b-0 border-stone-500 bg-stone-300 px-[5px] font-bold text-stone-800 hover:bg-primary hover:text-stone-300';

    if (isSignedIn) {
        return (
            <div className={commonClasses} id="sign_out_button" onClick={handleSignOut}>
                Sign Out
            </div>
        );
    }

    return (
        <Link href="/signin" className={commonClasses} id="sign_in_button">
            Sign In
        </Link>
    );
});

MenuOverlaySignOutButton.displayName = 'MenuOverlaySignOutButton';

export default MenuOverlaySignOutButton;
