'use client';

import React, { useEffect, useCallback, useTransition, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { menu_list } from '@/lib/menu_list';
import { IoIosMenu } from 'react-icons/io';
import { Protect } from '@clerk/nextjs';
import AdminProtect from '@/utils/auth/AdminProtect';

import dynamic from 'next/dynamic';
const DynamicMenuOverlay = dynamic(() => import('./menu/MenuOverlay'), { ssr: false });

export default function Navbar({ page }: { page: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [showMenu, setShowMenu] = useState(false);

    const navbar = menu_list.map(([menu_class_name, menu_full_name, href]) => {
        return (
            <div
                key={menu_class_name}
                onClick={() => router.push(href)}
                className={`h-full cursor-pointer items-center justify-center font-bold ${menu_class_name === 'upcoming' ? 'hidden md:!flex' : 'flex'} ${page.includes(menu_class_name) ? 'radial-gradient-primary bg-primary bg-clip-text text-transparent' : 'radial-gradient-primary bg-stone-300 bg-clip-text text-transparent hover:bg-primary_dark'}`}
            >
                {menu_full_name}
            </div>
        );
    });

    const halfLength = Math.ceil(navbar.length / 2);
    const leftNavbar = navbar.slice(0, halfLength);
    const rightNavbar = navbar.slice(halfLength);

    return (
        <nav className="h-[50px] w-full bg-stone-900 p-0 ">
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
                    <div className="flex w-full flex-row items-center justify-center space-x-2 md:hidden">{navbar}</div>
                    <Protect fallback={<></>}>
                        <AdminProtect fallback={<></>}>
                            <div className="group relative" onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
                                <IoIosMenu className="h-[50px] w-[50px] fill-primary_dark py-[5px] group-hover:fill-primary" />
                                {showMenu && (
                                    <div className="absolute right-0 top-full z-50 h-fit w-[160px] rounded-bl-md border-b-2 border-l-2 border-primary_dark bg-secondary_light">
                                        <DynamicMenuOverlay currentPage={page} isAdmin={true} />
                                    </div>
                                )}
                            </div>
                        </AdminProtect>
                    </Protect>
                </div>
            </div>
        </nav>
    );
}
