import MenuOverlayButton from './MenuOverlayButton';
import { menu_list, admin_menu_list } from '@/lib/menu_list';

import dynamic from 'next/dynamic';
const DynamicMenuOverlaySignOutButton = dynamic(() => import('./MenuOverlaySignOutButton'), { ssr: false });

const ADD_SIGN_IN_OUT_BUTTON = false;

function MenuOverlay({ currentPage, isAdmin }: { currentPage: string; isAdmin: boolean }) {
    const menuList = isAdmin ? admin_menu_list : menu_list;
    const menuItems = generateMenu(menuList, isAdmin, currentPage);

    return <div className="relative z-50 flex w-full flex-col">{menuItems}</div>;
}

function generateMenu(menuList: typeof menu_list, isSignedIn: boolean, currentPage: string) {
    // Loop through the menu list and generate the menu items
    const menu_items = menuList.map((menuItem) => {
        const [className, menuItemString, urlEndpoint] = menuItem;
        const isActive = urlEndpoint.includes(currentPage);
        return (
            <div key={className}>
                <MenuOverlayButton id={className} menu_name={menuItemString} url_endpoint={urlEndpoint} isActive={isActive} />
            </div>
        );
    });

    if (isSignedIn) {
        // If the user is signed in, add the sign out button
        menu_items.push(
            <div key="sign_out_button" className="z-0">
                <DynamicMenuOverlaySignOutButton />
            </div>,
        );
    } else if (ADD_SIGN_IN_OUT_BUTTON) {
        // If the user is not signed in, add the sign in button
        menu_items.push(
            <div key="sign_in">
                <MenuOverlayButton
                    id={'sign_in'}
                    menu_name={'Sign In'}
                    url_endpoint={'/signin'}
                    isActive={currentPage.includes('/signin')}
                />
            </div>,
        );
    }
    return menu_items;
}

export default MenuOverlay;
