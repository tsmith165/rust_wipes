'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { menu_list } from '@/lib/menu_list';

export default function Navbar() {
    const router_pathname = usePathname();
    console.log('NAVBAR ROUTER PATHNAME', router_pathname);

    const generate_navbar = (menu_list) => {
        return menu_list.map((item, i) => {
            let menu_item_string = item[1];
            let url_endpoint = item[3];

            const isActive = url_endpoint === router_pathname;

            return (
                <Link key={i} href={url_endpoint} passHref>
                    <div
                        className={
                            isActive
                                ? 'inline-block rounded-b-lg border-b-2 border-t-0 border-primary bg-secondary px-4 py-1 font-bold text-light md-nav:rounded-b-none md-nav:rounded-t-lg md-nav:border-b-0 md-nav:border-t-2 md-nav:py-3'
                                : 'inline-block rounded-b-lg border-b-2 border-t-0 border-light bg-primary px-4 py-1 font-bold text-grey hover:border-primary hover:bg-secondary hover:text-light md-nav:rounded-b-none md-nav:rounded-t-lg md-nav:border-b-0 md-nav:border-t-2 md-nav:py-3'
                        }
                    >
                        {menu_item_string}
                    </div>
                </Link>
            );
        });
    };

    const tab_menu = generate_navbar(menu_list);
    return (
        <nav className="bg-black p-0">
            <div className="flex flex-col-reverse items-center p-0 md-nav:flex-row md-nav:items-end">
                <div className="flex h-full w-full justify-center md-nav:w-[35%] md-nav:justify-end">
                    <Link href="/" passHref>
                        <div className="flex justify-center md-nav:justify-start">
                            <div className="relative inline-block h-[65px] w-[353px] md-nav:flex md-nav:h-[100px] md-nav:w-auto md-nav:items-end">
                                <Image
                                    src="/rust_wipes_hazmat_logo_no_bg.png"
                                    alt="Rust Logo"
                                    priority={true}
                                    width={544} // Specify the width directly
                                    height={100} // And the height
                                    objectFit="contain" // This keeps the aspect ratio and makes the image scale within the given width and height
                                />
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="flex h-full w-full justify-center md-nav:w-[60%] md-nav:justify-start">{tab_menu}</div>
            </div>
        </nav>
    );
}
