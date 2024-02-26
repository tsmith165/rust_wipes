'use client';

import React, { useState, useEffect } from 'react';
// import { Howl } from 'howler';

import { fetch_recent_wipes_from_db, fetch_battlemetrics_servers } from '../../../lib/api_calls';
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';

import { useAnalytics } from '@/lib/helpers/useAnalytics';

const RecentConfirmedWipesPage = () => {
    useAnalytics();

    const [state, setState] = useState({
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
        render_ads: false,
        current_test_id: 0,
    });

    // const sound = new Howl({ src: ['/maximize_007.mp3'] });

    useEffect(() => {
        async function fetchData() {
            const result = await fetch_servers(1);
            console.log('Fetch servers result: ', result);
            const [new_server_list, next_url, prev_url, current_test_id] = result;
            setState((prevState) => ({
                ...prevState,
                server_list: new_server_list,
                next_url: next_url,
                prev_url: prev_url,
                current_test_id: current_test_id,
            }));
        }
        fetchData();
    });

    const run_refresh_timer = async (post_refresh_state, wait_time) => {
        console.log(`Refreshing for set ${wait_time / 1000}s before updating data to state`);
        const refresh_timer = setTimeout(() => {
            setState((prevState) => {
                return {
                    ...prevState,
                    ...post_refresh_state,
                };
            });
            clearTimeout(refresh_timer);

            setTimeout(() => {
                setState((prevState) => ({
                    ...prevState,
                    refreshing: true,
                    running: true,
                }));
                update_server_list(true);
            }, 5 * 1000);
        }, wait_time);
    };

    const update_server_list = async (running = false) => {
        console.log(`------------------------ Updating Server List ------------------------`);
        const result = await fetch_servers(state.current_page);
        console.log('Fetch servers result: ', result);
        const [new_server_list, next_url, prev_url, current_test_id] = result;

        var server_list_updated = true;

        for (var x = 0; x < new_server_list.length; x++) {
            if (new_server_list[x]['id'] != state.server_list[x]['id']) {
                console.log(`New Server List ID: ${new_server_list[x]['id']} | Old Server List ID: ${state.server_list[x]['id']}`);
                server_list_updated = false;
            }
        }
        console.log(`Server List Updated: `, server_list_updated);

        if (!server_list_updated) {
            console.log('Server lists are the same, not updating state');
            run_refresh_timer({ running: true, refreshing: false }, 1500);

            clearTimeout(state.server_list_timer);

            if (state.running) {
                await update_server_list(true);
            }
            return;
        }

        console.log(`New Server List: `, new_server_list);

        // Create state to show post refresh timer
        console.log('Post refresh, setting running to: ', running);
        console.log(`Pre refresh, Server List Update Timer Running: ${state.running}`);
        const post_refresh_state = {
            server_list: new_server_list,
            next_url: next_url,
            prev_url: prev_url,
            current_test_id: current_test_id,
            refreshing: false,
            running: running,
        };
        run_refresh_timer(post_refresh_state, 1500);
    };

    const toggle_auto_refresh = async () => {
        console.log(`Toggling auto-refresh state - current: ${state.running}`);
        if (state.running == true) {
            console.log('Toggling OFF auto-refresh');
            if (state.server_list_timer != null) {
                clearTimeout(state.server_list_timer);
            }
            setState((prevState) => ({ ...prevState, running: false }));
        } else {
            console.log('Toggling ON auto-refresh');
            setState((prevState) => ({
                ...prevState,
                refreshing: true,
                running: true,
            }));

            await update_server_list(true);
        }
    };

    const fetch_servers = async (page = 1) => {
        // Determine which pages to fetch from BattleMetrics
        let bmPage1 = Math.floor((page - 1) / 2) + 1; // Calculate the first BM page based on our current page
        let bmPage2 = bmPage1 + 1; // The next BM page is just the current one plus one

        // Fetch data from your own database
        const response = await fetch_recent_wipes_from_db(page, 25);
        const ourDBServers = response.recentServers;

        // Fetch the first set of data from BattleMetrics
        const [bmDBServersPage1, ,] = await fetch_battlemetrics_servers(
            state.country,
            state.max_distance,
            0,
            50, // We want 50 servers per BM page
            '', // Provide parameters for pagination
            '',
            true,
            bmPage1, // The page we calculated earlier
        );

        // Fetch the second set of data from BattleMetrics
        const [bmDBServersPage2, next_url, prev_url] = await fetch_battlemetrics_servers(
            state.country,
            state.max_distance,
            0,
            50, // We want 50 servers per BM page
            '', // Provide parameters for pagination
            '',
            true,
            bmPage2, // The page we calculated earlier
        );

        const bmDBServers = [...bmDBServersPage1, ...bmDBServersPage2];

        // console.log('BattleMetrics DB 50 Servers:', bmDBServers)

        // 3. Merge data from BM DB with our DB's 25 servers
        const updatedOurDBServers = ourDBServers.map((ourDBServer) => {
            const foundServer = bmDBServers.find((bmDBServer) => parseInt(bmDBServer.id) === parseInt(ourDBServer.id));
            // console.log('Our DB Server ID:', ourDBServer.id)
            // console.log('Found Server ID:', foundServer ? foundServer.id : 'none')
            // console.log('Found Server:', foundServer)

            if (foundServer) {
                return {
                    ...ourDBServer,
                    attributes: { ...foundServer.attributes }, // add the 'attributes' key dictionary from the BM data
                    offline: false,
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
                            rust_last_wipe: null,
                        },
                    },
                    offline: true,
                };
            }
        });

        console.log('Merged 25 Servers:', updatedOurDBServers);

        return [updatedOurDBServers, next_url, prev_url, 0];
    };

    const switch_page = async (forward) => {
        var switch_to_page = forward == true ? state.current_page + 1 : state.current_page - 1;
        const result = await fetch_servers(switch_to_page);
        console.log('Fetch servers result: ', result);

        const [new_server_list, next_url, prev_url, current_test_id] = result;

        setState((prevState) => ({
            ...prevState,
            server_list: new_server_list,
            next_url: next_url,
            prev_url: prev_url,
            current_test_id: current_test_id,
            current_page: switch_to_page,
        }));
    };

    const update_filter_value = async (filter, new_value) => {
        console.log(`Setting state on filter: ${filter} | Value: ${new_value}`);
        if (filter == 'max_distance') {
            setState(
                (prevState) => ({ ...prevState, max_distance: new_value }),
                async () => {
                    state.running == false ? await update_server_list(false) : null;
                },
            );
        } else if (filter == 'num_servers') {
            setState(
                (prevState) => ({ ...prevState, num_servers: new_value }),
                async () => {
                    state.running == false ? await update_server_list(false) : null;
                },
            );
        } else if (filter == 'min_players') {
            setState(
                (prevState) => ({ ...prevState, min_players: new_value }),
                async () => {
                    state.running == false ? await update_server_list(false) : null;
                },
            );
        } else if (filter == 'country') {
            setState(
                (prevState) => ({ ...prevState, country: new_value }),
                async () => {
                    state.running == false ? await update_server_list(false) : null;
                },
            );
        }
    };

    return (
        <div className="h-full w-full overflow-hidden bg-dark">
            <div className="relative flex h-full w-full flex-wrap">
                <RecentWipesSidebar state={state} toggle_auto_refresh={toggle_auto_refresh} update_filter_value={update_filter_value} />
                <RecentWipesTable state={state} update_filter_value={update_filter_value} switch_page={switch_page} />
            </div>
        </div>
    );
};

export default RecentConfirmedWipesPage;
