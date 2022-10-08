import styles from '../../styles/components/UpcomingServerList.module.scss'

import React, { Component } from 'react'
import Link from 'next/link'

const HOT_WIPE = 5;
const COOL_WIPE = 15;
const COLD_WIPE = 60;

const BM_SERVER_BASE_URL = 'https://www.battlemetrics.com/servers/rust'

const UpcomingServer = ({id, server}) => {

// Navbar_Button Props:
// props.className:       Name of class to apply to the button
// props.image_path:      Path to image of piece
// props.title:           Title to show inside description container
// props.description:     Description to show inside description container
// props.dimensions:      image dimensions: [x, y, width, height]

    // console.log("UpcomingServer (Next Line):")
    // console.log(server)

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
        </div>
    )
}

export default UpcomingServer;
