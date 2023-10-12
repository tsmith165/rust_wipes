import styles from '../../../styles/pages/RecentServerList.module.scss'

import React, { Component, useState } from 'react'
import Link from 'next/link'

import FileCopy from '@material-ui/icons/FileCopy';  

const HOT_WIPE = 5;
const COOL_WIPE = 15;
const COLD_WIPE = 60;

const RecentServerRow = ({id, ip, className, url, rank, players, max_players, wipe_date, offline}) => {

    const [isCopied, setIsCopied] = useState(false);

    var today = new Date();
    let final_date = "Offline";
    let heat_class = null;
    if (wipe_date != null) {
        let diff = Math.floor((today - new Date(wipe_date)) / 1000);

        let days = Math.floor(diff / (60 * 60 * 24));
        diff -= days * (60 * 60 * 24);

        let hrs = Math.floor(diff / (60 * 60));
        diff -= hrs * (60 * 60);

        if      (diff < HOT_WIPE)  heat_class = styles.hot_wipe;
        else if (diff < COOL_WIPE) heat_class = styles.cool_wipe;
        else if (diff < COLD_WIPE) heat_class = styles.cold_wipe;
        else                       heat_class = styles.old_wipe;

        let mins = Math.floor(diff / 60);

        if (days > 0) {
            final_date = `${days} day${days > 1 ? 's' : ''} ${hrs} hr${hrs > 1 ? 's' : ''}`;
        } else if (hrs > 0) {
            final_date = `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min${mins > 1 ? 's' : ''}`;
        } else if (mins > 0) {
            final_date = `${mins} min${mins > 1 ? 's' : ''}`;
        } else {
            final_date = `${diff} sec${diff > 1 ? 's' : ''}`;
        }
    }

    const handleCopyClick = () => {
        navigator.clipboard.writeText(`client.connect ${ip}`);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 500);
    }

    return (
        <div className={`${styles.server_container} ${heat_class} ${styles.className} ${offline ? styles.offline_style : ""}`}>
            <div className={styles.rank_cell}>
                {`#${rank}`}
            </div>
            <div className={styles.server_name_cell}>
                <Link href={url} className={styles.server_href}>
                    {className}
                </Link>
            </div>
            <div className={styles.player_count_cell}>
                {(!players) ? "Offline" : `${players} / ${max_players}` }
            </div>
            <div className={styles.timestamp_cell}>
                {final_date}
            </div>
            <div className={`${styles.copy_cell_button} ${isCopied ? styles.green_flash : ""}`} onClick={handleCopyClick}>
                <FileCopy className={styles.copy_icon} />
            </div>
        </div>
    )
}

export default RecentServerRow;