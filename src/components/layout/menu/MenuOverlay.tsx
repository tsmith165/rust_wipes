'use client';

import React, { useMemo } from 'react';
import { menu_items, admin_menu_items, MenuItem } from '@/lib/menu_list';
import MenuOverlayButton from './MenuOverlayButton';
import MenuOverlayClient from '@/components/layout/menu/MenuOverlayClient';
import { motion } from 'framer-motion';

interface MenuOverlayProps {
    currentPage: string;
    isAdmin: boolean;
}

type GroupedMenuItems = {
    [key: string]: MenuItem[];
};

// Define group titles and their order
const GROUP_TITLES: { [key: string]: { title: string; order: number } } = {
    main: { title: 'Main Navigation', order: 1 },
    games: { title: 'Games', order: 2 },
    wipes: { title: 'Wipe Tracking', order: 3 },
    info: { title: 'Information', order: 4 },
    admin: { title: 'Admin Tools', order: 5 },
};

export default function MenuOverlay({ currentPage, isAdmin }: MenuOverlayProps) {
    const menuItems = isAdmin ? admin_menu_items : menu_items;

    // Group menu items by their group property
    const groupedItems = useMemo(() => {
        const grouped: GroupedMenuItems = {};

        menuItems.forEach((item) => {
            const group = item.group || 'main';
            if (!grouped[group]) {
                grouped[group] = [];
            }
            grouped[group].push(item);
        });

        return grouped;
    }, [menuItems]);

    // Sort groups by their defined order
    const sortedGroups = useMemo(() => {
        return Object.keys(groupedItems).sort((a, b) => {
            const orderA = GROUP_TITLES[a]?.order || 99;
            const orderB = GROUP_TITLES[b]?.order || 99;
            return orderA - orderB;
        });
    }, [groupedItems]);

    return (
        <motion.div
            className="fixed right-0 top-[50px] z-50 h-fit max-h-[calc(100dvh-50px)] w-[350px] overflow-y-auto rounded-lg border border-stone-700/30 bg-stone-900 p-2 shadow-xl sm:w-[420px] md:max-h-[calc(100dvh-50px)] lg:w-[500px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col space-y-2">
                {sortedGroups.map((group) => (
                    <div key={group} className="flex flex-col">
                        {/* Group Title */}
                        <div className="mb-1 px-3 pt-1">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                                {GROUP_TITLES[group]?.title || group}
                            </h3>
                        </div>

                        {/* Group Items - using grid for more compact layout */}
                        <div className="mb-2 grid grid-cols-1 gap-1 overflow-hidden rounded-lg md:grid-cols-2">
                            {groupedItems[group].map((item, index) => {
                                // Extract paths for comparison
                                const itemPath = item.href.split('?')[0].replace(/^\/+|\/+$/g, '');
                                const currentPagePath = typeof currentPage === 'string' ? currentPage.replace(/^\/+|\/+$/g, '') : '';

                                // For nested routes like /games/wheel, get the last segment
                                const itemPathSegments = itemPath.split('/');
                                const lastSegmentOfItemPath = itemPathSegments[itemPathSegments.length - 1];

                                // Check if this menu item should be active
                                const isActive =
                                    // Exact path match
                                    itemPath === currentPagePath ||
                                    // ID match
                                    item.id === currentPage ||
                                    // ID matches currentPage path
                                    item.id === currentPagePath ||
                                    // Handle case where currentPage only contains the last segment
                                    currentPage === lastSegmentOfItemPath;

                                const isLastItem = index === groupedItems[group].length - 1;

                                return (
                                    <MenuOverlayButton
                                        key={item.id}
                                        id={item.id}
                                        menu_name={item.label}
                                        url_endpoint={item.href}
                                        isActive={isActive}
                                        isLastItem={isLastItem}
                                        icon={item.icon}
                                        description={item.description}
                                        group={item.group}
                                        compact={true}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}

                <MenuOverlayClient isSignedIn={isAdmin} currentPage={currentPage} />
            </div>
        </motion.div>
    );
}
