import styles from '../../styles/layout/PageLayout.module.scss';

import Navbar from './Navbar';

const PageLayout = ({ children }) => {
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <Navbar />
                <div className="relative md-nav:h-[calc(100vh-100px)] h-[calc(100vh-150px)] w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default PageLayout;
