import Link from 'next/link'
import Image from 'next/image'

import styles from "../../../styles/layout/Navbar.module.scss"

import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
const Navbar = ({}) => {

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar_container}>
                <Link href="/" passHref={true} styles={{}}>
                    <a>
                        <div className={styles.navbar_logo}>
                            <Image className={styles.navbar_logo_img} src='/rust_wipes_logo_short.png' alt='Rust Logo' priority={false} width={334} height={100}/>
                        </div>
                    </a>
                </Link>

                <div className={styles.page_menu_full_container}>
                    <div className={styles.menu_button_container} >
                        <MenuRoundedIcon className={styles.hamburger_button} />
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;