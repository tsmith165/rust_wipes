import React from 'react';
import Image from 'next/image';
import { navbar_menu_list } from '@/lib/menu_list';
import NavbarClient from '@/components/layout/Navbar/NavbarClient';
import NavbarItems from '@/components/layout/Navbar/NavbarItems';
import { IoIosMenu } from 'react-icons/io';
import { FaDiscord } from 'react-icons/fa';
import PROJECT_CONSTANTS from '@/lib/constants';

export default async function Navbar({ page }: { page: string }) {
    const discord_component = (
        <a href={PROJECT_CONSTANTS.CONTACT_DISCORD} aria-label="Rust Wipes Discord">
            <div className="group absolute right-[50px] top-0">
                <FaDiscord className="h-[50px] w-[50px] fill-[#5865F2] py-3 pl-3 group-hover:brightness-125" />
            </div>
        </a>
    );

    return (
        <nav className="h-[50px] w-full bg-stone-900 p-0">
            <div className="flex w-full flex-row items-center justify-between">
                {/* Mobile Logo */}
                <div className="flex pl-2 md:hidden">
                    <Image
                        src="/rust_hazmat_icon.png"
                        alt="CCS Logo"
                        width={186}
                        height={186}
                        className="max-h-[50px] w-fit object-contain pt-2.5"
                        priority
                    />
                </div>

                {/* Desktop Left Menu */}
                <div className="hidden w-fit flex-1 flex-row items-center justify-end space-x-4 md:!flex">
                    <NavbarItems items={navbar_menu_list.slice(0, Math.ceil(navbar_menu_list.length / 2))} page={page} />
                </div>

                {/* Desktop Logo */}
                <div className="hidden items-center justify-center pl-2 md:!flex">
                    <Image
                        src="/rust_hazmat_icon.png"
                        alt="CCS Logo"
                        width={186}
                        height={186}
                        className="max-h-[50px] w-fit object-contain pt-2.5"
                        priority
                    />
                </div>

                {/* Desktop Right Menu */}
                <div className="hidden flex-1 flex-row items-center justify-start space-x-4 pl-2 md:!flex">
                    <NavbarItems items={navbar_menu_list.slice(Math.ceil(navbar_menu_list.length / 2))} page={page} />
                </div>

                {/* Mobile Menu */}
                <div className="flex h-full flex-row justify-end space-x-2">
                    <div className="flex w-full flex-row items-center justify-center space-x-2 pr-[100px] md:hidden">
                        <NavbarItems items={navbar_menu_list} page={page} />
                    </div>
                </div>

                {/* Default Menu Icons */}
                <div className="group absolute right-0 top-0">
                    {discord_component}
                    <IoIosMenu className="h-[50px] w-[50px] fill-primary_dark py-[5px] group-hover:fill-primary" />
                </div>

                {/* Client-side Auth Menu Overlay */}
                <NavbarClient page={page} />
            </div>
        </nav>
    );
}
