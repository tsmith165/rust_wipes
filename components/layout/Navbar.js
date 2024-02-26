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
                                ? 'inline-block rounded-b-lg border-b-2 border-r-2 border-primary bg-secondary px-4 py-3 font-bold text-light'
                                : 'inline-block rounded-b-lg border-b-2 border-r-2 border-light bg-primary px-4 py-3 font-bold text-grey hover:border-primary hover:bg-secondary hover:text-light'
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
        <nav className="min-h-[150px] bg-black p-0 md-nav:min-h-[100px]">
            <div className="flex flex-col md-nav:flex-row">
                <Link href="/" passHref>
                    <div className="jusitfy-between flex min-h-[100px] w-full flex-col">
                        <Image
                            className="mt-auto"
                            src="/rust_wipes_hazmat_logo_no_bg.png"
                            alt="Rust Logo"
                            priority={true}
                            width={544}
                            height={100}
                        />
                    </div>
                </Link>
                <div className="flew-row flex bg-black">{tab_menu}</div>
            </div>
        </nav>
    );
}
