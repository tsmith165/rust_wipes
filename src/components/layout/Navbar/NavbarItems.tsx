import React from 'react';
import Link from 'next/link';

type NavbarItem = [string, string, string];

interface NavbarItemsProps {
    items: NavbarItem[];
    page: string;
}

export default function NavbarItems({ items, page }: NavbarItemsProps) {
    return (
        <>
            {items.map(([menu_class_name, menu_full_name, href]) => {
                if (page.includes('checkout')) {
                    page = 'kits';
                }

                // Extract the final part of the path for comparison
                const currentPath = page.split('/').pop() || '';
                const menuPath = href.split('/').pop() || '';
                const isCurrentPage = currentPath === menuPath || (menuPath.includes('?') && menuPath.split('?')[0] === currentPath);

                return (
                    <div
                        key={menu_class_name}
                        className={`h-full cursor-pointer items-center justify-center font-bold ${
                            ['faq'].includes(menu_class_name)
                                ? 'hidden'
                                : ['recent'].includes(menu_class_name)
                                  ? 'hidden xxs:!flex'
                                  : ['upcoming'].includes(menu_class_name)
                                    ? 'hidden xs:!flex'
                                    : ['networks', 'stats', 'wheel', 'slots'].includes(menu_class_name)
                                      ? 'hidden sm:!flex'
                                      : 'flex'
                        } ${
                            isCurrentPage
                                ? 'radial-gradient-stone-300 bg-primary bg-clip-text text-transparent'
                                : 'radial-gradient-stone-300 bg-stone-600 bg-clip-text text-transparent hover:!bg-primary'
                        }`}
                    >
                        <Link href={href} prefetch={false}>
                            {menu_full_name}
                        </Link>
                    </div>
                );
            })}
        </>
    );
}
