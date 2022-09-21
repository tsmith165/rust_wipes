import Link from 'next/link'
import Image from 'next/image'

import styles from "../../../styles/layout/Navbar.module.scss"

import { menu_list } from "../../../lib/menu_list"

// import MenuRoundedIcon from '@material-ui/icons/MenuRounded';

function generate_tab_menu(menu_list) {
    var menu_items = [];
    for (var i=0; i < menu_list.length; i++) {

        let class_name = menu_list[i][0];
        let menu_item_string = menu_list[i][1];
        let url_endpoint = menu_list[i][3];

        console.log(`Creating Menu Item for: ${menu_item_string}`);

        const menu_item = (
            <Link href={url_endpoint} passHref={true} onClick={(e) => {e.preventDefault();} } key={i}> 
                <div className={`${styles.tab_button}`}>
                    {menu_item_string}
                </div>
            </Link>
        )

        menu_items.push(menu_item);
    }

    return menu_items
}

const Navbar = ({}) => {

    const tab_menu = generate_tab_menu(menu_list)

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar_container}>
                <div className={styles.logo_container}>
                    <Link href="/" passHref={true} styles={{}}>
                        <a>
                            <div className={styles.navbar_logo}>
                                <Image className={styles.navbar_logo_img} src='/rust_wipes_logo_short.png' alt='Rust Logo' priority={false} width={334} height={100}/>
                            </div>
                        </a>
                    </Link>
                </div>
                <div className={styles.tab_menu_container}>
                    <div className={styles.tab_menu_top}>
                    
                    </div>
                    <div className={styles.tab_menu_bottom}>
                        {tab_menu}
                    </div>
                </div>
                {/*
                <div className={styles.page_menu_full_container}>
                    <div className={styles.menu_button_container} >
                        <MenuRoundedIcon className={styles.hamburger_button} />
                    </div>
                </div>
                */}
            </div>
        </nav>
    )
}

export default Navbar;