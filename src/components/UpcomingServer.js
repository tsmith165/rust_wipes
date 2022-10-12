import styles from '../../styles/components/UpcomingServerList.module.scss'

import React, { Component } from 'react'
import Link from 'next/link'

const HOT_WIPE = 5;
const COOL_WIPE = 15;
const COLD_WIPE = 60;

const BM_SERVER_BASE_URL = 'https://www.battlemetrics.com/servers/rust'

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const UpcomingServer = ({id, server}) => {

// Navbar_Button Props:
// props.className:       Name of class to apply to the button
// props.image_path:      Path to image of piece
// props.title:           Title to show inside description container
// props.description:     Description to show inside description container
// props.dimensions:      image dimensions: [x, y, width, height]

    // console.log("UpcomingServer (Next Line):")
    // console.log(server)

    var d = server.latest_wipe_date;
    //console.log(server.latest_wipe_date)
    /*
    var hour_str = (d.getHours() < 12) ? `${(d.getHours())}AM` : `${((d.getHours()) % 12)}PM`
    if (hour_str == '0AM') { hour_str == '12AM' }
    if (hour_str == '0PM') { hour_str == '12PM' }
    var last_wipe_date_str = `${monthNames[d.getMonth()]} ${d.getDate()} ${hour_str} ${d.getMinutes()}`
    */

    return (
        <div className={`${styles.server_container}`}>
            <div className={styles.rank_cell}>
                {`#${server.rank}`}
            </div>
            <div className={styles.server_name_cell}>
                <Link href={`${BM_SERVER_BASE_URL}/${server.id}`} className={styles.server_href}>
                    <a>{server.title}</a>
                </Link>
            </div>
            <div className={styles.latest_wipe_cell}>
                {server.latest_wipe_date}
            </div>
        </div>
    )
}

export default UpcomingServer;
