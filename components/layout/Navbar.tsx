import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { menu_list, MenuItem } from '@/lib/menu_list';

interface NavbarProps {
    page: string;
}

export default function Navbar({ page }: NavbarProps) {
    const generate_navbar = (menu_list: MenuItem[]) => {
        return menu_list.map((item, i) => {
            const [menu_item_class_string, menu_item_string, , tab_url_endpoint] = item;
            console.log(`page: ${page}, tab_url_endpoint: ${tab_url_endpoint}`);
            const isActive = menu_item_class_string === page;
            return (
                <Link key={i} href={tab_url_endpoint} passHref>
                    <div
                        className={
                            isActive
                                ? 'inline-block rounded-b-lg bg-gradient-to-t from-primary_dark to-primary px-4 py-1 font-bold text-secondary_light md-nav:rounded-b-none md-nav:rounded-t-lg md-nav:py-3'
                                : 'inline-block rounded-b-lg bg-gradient-to-t from-primary_light to-primary_dark px-4 py-1 font-bold text-secondary_dark hover:from-primary_dark hover:to-primary hover:text-secondary_light md-nav:rounded-b-none md-nav:rounded-t-lg md-nav:py-3'
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
                                    width={544}
                                    height={100}
                                    objectFit="contain"
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
