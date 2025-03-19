'use client';

import React, { useState } from 'react';
import AdminProtect from '@/utils/auth/AdminProtect';

import dynamic from 'next/dynamic';
const DynamicMenuOverlay = dynamic(() => import('../menu/MenuOverlay'), { ssr: false });

interface NavbarClientProps {
    page: string;
}

export default function NavbarClient({ page }: NavbarClientProps) {
    const [showMenu, setShowMenu] = useState(false);

    const menu_overlay = (isAdmin: boolean) => (
        <div
            className="absolute right-0 top-0 h-[50px] w-[50px]"
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
        >
            {showMenu && (
                <div
                    className={`absolute right-0 top-full z-[100] h-fit w-[160px] rounded-bl-lg ${isAdmin ? 'border-primary_dark bg-st_lightest' : 'border-stone-500 bg-stone-500'}`}
                >
                    <DynamicMenuOverlay currentPage={page} isAdmin={isAdmin} />
                </div>
            )}
        </div>
    );

    return <AdminProtect fallback={menu_overlay(false)}>{menu_overlay(true)}</AdminProtect>;
}
