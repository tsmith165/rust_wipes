import React from 'react';
import Link from 'next/link';

interface MenuOverlayButtonProps {
    menu_name: string;
    id: string;
    url_endpoint: string;
    isActive: boolean;
}

function MenuOverlayButton({ menu_name, id, url_endpoint, isActive }: MenuOverlayButtonProps) {
    return (
        <Link
            href={url_endpoint}
            className={`relative z-50 flex h-[40px] items-center justify-center rounded-bl-lg border-b-2 border-stone-500 px-[5px] font-bold text-stone-800 hover:bg-primary hover:text-stone-300 ${isActive ? 'bg-primary !text-stone-300' : 'bg-stone-300'}`}
            id={`${id}`}
            aria-label={menu_name}
            prefetch={false}
        >
            {menu_name}
        </Link>
    );
}

export default MenuOverlayButton;
