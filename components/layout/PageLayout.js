'use client'

import styles from "../../styles/layout/PageLayout.module.scss"

import Navbar from './Navbar';

import { useAnalytics } from '../../lib/useAnalytics';

const PageLayout = ({page_title="Rust Wipes", page="recent", children}) => {
    console.log(`-------------------------------------------------------`)
    console.log(`Page Title: ${page_title} | Page: ${page}`)

    useAnalytics();

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <Navbar />
                {children}
            </main>
        </div>
    )
}

export default PageLayout;

