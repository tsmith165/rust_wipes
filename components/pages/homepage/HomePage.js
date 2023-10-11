'use client';
import React, { useRef, useState, useEffect } from 'react';
import styles from '../../../styles/pages/HomePage.module.scss';
import { useRouter } from 'next/navigation';

const HomePage = () => {
    const overlayRef = useRef(null);
    const router = useRouter();
    const [redirectTo, setRedirectTo] = useState(null);

    const handle_link_clicked = (href, event) => {
        event.preventDefault();
        setRedirectTo(href);
    };

    useEffect(() => {
        if (redirectTo) {
            overlayRef.current.style.display = 'block';
            setTimeout(() => {
                router.push(redirectTo);
            }, 1000);
        }
    }, [redirectTo]);

    const linkData = [
        { href: "/upcoming", label: "Upcoming Wipes", img: "/rust_upcoming_wipe.jpg" },
        { href: "/recent", label: "Recent Wipes", img: "/rust_recent_wipe.jpg" },
        { href: "/scraper/stats", label: "Scraper Stats", img: "/rust_scraper_stats.jpg" }
    ];

    return (
        <div className={styles.page_container}>
            <div className={styles.link_and_seo_container}>
                <div className={styles.seo_block}>
                    <h2 className={styles.seo_header}>Discover the Latest Server Wipes with rustwipes.net!</h2>
                    <p className={styles.seo_text}>
                        Are you tired of jumping from one server to another trying to find a recent wipe? Rust Wipes is your go-to platform, offering tools that help players identify servers based on their wipe schedules. We provide an extensive list of servers that have just wiped, are about to wipe, and detailed scraper statistics. Our free auto-refresh feature ensures you get the latest data without any manual effort. Dive deep into the world of Rust and find your perfect server with Rust Wipes.
                    </p>
                </div>

                <div className={styles.link_container}>
                    {linkData.map((link, index) => (
                        <div 
                            key={index} 
                            className={styles.card} 
                            onClick={(e) => handle_link_clicked(link.href, e)}
                        >
                            <div className={styles.card_header}>{link.label}</div>
                            <div className={styles.card_body}>
                                <img className={styles.card_img} src={link.img} alt={link.label} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={`${styles.overlay} hidden`} ref={overlayRef}></div>
        </div>
    );
}

export default HomePage;
