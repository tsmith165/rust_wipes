import React from 'react';
import Link from 'next/link';

import styles from '../../styles/components/UpcomingServerList.module.scss';
import UpcomingServer from '../components/UpcomingServer';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

const HOT_WIPE = 5;
const COOL_WIPE = 15;
const COLD_WIPE = 60;

const BM_SERVER_BASE_URL = 'https://www.battlemetrics.com/servers/rust'

class UpcomingServerGroup extends React.Component {
    constructor(props) {
      super(props);
      this.wipe_array = props.wipe_array;
      this.wipe_hour = props.wipe_hour;
      this.debug = false;

      this.header_clicked = this.header_clicked.bind(this);
    }
  
    header_clicked(e) {
        const hour_container_id = e.currentTarget.id
        const wipe_container_id = `${hour_container_id}-wipes`
        const arrow_id = `${hour_container_id}-arrow`
        const hour_container_element = document.getElementById(hour_container_id)
        const wipe_container_element = document.getElementById(wipe_container_id)
        const arrow_element = document.getElementById(arrow_id)

        console.log(`Hour Container ID: ${hour_container_id} | Wipe Container ID: ${wipe_container_id}`)
        console.log(`Wipe Container Hidden: ${wipe_container_element.classList.contains('hidden')}`)

        if (wipe_container_element.classList.contains('hidden')) {
            wipe_container_element.classList.remove('hidden')
            arrow_element.classList.add(styles.open)
        } else {
            wipe_container_element.classList.add('hidden')
            arrow_element.classList.remove(styles.open)
        }

    }
  
    render() {
        var wipe_hour_string = (this.wipe_hour < 12) ? `${this.wipe_hour}AM` : `${this.wipe_hour - 12}PM`
        if (this.wipe_hour == 0)  wipe_hour_string = `12AM`
        if (this.wipe_hour == 12) wipe_hour_string = `12PM`
    
        var group_jsx_array = [];
        
        for (var i = 0; i < this.wipe_array.length; i++) {
            const server = this.wipe_array[i]
            if (this.debug) {
                console.log(`Server (Next Line): `)
                console.log(server)
            }
    
            group_jsx_array.push(
                <UpcomingServer
                    key={i}
                    id={`server-${i}`}
                    server={server}
                />
            );
        }
    
        return (
            <div className={`${styles.hour_container}`} id={`hour-${this.wipe_hour}`} onClick={this.header_clicked}>
                <div className={styles.hour_header}>
                    <div className={styles.hour_header_arrow}>
                        <ArrowForwardIosRoundedIcon className={`${styles.page_arrow_icon}`} id={`hour-${this.wipe_hour}-arrow`} />
                    </div>
                    <div className={styles.hour_header_title}>
                        {wipe_hour_string}
                    </div>
                </div>
                <div className={`${styles.hour_wipes_container} hidden`} id={`hour-${this.wipe_hour}-wipes`}>
                    <div className={`${styles.server_header_container}`}>
                        <div className={styles.rank_cell}>
                            {`Rank`}
                        </div>
                        <div className={styles.server_name_cell}>
                            {`Server Title`}
                        </div>
                        <div className={styles.latest_wipe_cell}>
                            {`Last Wipe`}
                        </div>
                    </div>
                    {group_jsx_array}
                </div>
            </div>
        )
    }
  }

export default UpcomingServerGroup;
