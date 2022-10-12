import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import styles from '../../styles/components/UpcomingServerList.module.scss'
import UpcomingServerGroup from '../components/UpcomingServerGroup'
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

import { Today } from '@material-ui/icons';

import { fetch_upcoming_servers_for_week_day } from '../../lib/api_calls'

const DAY_OF_WEEK_DICT = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
}
const DEFAULT_TIME_ZONE = -7 // PST (UTC - 7)
  
class UpcomingWipesClass extends React.Component {
    constructor(props) {
        super(props);
        
        const cur_date = new Date()
        const cur_day = cur_date.getDate()
        const current_weekday = cur_date.getDay()
        const force_wipe = (current_weekday == 4 && cur_day < 7) ? true : false;
        const wipe_day_header_str = (force_wipe == true) ? 
            `Thursday Force Wipes` :
            `${DAY_OF_WEEK_DICT[current_weekday]} Wipes`;

        this.state = {
            debug: false,
            server_list: props.server_list,
            min_rank: 5000,
            date: cur_date,
            wipe_day_header_str: wipe_day_header_str,
            time_zone: DEFAULT_TIME_ZONE
        };
    }

    async componentDidMount() {
        // fetching initial server list in getStaticProps now
        // await this.fetch_servers(this.state.date)
    }

    async fetch_servers(date) {
        const min_rank = document.getElementById('min_rank_input').value
        const cur_day = date.getDate()
        const current_weekday = date.getDay()
        const force_wipe = (current_weekday == 4 && cur_day < 7) ? true : false;
        const wipe_day_header_str = (force_wipe == true) ? 
            `Force Wipes` :
            `${DAY_OF_WEEK_DICT[current_weekday]} Wipes`;
        console.log(`Min Rank: ${min_rank} | Date: ${date} | Force Wipe: ${force_wipe} | Wipe Day Header Str: ${wipe_day_header_str}`)


        const server_list = await fetch_upcoming_servers_for_week_day(date, this.state.time_zone, min_rank, false)
        this.setState({server_list: server_list, date: date, wipe_day_header_str: wipe_day_header_str, min_rank: min_rank})
    }

    render() {
        if (this.state.server_list != undefined) {
            var servers_jsx_array = [];
            
            // console.log(this.state.server_list)

            for (var wipe_hour in this.state.server_list) {
                const wipe_array = this.state.server_list[wipe_hour]

                servers_jsx_array.push(
                    <UpcomingServerGroup
                        key={wipe_hour}
                        wipe_array={wipe_array}
                        wipe_hour={wipe_hour}
                    />
                )
            }
        }
    
        return (
            <div className={styles.page_container}>
                <div className={styles.server_list_container}>
                    <div className={styles.server_list_filter_column}>
                        <div className={styles.input_container}>
                            {/* Date */}
                            <div className={styles.input_split_container}>
                                <div className={styles.input_label_container}>
                                    <div className={styles.input_label}>Date</div>
                                </div>
                                <DatePicker
                                    id={'date_picker_input'}
                                    className={styles.date_picker}
                                    selected={this.state.date} 
                                    onChange= { (date) => {
                                        this.fetch_servers(date)
                                        }
                                    } 
                                />
                            </div>

                            {/* Min Rank */}
                            <div className={styles.input_split_container}>
                                <div className={styles.input_label_container}>
                                    <div className={styles.input_label}>Min Rank</div>
                                </div>
                                <input 
                                    id="min_rank_input" 
                                    className={styles.input_textbox} 
                                    defaultValue={5000} 
                                    onChange={(e) => {
                                        e.preventDefault()
                                        this.fetch_servers(this.state.date)
                                    }
                                }/>
                            </div>
                        </div>

                        {/*
                        <div className={styles.filter_button_row}>
                            <button className={styles.apply_filter_button} onClick={(e) => {e.preventDefault(); this.ResetTimer()}}>Apply Filter</button>
                        </div>
                        */}

                        <div className={styles.input_container}>
                            {/* Time Zone */}
                            <div className={styles.input_split_container}>
                                <div className={styles.input_label_container}>
                                    <div className={styles.input_label}>Time</div>
                                </div>
                                <select 
                                    id="time_zone_select" 
                                    className={`${styles.input_select}`} 
                                    defaultValue={-7}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        const time_Zone = document.getElementById('time_zone_select').value; 
                                        console.log(`NEW NUM SERVERS: ${time_Zone}`); 
                                        this.setState({time_Zone: time_Zone})
                                    }}
                                >
                                    <option value="-10">Hawaii (UTC-10:00)</option>
                                    <option value="-9">Alaska (UTC-09:00)</option>
                                    <option value="-7">Pacific (UTC-07:00)</option>
                                    <option value="-6">Mountain (UTC-06:00)</option>
                                    <option value="-5">Central (UTC-05:00)</option>
                                    <option value="-4">Eastern (UTC-04:00)</option>
                                    <option value="-3">Atlantic (UTC-03:00)</option>
                                    <option value="0">Coordinated Universal Time (UTC)</option>
                                    <option value="1">UTC+01:00</option>
                                    <option value="3">UTC+02:00</option>
                                    <option value="3">UTC+03:00</option>
                                    <option value="4">UTC+04:00</option>
                                    <option value="5">UTC+05:00</option>
                                    <option value="6">UTC+06:00</option>
                                    <option value="7">UTC+07:00</option>
                                    <option value="8">UTC+08:00</option>
                                    <option value="9">UTC+09:00</option>
                                    <option value="10">UTC+10:00</option>
                                    <option value="11">UTC+11:00</option>
                                    <option value="12">UTC+12:00</option>
                                    <option value="13">UTC+13:00</option>
                                </select>
                            </div>

                            {/* Wipe Day header */}
                            <div className={styles.input_split_container}>
                                <div className={styles.wipe_day_header}>
                                    {this.state.wipe_day_header_str}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.server_list_body}>
                        {servers_jsx_array}
                    </div>
                </div>
            </div>
        )
    }
}

export default UpcomingWipesClass;
