'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { menu_list } from '@/lib/menu_list';

const Navbar = () => {
    const router_pathname = usePathname();
    console.log('NAVBAR ROUTER PATHNAME', router_pathname);

    const generate_navbar = (menu_list) => {
        return menu_list.map((item, i) => {
            let menu_item_string = item[1];
            let url_endpoint = item[3];

            const isActive = url_endpoint === router_pathname;

            const tab_class = isActive
                ? 'inline-block py-3 px-4 font-bold text-primary bg-tertiary rounded-b-lg border-r-2 border-b-2 border-primary hover:bg-secondary hover:text-light'
                : 'inline-block py-3 px-4 font-bold text-light bg-secondary rounded-b-lg border-r-2 border-b-2 border-tertiary hover:bg-tertiary hover:text-primary hover:border-primary';

            return (
                <Link key={i} href={url_endpoint} passHref>
                    <div className={tab_class}>{menu_item_string}</div>
                </Link>
            );
        });
    };

    const tab_menu = generate_navbar(menu_list);
    return (
        <nav className="bg-dark p-0 h-[150px] md-nav:h-[100px]">
            <div className="flex flex-wrap">
                <Link href="/" passHref>
                    <div className="relative h-full w-max">
                        <Image
                            className="object-cover w-full h-auto"
                            src="/rust_wipes_hazmat_logo_no_bg.png"
                            alt="Rust Logo"
                            priority={true}
                            width={544}
                            height={100}
                        />
                    </div>
                </Link>
                <div className="flex flew-row">{tab_menu}</div>
            </div>
        </nav>
    );
};

export default Navbar;
