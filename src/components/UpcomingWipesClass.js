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
  

class UpcomingWipesClass extends React.Component {
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = {
            debug: false,
            server_list: props.server_list,
            min_rank: 5000,
            date: new Date() 
        };
    }

    async componentDidMount() {
        await this.fetch_servers(this.state.date)
    }

    async fetch_servers(date) {
        const min_rank = document.getElementById('min_rank_input').value
        console.log(`Date: ${date} | Min Rank: ${min_rank}`)
        const server_list = await fetch_upcoming_servers_for_week_day(date, min_rank)
        this.setState({server_list: server_list, date: date, min_rank: min_rank})
    }

    render() {
        if (this.state.server_list != undefined) {
            var servers_jsx_array = [];
            

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
