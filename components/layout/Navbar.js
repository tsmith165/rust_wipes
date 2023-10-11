'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../../styles/layout/Navbar.module.scss';
import { menu_list } from '../../lib/menu_list';
import { usePathname } from 'next/navigation';

const Navbar = () => {
    const router_pathname = usePathname();

    const generate_navbar = (menu_list) => {
        // console.log(("-".repeat(15)) + " Generating Navbar " + ("-".repeat(15)));
        // console.log(`Current URL: ${router_pathname}`);

        return menu_list.map((item, i) => {
            let menu_item_string = item[1];
            let url_endpoint = item[3];

            const tab_class = (router_pathname === url_endpoint) ? styles.tab_active : styles.tab_button;

            return (
                <Link key={i} href={url_endpoint} passHref={true}>
                    <div className={tab_class}>
                        {menu_item_string}
                    </div>
                </Link>
            );
        });
    };

    const tab_menu = generate_navbar(menu_list);

    // console.log('returning navbar');

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar_container}>
                <div className={styles.navbar_logo_container}>
                    <Link href="/" passHref={true}>
                        <div className={styles.navbar_logo}>
                            <Image className={styles.navbar_logo_img} src='/rust_wipes_hazmat_logo.png' alt='Rust Logo' priority={false} width={544} height={100} />
                        </div>
                    </Link>
                </div>
                <div className={styles.tab_menu}>
                    {tab_menu}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
