'use client'

import React from 'react';

import UpcomingWipesSidebar from './UpcomingWipesSidebar';

import styles from '../../../styles/pages/UpcomingServerList.module.scss'
import UpcomingServerHourGroup from './UpcomingServerHourGroup'

import { fetch_upcoming_servers_for_week_day } from '../../../lib/api_calls'

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
  
class UpcomingWipesPage extends React.Component {
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
            server_list: null,
            min_rank: 5000,
            date: cur_date,
            wipe_day_header_str: wipe_day_header_str,
            time_zone: DEFAULT_TIME_ZONE,
            region: 'US',
            game_mode: 'any',
            resource_rate: 'any',
            group_limit: 'any',
        };

        this.update_filter_value = this.update_filter_value.bind(this);
    }

    async componentDidMount() {
        console.log('Upcoming Wipes Component Mounted Successfully. Fetching Servers...')
        await this.fetch_servers()
    }

    async update_filter_value(filter, new_value) {
        console.log(`Setting state on filter: ${filter} | Value: ${new_value}`)

        if      (filter == 'date')     { this.setState({date: new_value},          async () => {await this.fetch_servers()}) }
        else if (filter == 'min_rank') { this.setState({min_rank: new_value},      async () => {await this.fetch_servers()}) }
        else if (filter == 'time')     { this.setState({time_zone: new_value},     async () => {await this.fetch_servers()}) }
        else if (filter == 'rate')     { this.setState({resource_rate: new_value}, async () => {await this.fetch_servers()}) }
        else if (filter == 'groups')   { this.setState({group_limit: new_value},   async () => {await this.fetch_servers()}) }
        else if (filter == 'mode')     { this.setState({game_mode: new_value},     async () => {await this.fetch_servers()}) }
        else if (filter == 'region')   { this.setState({region: new_value},        async () => {await this.fetch_servers()}) }
    }

    async fetch_servers() {
        const date = this.state.date
        const cur_day = date.getDate()
        const current_weekday = date.getDay()
        const force_wipe = (current_weekday == 4 && cur_day < 7) ? true : false;

        const wipe_day_header_str = (force_wipe == true) ? `Force Wipes` : `${DAY_OF_WEEK_DICT[current_weekday]} Wipes`;

        console.log(`Min Rank: ${this.state.min_rank} | Date: ${this.state.date} | Force Wipe: ${this.state.force_wipe} | Wipe Day Header Str: ${this.state.wipe_day_header_str}`)

        const server_list = await fetch_upcoming_servers_for_week_day(date, this.state.time_zone, this.state.min_rank, this.state.region, this.state.resource_rate, this.state.group_limit, this.state.game_mode)
        console.log(`Fetched Server List (Next Line):`)
        console.log(server_list)

        this.setState({server_list: server_list, date: date, wipe_day_header_str: wipe_day_header_str, min_rank: this.state.min_rank})
    }

    render() {
        console.log(("-".repeat(15)) + " Rendering Upcoming Wipes Page " + ("-".repeat(15)))

        if (this.state.server_list != undefined) {
            var servers_jsx_array = [];
            
            for (var wipe_hour in this.state.server_list) {
                const wipe_array = this.state.server_list[wipe_hour]

                servers_jsx_array.push(
                    <UpcomingServerHourGroup key={wipe_hour} wipe_array={wipe_array} wipe_hour={wipe_hour} />
                )
            }
        }
    
        return (
            <div className={styles.page_container}>
                <div className={styles.server_list_container}>
                    <UpcomingWipesSidebar state={this.state} update_filter_value={this.update_filter_value}/>

                    <div className={styles.server_list_body}>
                        {this.state.server_list == null ? (
                            <div className={styles.loader}/>
                        ) : (
                            [servers_jsx_array]
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default UpcomingWipesPage;
