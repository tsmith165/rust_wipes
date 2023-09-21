import styles from '../../../styles/pages/UpcomingServerList.module.scss'

import React, { Component } from 'react'
import Link from 'next/link'

const BM_SERVER_BASE_URL = 'https://www.battlemetrics.com/servers/rust'

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const UpcomingServerRow = ({id, server}) => {

// Navbar_Button Props:
// props.className:       Name of class to apply to the button
// props.image_path:      Path to image of piece
// props.title:           Title to show inside description container
// props.description:     Description to show inside description container
// props.dimensions:      image dimensions: [x, y, width, height]

    // console.log("UpcomingServerRow (Next Line):")
    // console.log(server)

    //console.log(server.last_wipe_date)

    var d = new Date(server.last_wipe_date);

    var hour_str = (d.getHours() < 12) ? `${(d.getHours())}AM` : `${((d.getHours()) % 12)}PM`
    if (hour_str == '0AM') { hour_str = '12AM' }
    if (hour_str == '0PM') { hour_str = '12PM' }
    var last_wipe_date_str = `${d.getMonth()}/${d.getDate()} ${hour_str}`

    return (
        <div className={`${styles.server_container}`}>
            <div className={styles.rank_cell}>
                {`#${server.rank}`}
            </div>
            <div className={styles.latest_wipe_cell}>
                {last_wipe_date_str}
            </div>
            <div className={styles.server_name_cell}>
                <Link href={`${BM_SERVER_BASE_URL}/${server.id}`} className={styles.server_href}>
                    {server.title}
                </Link>
            </div>
        </div>
    )
}

export default UpcomingServerRow;
