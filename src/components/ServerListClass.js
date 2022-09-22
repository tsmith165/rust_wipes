import React from 'react';
import { useEffect, useState } from 'react'

import Server from '../components/Server'

import styles from '../../styles/components/ServerList.module.scss'
import CachedIcon from '@material-ui/icons/Cached';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

class ServerListClass extends React.Component {
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = {
            debug: false,
            running: false,
            refreshing: false,
            server_list: [],
            next_url: 'none',
            prev_url: 'none',
            server_list_timer: null,
            num_servers: 25,
            min_players: 2,
            max_distance: 5000,
            country: 'US',
            current_page: 1
        };
    }

    async componentDidMount() {
        console.log(`-------------- Fetching Initial Server List --------------`)
        const [new_server_list, next_url, prev_url] = await this.FetchServers()
        // this.SetServerListFetchInterval()  // disabled as we added button to turn on interval

        this.setState({server_list: new_server_list, next_url: next_url, prev_url: prev_url})
    }

    async ToggleRunning() {
        console.log(`Toggling running state - current: ${this.state.running}`);

        // If currently running
        if (this.state.running == true ) {
            // clear current Timeout if already running
            if (this.state.server_list_timer != null) {
                clearTimeout(this.state.server_list_timer) 
            }
            console.log("Setting to NOT running")
            this.setState({running: false});
        // If currently NOT running
        } else {
            console.log("Setting to running = true and refreshing = true")
            this.setState({refreshing: true, running: true})

            await this.UpdateServerList()
        }
    }

    ResetTimer() {
        clearTimeout(this.state.server_list_timer)
        this.SetServerListFetchInterval()
    }
      
    SetServerListFetchInterval() {
        console.log(`Server List Update Timer Running: ${this.state.running}`)
        if (this.state.running) {
            var server_list_timer = setTimeout(async () => {
                this.setState({server_list_timer: server_list_timer, refreshing: true})
                await this.UpdateServerList()
            }, 5 * 1000)
        }
    } 

    async next_page(forward) {
        const [new_server_list, next_url, prev_url] = await this.FetchServers(false, forward)
        console.log(`New Server List (Next Line): `)
        console.log(new_server_list);

        if (forward) {
            if (next_url != 'none') {
                this.setState({server_list: new_server_list, next_url: next_url, prev_url: prev_url, current_page: this.state.current_page + 1})
            }
        }
        else {
            if (prev_url != 'none') {
                this.setState({server_list: new_server_list, next_url: next_url, prev_url: prev_url, current_page: this.state.current_page - 1})
            }
        }
    }

    async RunRefreshTimer(post_refresh_state, wait_time) {
        console.log(`Refreshing for set ${wait_time / 1000}s before updating data to state`)
        const refresh_timer = setTimeout(() => {
            console.log(`Updating state post ${wait_time / 1000}s timeout`)
            this.setState(post_refresh_state)
            clearTimeout(refresh_timer)
        }, wait_time);
    }

    async UpdateServerList() {
        console.log(`-------------- Updating Server List --------------`)
        const [new_server_list, next_url, prev_url] = await this.FetchServers()
        console.log(`New Server List (Next Line): `)
        console.log(new_server_list);

        const post_refresh_state = {server_list: new_server_list, next_url: next_url, prev_url: prev_url, refreshing: false}
        this.RunRefreshTimer(post_refresh_state, 1500)

        clearTimeout(this.state.server_list_timer)
        this.SetServerListFetchInterval()
    } 
    
    async FetchServers(use_default=true, forward=true) {
        var api_call = ``
        if (use_default) {
            api_call = `https://api.battlemetrics.com/servers?filter[game]=rust&filter[status]=online`
            api_call    += `&filter[countries][]=${this.state.country}&filter[maxDistance]=${this.state.max_distance}&filter[players][min]=${this.state.min_players}`
            api_call    += `&page[size]=${this.state.num_servers}&sort=-details.rust_last_wipe`
        }
        else {
            api_call = (forward) ? this.state.next_url : this.state.prev_url
        }

        console.log(api_call)
    
        const bm_response = await fetch(api_call)
        const bm_output = await bm_response.json()
    
        console.log(`Fetch Output (Next Line):`);
        console.log(bm_output)

        var next_url = ('next' in bm_output['links']) ? bm_output['links']['next'] : 'none'
        var prev_url = ('prev' in bm_output['links']) ? bm_output['links']['prev'] : 'none'
    
        return [bm_output['data'], next_url, prev_url]
    }

    render() {
        var servers_jsx_array = [];

        if (this.state.server_list != undefined) {
            var server_list_length = this.state.server_list.length;
    
            if (this.state.debug) console.log(`SERVER LIST LENGTH: ${server_list_length}`)
    
            for (var i = 0; i < server_list_length; i++) {
                var current_server_json = this.state.server_list[i];
    
                var id          = current_server_json['id'];
                var name        = current_server_json['attributes']['name'];
                var rank        = current_server_json['attributes']['rank'];
                var players     = current_server_json['attributes']['players'];
                var max_players = current_server_json['attributes']['maxPlayers'];
                var wipe_date   = current_server_json['attributes']['details']['rust_last_wipe'];
    
                if (this.state.debug) {
                    console.log(`Server ID: ${id} | Name: ${name} | Rank: ${rank}`)
                    console.log(`Wipe Date: ${wipe_date}`)
                    console.log(`Players: ${players} | Max Players: ${max_players}`)
                    console.log('--------------------------------------------------------------------');
                }
    
                servers_jsx_array.push(
                    <Server
                        key={i}
                        id={`server-${i}`}
                        className={name}
                        url={`https://www.battlemetrics.com/servers/rust/${id}`}
                        rank={rank}
                        players={players}
                        max_players={max_players}
                        wipe_date={wipe_date}
                    />
                );
            }
        }
    
        return (
            <div className={styles.page_container}>
                <div 
                    className={`${styles.refresh_container} ${this.state.running ? (styles.running_background) : ('')}`} 
                    onClick={(e) => {e.preventDefault(); this.ToggleRunning() }}
                >
                    <CachedIcon className={`${styles.refresh_icon} ${this.state.refreshing ? (styles.rotate) : ('')}`} />
                </div>
                <div className={styles.server_list_container}>
                    <div className={styles.server_list_filter_column}>
                        {/* Min Player Count */}
                        <div className={styles.input_container}>
                            <div className={styles.input_label_container}>
                                <div className={styles.input_label}>Min Players</div>
                            </div>
                            <input 
                                id="min_players" 
                                className={styles.input_textbox} 
                                defaultValue={2} 
                                onChange={(e) => {
                                    e.preventDefault();
                                    const min_players = document.getElementById('min_players').value; 
                                    console.log(`NEW MIN PLAYERS: ${min_players}`); 
                                    this.setState({min_players: min_players})
                                }
                            }/>
                        </div>
                        {/* Max Server Distance */}
                        <div className={styles.input_container}>
                            <div className={styles.input_label_container}>
                                <div className={styles.input_label}>Distance</div>
                            </div>
                            <input 
                                id="max_distance" 
                                className={styles.input_textbox} 
                                defaultValue={5000} 
                                onChange={(e) => {
                                    e.preventDefault();
                                    const max_distance = document.getElementById('max_distance').value; 
                                    console.log(`NEW MAX DISTANCE: ${max_distance}`); 
                                    this.setState({max_distance: max_distance})
                                }
                            }/>
                        </div>
                        {/* Country */}
                        <div className={styles.input_container}>
                            <div className={styles.input_label_container}>
                                <div className={styles.input_label}>Country</div>
                            </div>
                            <input 
                                id="country" 
                                className={styles.input_textbox} 
                                defaultValue={'US'} 
                                onChange={(e) => {
                                    e.preventDefault();
                                    const country = document.getElementById('country').value; 
                                    console.log(`NEW COUNTRY: ${country}`); 
                                    this.setState({country: country})
                                }
                            }/>
                        </div>
                        {/*
                        <div className={styles.filter_button_row}>
                            <button className={styles.apply_filter_button} onClick={(e) => {e.preventDefault(); this.ResetTimer()}}>Apply Filter</button>
                        </div>
                        */}
                    </div>
                    <div className={styles.server_list_body}>
                        <div className={styles.server_list_table}>
                            <div className={`${styles.server_container} ${styles.old_wipe}`}>
                                <div className={styles.rank_cell}>
                                    {'Rank'}
                                </div>
                                <div className={styles.server_name_cell}>
                                    {'Server Title'}
                                </div>
                                <div className={styles.player_count_cell}>
                                    {'Players'}
                                </div>
                                <div className={styles.timestamp_cell}>
                                    {'Time Wiped'}
                                </div>
                            </div>
                            {servers_jsx_array}
                        </div>
                        <div className={styles.page_selector_container}>
                            <div className={styles.page_selector}>
                                <ArrowForwardIosRoundedIcon className={`${styles.page_arrow_icon} ${styles.img_hor_vert}`} onClick={(e) => {e.preventDefault(); this.next_page(false)}}/>
                                {this.state.current_page}
                                <ArrowForwardIosRoundedIcon className={`${styles.page_arrow_icon}`} onClick={(e) => {e.preventDefault(); this.next_page(true)}}/>
                            </div>
                        </div>
                        <div className={styles.page_selector_container}>
                            <div className={styles.page_selector}>
                                <select 
                                    id="num_servers" 
                                    className={`${styles.num_servers}`} 
                                    defaultValue={25}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        const num_servers = document.getElementById('num_servers').value; 
                                        console.log(`NEW NUM SERVERS: ${num_servers}`); 
                                        this.setState({num_servers: num_servers})
                                    }}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ServerListClass;
