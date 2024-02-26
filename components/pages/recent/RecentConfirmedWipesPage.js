// Assuming 'use client' directive is specific to your setup or a future Next.js feature
'use client';

import React, { useState, useEffect } from 'react';

// Assuming these functions are correctly implemented to fetch data
import { fetch_recent_wipes_from_db, fetch_battlemetrics_servers } from '../../../lib/api_calls';

// Child components
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';

// Analytics hook
import { useAnalytics } from '@/lib/helpers/useAnalytics';

const RecentConfirmedWipesPage = () => {
    useAnalytics();

    const [state, setState] = useState({
        serverList: [],
        refreshing: true,
        currentPage: 1,
        nextUrl: null,
        prevUrl: null,
        maxDistance: 5000,
        numServers: 25,
        minPlayers: 2,
        country: 'US',
        currentTestId: 0,
    });

    const fetch_servers = async (page = 1) => {
        setState((prevState) => ({ ...prevState, refreshing: true }));

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
        const new_server_list = ourDBServers.map((ourDBServer) => {
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

        console.log('Merged 25 Servers:', new_server_list);

        setState((prevState) => ({
            ...prevState,
            server_list: new_server_list,
            next_url: next_url,
            prev_url: prev_url,
            current_test_id: 0,
            current_page: state.current_page,
            refreshing: false,
        }));
    };

    useEffect(() => {
        async function fetch_refresh_data() {
            await fetch_servers(state.current_page);

            const interval = setInterval(fetch_servers, 5000);

            return () => clearInterval(interval);
        }
        fetch_refresh_data();
    }, []);

    const update_filter_value = (filter, newValue) => {
        setState((prevState) => ({ ...prevState, [filter]: newValue }));
    };

    const switch_page = (forward) => {
        setState((prevState) => ({
            ...prevState,
            currentPage: prevState.currentPage + (forward ? 1 : -1),
            refreshing: true,
        }));
    };

    return (
        <div className="h-full w-full overflow-hidden bg-dark">
            <div className="relative flex h-full w-full flex-wrap">
                <RecentWipesSidebar
                    state={state}
                    update_filter_value={update_filter_value}
                    toggle_auto_refresh={() => setState((prevState) => ({ ...prevState, refreshing: !prevState.refreshing }))}
                />
                <RecentWipesTable state={state} update_filter_value={update_filter_value} switch_page={switch_page} />
            </div>
        </div>
    );
};

export default RecentConfirmedWipesPage;
