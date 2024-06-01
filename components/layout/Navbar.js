'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { menu_list } from '@/lib/menu_list';

export default function Navbar(page) {
    page = page.page;
    const generate_navbar = (menu_list) => {
        return menu_list.map((item, i) => {
            let menu_item_class_string = item[0];
            let menu_item_string = item[1];
            let tab_url_endpoint = item[3];

            console.log(`page: ${page}, tab_url_endpoint: ${tab_url_endpoint}`);
            const isActive = menu_item_class_string === page;

            return (
                <Link key={i} href={tab_url_endpoint} passHref>
                    <div
                        className={
                            isActive
                                ? 'from-primary_dark text-secondary_light inline-block rounded-b-lg bg-gradient-to-t to-primary px-4 py-1 font-bold md-nav:rounded-b-none md-nav:rounded-t-lg md-nav:py-3'
                                : 'to-primary_dark hover:from-primary_dark from-primary_light hover:text-secondary_light text-secondary_dark inline-block rounded-b-lg bg-gradient-to-t px-4 py-1 font-bold hover:to-primary md-nav:rounded-b-none md-nav:rounded-t-lg md-nav:py-3'
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
        <nav className="bg-secondary_dark p-0">
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
