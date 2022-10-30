import Link from 'next/link'
import Image from 'next/image'
import React from 'react';
import { withRouter } from 'next/router'

import styles from "../../../styles/layout/Navbar.module.scss"

import { menu_list } from "../../../lib/menu_list"

// import MenuRoundedIcon from '@material-ui/icons/MenuRounded';

export default withRouter(class Navbar extends React.Component {
    constructor(props) {
      super(props);
      this.cur_url = props.router.query.id;
      this.page = props.page;
      this.setPage = props.setPage;
    }

    generate_navbar(menu_list, cur_url) {
        console.log("Generating Navbar")
        console.log(`Current URL (Next Line):`)
        console.log(cur_url)

        // var cur_menu = (this.cur_url.includes('upcoming')) ? 'upcoming' : 'recent'
        var cur_menu = this.page
        console.log(`Current Page: ${this.page}`)
    
        var menu_items = [];
        for (var i=0; i < menu_list.length; i++) {
    
            let class_name = menu_list[i][0];
            let menu_item_string = menu_list[i][1];
            let url_endpoint = menu_list[i][3];
    
            console.log(`Creating Menu Item for: ${menu_item_string} | ${class_name}`);
    
            const tab_class = (cur_menu == class_name) ? styles.tab_active : styles.tab_button
            
    
            const menu_item = (
                <Link href={url_endpoint} passHref={true} onClick={(e) => {e.preventDefault(); this.setPage(class_name)} } key={i}> 
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
        const tab_menu = this.generate_navbar(menu_list, this.cur_url)

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
})