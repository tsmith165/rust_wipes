import Link from 'next/link'
import Image from 'next/image'
import React from 'react';

import styles from "../../../styles/layout/Navbar.module.scss";

import { menu_list } from "../../../lib/menu_list";

export default class Navbar extends React.Component {
    constructor(props) {
      super(props);
    }

    generate_navbar(menu_list) {
        this.curr_pathname = this.props.url
        console.log(("-".repeat(15)) + " Generating Navbar " + ("-".repeat(15)))
        console.log(`Current URL: ${this.curr_pathname}`)
    
        var menu_items = [];
        for (var i=0; i < menu_list.length; i++) {
    
            let class_name = menu_list[i][0];
            let menu_item_string = menu_list[i][1];
            let url_endpoint = menu_list[i][3];
    
            console.log(`Creating Menu Item for URL endpoint: ${url_endpoint} | Active Endpoint: ${this.curr_pathname}`);
    
            const tab_class = (this.curr_pathname == url_endpoint) ? styles.tab_active : styles.tab_button
            
            const menu_item = (
                <Link href={url_endpoint} passHref={true} onClick={(e) => {e.preventDefault();}} key={i}> 
                    <div className={`${tab_class}`}>
                        {menu_item_string}
                    </div>
                </Link>
            )
            menu_items.push(menu_item);
        }
        return menu_items
    }

    render() {
        const tab_menu = this.generate_navbar(menu_list)

        return (
            <nav className={styles.navbar}>
                <div className={styles.navbar_container}>
                    <div className={styles.navbar_logo_container}>
                        <Link href="/" passHref={true} styles={{}}>
                            <a>
                                <div className={styles.navbar_logo}>
                                    <Image className={styles.navbar_logo_img} src='/rust_wipes_hazmat_logo.png' alt='Rust Logo' priority={false} width={544} height={100}/>
                                </div>
                            </a>
                        </Link>
                    </div>
                    <div className={styles.tab_menu}>
                        {tab_menu}
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
}