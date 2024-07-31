'use client';

import React, { useEffect, useCallback, useTransition, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { menu_list } from '@/lib/menu_list';
import { IoIosMenu } from 'react-icons/io';
import { FaDiscord } from 'react-icons/fa';
import { Protect } from '@clerk/nextjs';
import AdminProtect from '@/utils/auth/AdminProtect';

import PROJECT_CONSTANTS from '@/lib/constants';

import dynamic from 'next/dynamic';
const DynamicMenuOverlay = dynamic(() => import('./menu/MenuOverlay'), { ssr: false });

export default function Navbar({ page }: { page: string }) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);

    const discord_component = (
        <Link href={PROJECT_CONSTANTS.CONTACT_DISCORD}>
            <div className="group absolute right-[0px] top-0">
                <FaDiscord className="h-[50px] w-[50px] fill-[#5865F2] p-3 group-hover:brightness-125" />
            </div>
        </Link>
    );
    const discord_component_admin = (
        <Link href={PROJECT_CONSTANTS.CONTACT_DISCORD}>
            <div className="group absolute right-[50px] top-0">
                <FaDiscord className="h-[50px] w-[50px] fill-[#5865F2] py-3 pl-3 group-hover:brightness-125" />
            </div>
        </Link>
    );

    const navbar = menu_list.map(([menu_class_name, menu_full_name, href]) => {
        if (page.includes('checkout')) {
            page = 'kits';
        }
        return (
            <div
                key={menu_class_name}
                onClick={() => router.push(href)}
                className={`h-full cursor-pointer items-center justify-center font-bold ${menu_class_name === 'upcoming' ? 'hidden md:!flex' : 'flex'} ${page.includes(menu_class_name) ? 'radial-gradient-stone-300 bg-primary bg-clip-text text-transparent' : 'radial-gradient-stone-300 bg-stone-600 bg-clip-text text-transparent hover:!bg-primary'}`}
            >
                {menu_full_name}
            </div>
        );
    });

    const halfLength = Math.ceil(navbar.length / 2);
    const leftNavbar = navbar.slice(0, halfLength);
    const rightNavbar = navbar.slice(halfLength);

    return (
        <nav className="h-[50px] w-full bg-stone-900 p-0">
            <div className="flex w-full flex-row items-center justify-between">
                <div className="flex pl-2 md:hidden" onClick={() => router.push('/')}>
                    <Image
                        src="/rust_hazmat_icon.png"
                        alt="CCS Logo"
                        width={186}
                        height={186}
                        className="max-h-[50px] w-fit object-contain pt-2.5"
                    />
                </div>
                <div className="hidden w-fit flex-1 flex-row items-center justify-end space-x-4 md:!flex">{leftNavbar}</div>
                <div className="hidden items-center justify-center pl-2 md:!flex" onClick={() => router.push('/')}>
                    <Image
                        src="/rust_hazmat_icon.png"
                        alt="CCS Logo"
                        width={186}
                        height={186}
                        className="max-h-[50px] w-fit object-contain pt-2.5"
                    />
                </div>
                <div className="hidden flex-1 flex-row items-center justify-start space-x-4 pl-2 md:!flex">{rightNavbar}</div>
                <div className="flex h-full flex-row justify-end space-x-2">
                    <Protect
                        fallback={
                            <div className="flex w-full flex-row items-center justify-center space-x-2 pr-[50px] md:hidden">{navbar}</div>
                        }
                    >
                        <div className="flex w-full flex-row items-center justify-center space-x-2 pr-[50px] md:hidden">{navbar}</div>
                    </Protect>
                </div>
            </div>
            <Protect fallback={discord_component}>
                <AdminProtect fallback={discord_component}>
                    <div
                        className="group absolute right-0 top-0"
                        onMouseEnter={() => setShowMenu(true)}
                        onMouseLeave={() => setShowMenu(false)}
                    >
                        <IoIosMenu className="h-[50px] w-[50px] fill-primary_dark py-[5px] group-hover:fill-primary" />
                        {showMenu && (
                            <div className="absolute right-0 top-full z-50 h-fit w-[160px] rounded-bl-md border-b-2 border-l-2 border-primary_dark bg-secondary_light">
                                <DynamicMenuOverlay currentPage={page} isAdmin={true} />
                            </div>
                        )}
                    </div>
                </AdminProtect>
            </Protect>
        </nav>
    );
}
