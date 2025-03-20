'use client';

import React from 'react';
import { LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

interface MenuOverlaySignOutButtonProps {
    compact?: boolean;
    currentPage?: string;
}

export default function MenuOverlaySignOutButton({ compact = false, currentPage = '' }: MenuOverlaySignOutButtonProps) {
    const { isSignedIn, signOut } = useAuth();

    // Check if the signin page is active
    const isSignInActive = currentPage === 'signin' || currentPage === '/signin';

    const handleSignOut = () => {
        if (signOut) {
            signOut();
        }
    };

    return (
        <>
            {isSignedIn ? (
                <button
                    onClick={handleSignOut}
                    className={`group flex w-full items-center gap-2 border-b border-stone-700/20 bg-stone-900/70 text-left text-stone-300 transition-all duration-200 hover:bg-stone-800/60 hover:text-primary_light/90 ${
                        compact ? 'px-2 py-1.5' : 'p-3'
                    }`}
                >
                    <div
                        className={`flex items-center justify-center rounded-md bg-stone-800/50 text-stone-400 transition-colors duration-200 group-hover:text-primary_light/80 ${
                            compact ? 'h-7 w-7' : 'h-9 w-9'
                        }`}
                    >
                        <LogOut size={compact ? 14 : 18} className="transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="ml-2 flex flex-col">
                        <span className="text-sm font-medium">Sign Out</span>
                        {!compact && (
                            <span className="mt-0.5 text-xs text-stone-400 group-hover:text-stone-300">Log out of your account</span>
                        )}
                    </div>
                </button>
            ) : (
                <Link
                    href="/signin"
                    className={`group flex w-full items-center gap-2 border-b border-stone-700/20 ${
                        isSignInActive ? 'bg-stone-800/80 text-primary_light' : 'bg-stone-900/70 text-stone-300'
                    } transition-all duration-200 hover:bg-stone-800/60 hover:text-primary_light/90 ${compact ? 'px-2 py-1.5' : 'p-3'}`}
                >
                    <div
                        className={`flex items-center justify-center rounded-md ${
                            isSignInActive ? 'bg-primary_dark/20 text-primary_light' : 'bg-stone-800/50 text-stone-400'
                        } transition-colors duration-200 group-hover:text-primary_light/80 ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}
                    >
                        <LogIn size={compact ? 14 : 18} className="transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="ml-2 flex flex-col">
                        <span className="text-sm font-medium">Sign In</span>
                        {!compact && (
                            <span className="mt-0.5 text-xs text-stone-400 group-hover:text-stone-300">Log in to your account</span>
                        )}
                    </div>
                </Link>
            )}
        </>
    );
}
