import styles from '../../../styles/pages/RecentServerList.module.scss'

import React, { Component, useState } from 'react'
import Link from 'next/link'

import FileCopy from '@material-ui/icons/FileCopy';  

const HOT_WIPE = 5;
const COOL_WIPE = 15;
const COLD_WIPE = 60;

const RecentServerRow = ({id, ip, className, url, rank, players, max_players, wipe_date}) => {

    const [isCopied, setIsCopied] = useState(false);

    var today = new Date();
    var wipe_date_obj = new Date(wipe_date);

    var diff = parseInt((today - wipe_date_obj) / 1000 / 60);
    
    var final_diff_string = "";
    var heat_class = null;
    if      (diff < HOT_WIPE)  heat_class = styles.hot_wipe;
    else if (diff < COOL_WIPE) heat_class = styles.cool_wipe;
    else if (diff < COLD_WIPE) heat_class = styles.cold_wipe;
    else                       heat_class = styles.old_wipe;

    const hours_since_wipe = (diff / 60).toFixed(2);

    final_diff_string += (hours_since_wipe > 1) ? ( `${hours_since_wipe} hrs` ) : ( ((hours_since_wipe * 60) > 1) ? `${parseInt(hours_since_wipe * 60)} mins` : `${parseInt(hours_since_wipe * 60 * 60)} secs` )

    const handleCopyClick = () => {
        navigator.clipboard.writeText(`client.connect ${ip}`);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 500);
    }

    return (
        <div className={`${styles.server_container} ${heat_class} ${styles.className}`}>
            <div className={styles.rank_cell}>
                {`#${rank}`}
            </div>
            <div className={styles.server_name_cell}>
                <Link href={url} className={styles.server_href}>
                    {className}
                </Link>
            </div>
            <div className={styles.player_count_cell}>
                {`${players} / ${max_players}`}
            </div>
            <div className={styles.timestamp_cell}>
                {final_diff_string}
            </div>
            <div className={`${styles.copy_cell_button} ${isCopied ? styles.green_flash : ""}`} onClick={handleCopyClick}>
                <FileCopy className={styles.copy_icon} />
            </div>
        </div>
    )
}

export default RecentServerRow;