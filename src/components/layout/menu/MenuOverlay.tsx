import React from 'react';
import { menu_list, admin_menu_list } from '@/lib/menu_list';
import MenuOverlayButton from './MenuOverlayButton';
import MenuOverlayClient from '@/components/layout/menu/MenuOverlayClient';

interface MenuOverlayProps {
    currentPage: string;
    isAdmin: boolean;
}

export default function MenuOverlay({ currentPage, isAdmin }: MenuOverlayProps) {
    const menuList = isAdmin ? admin_menu_list : menu_list;

    return (
        <div className="relative flex w-full flex-col">
            {menuList.map((menuItem, index) => {
                const [className, menuItemString, urlEndpoint] = menuItem;
                const isActive = urlEndpoint.includes(currentPage);
                return (
                    <div key={className}>
                        <MenuOverlayButton
                            id={className}
                            menu_name={menuItemString}
                            url_endpoint={urlEndpoint}
                            isActive={isActive}
                            isLastItem={false}
                        />
                    </div>
                );
            })}
            <MenuOverlayClient isSignedIn={isAdmin} currentPage={currentPage} />
        </div>
    );
}
