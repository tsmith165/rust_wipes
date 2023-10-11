'use client'

import styles from "../../styles/layout/PageLayout.module.scss"

import Navbar from './Navbar';

import { useAnalytics } from '../../lib/useAnalytics';

const PageLayout = ({children}) => {

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

