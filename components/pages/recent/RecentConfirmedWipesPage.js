'use client'

import React, { useState, useEffect } from 'react';
import { Howl } from 'howler';

import styles from '../../../styles/pages/RecentServerList.module.scss';
import { fetch_recent_wipes_from_db, fetch_battlemetrics_servers, generate_test_battlemetrics_data } from '../../../lib/api_calls';
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';

const USE_TEST_BM_DATA = false;

const RecentConfirmedWipesPage = () => {
    const initialState = {
        debug: false,
        running: false,
        refreshing: false,
        server_list: null,
        next_url: null,
        prev_url: null,
        server_list_timer: null,
        num_servers: 25,
        min_players: 2,
        max_distance: 5000,
        country: 'US',
        current_page: 1,
        window_width: null,
        render_ads: false,
        current_test_id: 0,
        useMockData: USE_TEST_BM_DATA
    };

    const [state, setState] = useState(initialState);
    const sound = new Howl({ src: ['/maximize_007.mp3'] });

    // Your methods and lifecycle methods will go here as useEffects and normal functions

    useEffect(() => {
        async function fetchData() {
            const [new_server_list, next_url, prev_url, current_test_id] = await fetch_servers();
    
            // Add event listeners
            window.addEventListener("resize", handle_window_resize);
            window.toggleMockData = toggleMockData.bind(this);
    
            handle_window_resize();
    
            setState({server_list: new_server_list, next_url: next_url, prev_url: prev_url, current_test_id: current_test_id});
        }
    
        fetchData();
    
        return () => { // Clean up
            delete window.toggleMockData;
            window.removeEventListener("resize", handle_window_resize);
        };
    }, []);
    

    const toggleMockData = () => {
        setState(prevState => ({ useMockData: !prevState.useMockData }));
        console.log(`Using mock data: ${state.useMockData}`);
    }
      
    const set_server_list_fetch_timeout = () => {
        console.log(`Server List Update Timer Running: ${state.running}`)
        if (state.running) {
            var server_list_timer = setTimeout(async () => {
                setState({...state, server_list_timer: server_list_timer, refreshing: true})
                await update_server_list()
            }, 5 * 1000)
        }
    }

    const run_refresh_timer = async (post_refresh_state, wait_time) => {
        console.log(`Refreshing for set ${wait_time / 1000}s before updating data to state`)
        const refresh_timer = setTimeout(() => {
            setState(post_refresh_state)
            clearTimeout(refresh_timer)
        }, wait_time);
    }

    const update_server_list = async () => {
        console.log(`------------------------ Updating Server List ------------------------`)
        const [new_server_list, next_url, prev_url, current_test_id] = await fetch_servers()

        var server_list_updated = true;

        for (var x = 0; x < new_server_list.length; x++) {
            if (new_server_list[x]['id'] != state.server_list[x]['id']) {
                console.log(`New Server List ID: ${new_server_list[x]['id']} | Old Server List ID: ${state.server_list[x]['id']}`)
                server_list_updated = false;
            }
        }
        console.log(`Server List Updated: ${server_list_updated}`)
        
        if (server_list_updated) {
            console.log("Server lists are the same, not updating state")
            run_refresh_timer(state, 1500)
            
            clearTimeout(state.server_list_timer)
            set_server_list_fetch_timeout()
            return
        }
        
        console.log(`Server List Updated.`)
        sound.play();

        console.log(`New Server List (Next Line): `)
        console.log(new_server_list);

        console.log(`Last Server List (Next Line): `)
        console.log(state.server_list);

        // Create state to show post refresh timer
        const post_refresh_state = {...state, server_list: new_server_list, next_url: next_url, prev_url: prev_url, current_test_id: current_test_id, refreshing: false}
        run_refresh_timer(post_refresh_state, 1500)

        clearTimeout(state.server_list_timer)
        set_server_list_fetch_timeout()
    } 

    const toggle_auto_refresh = async () => {
        console.log(`Toggling auto-refresh state - current: ${state.running}`);
        if (state.running == true) {
            console.log("Toggling OFF auto-refresh")
            if (state.server_list_timer != null) { clearTimeout(state.server_list_timer) }
            setState({...state, running: false});

        } else {
            console.log("Toggling ON auto-refresh")
            setState({...state, refreshing: true, running: true})

            await update_server_list()
        }
    }

    const fetch_servers = async () => {
        if (state.useMockData) {
            return generate_test_battlemetrics_data();
        }
        
        // 1. Fetch the most recent 25 servers from your DB
        const response = await fetch_recent_wipes_from_db();
        const ourDBServers = response.recentServers;
        // console.log('Our DB 25 Servers:', ourDBServers)
    
        // 2. Fetch the most recent 50 servers from the BM DB
        const [bmDBServers, next_url, prev_url] = await fetch_battlemetrics_servers(
            state.country, 
            state.max_distance, 
            state.min_players, 
            50, // We want 50 servers from BM DB
            state.next_url, 
            state.prev_url,
            true
        )

        // console.log('BattleMetrics DB 50 Servers:', bmDBServers)
    
        // 3. Merge data from BM DB with our DB's 25 servers
        const updatedOurDBServers = ourDBServers.map(ourDBServer => {
            
            const foundServer = bmDBServers.find(bmDBServer => parseInt(bmDBServer.id) === parseInt(ourDBServer.id));
            // console.log('Our DB Server ID:', ourDBServer.id)
            // console.log('Found Server ID:', foundServer ? foundServer.id : 'none')
            // console.log('Found Server:', foundServer)
        
            if (foundServer) {
                return {
                    ...ourDBServer,
                    attributes: { ...foundServer.attributes }, // add the 'attributes' key dictionary from the BM data
                    offline: false
                };
            } else {
                return {
                    ...ourDBServer,
                    attributes: {
                        ip: null,
                        port: null,
                        name: null,
                        rank: null,
                        details: {
                            rust_last_wipe: null
                        }
                    },
                    offline: true
                };
            }
        });

        console.log('Merged 25 Servers:', updatedOurDBServers)
    
        return [updatedOurDBServers, next_url, prev_url, 0]
    }
    

    const switch_page = async (forward) => {
        const [new_server_list, next_url, prev_url, current_test_id] = await fetch_servers(false, forward)
        console.log(`New Server List (Next Line): `)
        console.log(new_server_list);

        var switch_to_page = (forward == true) ? state.current_page + 1 : state.current_page - 1

        setState({server_list: new_server_list, next_url: next_url, prev_url: prev_url, current_test_id: current_test_id, current_page: switch_to_page})
    }

    const update_filter_value = async (filter, new_value) => {
        console.log(`Setting state on filter: ${filter} | Value: ${new_value}`)
        if      (filter == 'max_distance') { setState({max_distance: new_value}, async () => {(state.running == false) ? (await update_server_list() ) : (null) }) }
        else if (filter == 'num_servers')  { setState({num_servers: new_value},  async () => {(state.running == false) ? (await update_server_list() ) : (null) }) }
        else if (filter == 'min_players')  { setState({min_players: new_value},  async () => {(state.running == false) ? (await update_server_list() ) : (null) }) }
        else if (filter == 'country')      { setState({country: new_value},      async () => {(state.running == false) ? (await update_server_list() ) : (null) }) }
    }

    const handle_window_resize = () => {
        setState({...state, window_width: window.innerWidth});
    }

    return (
        <div className={styles.page_container}>
            <div className={styles.server_list_container}>
                <RecentWipesSidebar state={state} toggle_auto_refresh={toggle_auto_refresh} update_filter_value={update_filter_value} />
                <RecentWipesTable state={state} update_filter_value={update_filter_value} switch_page={switch_page} />
            </div>
        </div>
    );
};

export default RecentConfirmedWipesPage;
