import styles from '../../styles/components/ServerList.module.scss'

import React, { Component } from 'react'
import Link from 'next/link'

const HOT_WIPE = 5;
const COOL_WIPE = 15;
const COLD_WIPE = 60;

const Server = ({id, className, url, rank, players, max_players, wipe_date}) => {

// Navbar_Button Props:
// props.className:       Name of class to apply to the button
// props.image_path:      Path to image of piece
// props.title:           Title to show inside description container
// props.description:     Description to show inside description container
// props.dimensions:      image dimensions: [x, y, width, height]

    var today = new Date();
    var wipe_date = new Date(wipe_date);

    var diff = parseInt((today - wipe_date) / 1000 / 60);
    //console.log(`Today: ${today} | WIPE: ${wipe_date} | DIFF: ${diff}`);
    
    var final_diff_string = "";
    var heat_class = null;
    if      (diff < HOT_WIPE)  heat_class = styles.hot_wipe;
    else if (diff < COOL_WIPE) heat_class = styles.cool_wipe;
    else if (diff < COLD_WIPE) heat_class = styles.cold_wipe;
    else                       heat_class = styles.old_wipe;

    const hours_since_wipe = (diff / 60).toFixed(2);

    final_diff_string += `${hours_since_wipe} hrs`

    /*
    if (diff < 60) final_diff_string = `${diff} minutes `;
    else {
        minutes = diff % 60;
        if (diff >= 1440) days = parseInt((diff - minutes) / 1440);
        if (diff >= 60) hours = (diff - (days * 1440) - minutes) / 60;

        if (days > 0) final_diff_string += `${days} days `
        if (hours > 0) final_diff_string += `${hours} hrs `
        if (minutes > 0) final_diff_string += `${minutes} mins `
    }
    final_diff_string += 'ago'
    */

    return (
        <div className={`${styles.server_container} ${heat_class} ${styles.className}`}>
            <div className={styles.rank_cell}>
                {`${rank}`}
            </div>
            <div className={styles.server_name_cell}>
                <Link href={url} className={styles.server_href}>
                    <a>{className}</a>
                </Link>
            </div>
            <div className={styles.player_count_cell}>
                {`${players} / ${max_players}`}
            </div>
            <div className={styles.timestamp_cell}>
                {final_diff_string}
            </div>
        </div>
    )
}

export default Server;
