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

    const navbar = menu_list.map(([menu_class_name, menu_full_name, href]) => (
        <div
            key={menu_class_name}
            onClick={() => router.push(href)}
            className={`h-full cursor-pointer bg-clip-text pb-1 font-bold text-transparent ${
                menu_class_name === 'testimonials' || menu_class_name === 'portfolio' ? 'xs:flex hidden' : ''
            } bg-gradient-to-r from-primary via-primary_light to-primary hover:from-primary_light hover:via-primary hover:to-primary_light`}
        >
            {menu_full_name}
        </div>
    ));

    const halfLength = Math.ceil(navbar.length / 2);
    const leftNavbar = navbar.slice(0, halfLength);
    const rightNavbar = navbar.slice(halfLength);

    return (
        <nav className="h-[50px] w-full bg-stone-900 p-0 ">
            <div className="flex w-full flex-row items-center justify-between">
                <div className="mx-4 flex pb-1 md:hidden" onClick={() => router.push('/')}>
                    <Image
                        src="/rust_hazmat_icon.png"
                        alt="CCS Logo"
                        width={186}
                        height={186}
                        className="max-h-[50px] w-fit object-contain pt-2.5"
                    />
                </div>
                <div className="hidden w-fit flex-1 flex-row items-center justify-end space-x-4 md:!flex">{leftNavbar}</div>
                <div className="mx-4 hidden items-center justify-center pb-1 md:!flex" onClick={() => router.push('/')}>
                    <Image
                        src="/rust_hazmat_icon.png"
                        alt="CCS Logo"
                        width={186}
                        height={186}
                        className="max-h-[50px] w-fit object-contain pt-2.5"
                    />
                </div>
                <div className="hidden flex-1 flex-row items-center justify-start space-x-4 md:!flex">{rightNavbar}</div>
                <div className="flex w-full flex-row items-center justify-end space-x-4 pr-4 md:hidden">{navbar}</div>
            </div>
            <Protect fallback={<></>}>
                <AdminProtect fallback={<></>}>
                    <div className="group p-0" onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
                        <IoIosMenu
                            className={`absolute right-0 top-0 h-[50px] w-[50px] fill-primary_dark py-[5px] pr-2 group-hover:fill-primary`}
                        />
                        {showMenu && (
                            <div className="absolute right-0 top-[50px] z-50 h-fit w-[160px] rounded-bl-md border-b-2 border-l-2 border-primary_dark bg-secondary_light">
                                <DynamicMenuOverlay currentPage={page} isAdmin={true} />
                            </div>
                        )}
                    </div>
                </AdminProtect>
            </Protect>
        </nav>
    );
}
