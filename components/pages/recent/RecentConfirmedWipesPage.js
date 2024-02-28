// Import necessary libraries and dependencies
import React from 'react';
import axios from 'axios';
import { prisma } from '../../../lib/prisma'; // Adjust based on your actual path

// Assuming these components are properly adapted for server components if necessary
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';

// Helper function to fetch data from BattleMetrics
async function fetchBattleMetricsServers(country = 'US', maxDistance = 5000, minPlayers = 0, numServers = 50, starting_index = 0) {
    // manually create the query string
    var query_params_string = `filter[game]=rust&filter[status]=online&sort=-details.rust_last_wipe&filter[search]=*`;
    query_params_string += `&filter[countries][]=${country}`;
    query_params_string += `&filter[maxDistance]=${maxDistance}`;
    query_params_string += `&filter[players][min]=${minPlayers}`;
    query_params_string += `&page[size]=${numServers}`;
    query_params_string += `&page[offset]=${starting_index}`;

    const url = `https://api.battlemetrics.com/servers?${query_params_string}`;
    console.log('Querying BattleMetrics with URL: ' + url);

    try {
        const response = await axios.get(url);
        return response.data.data; // Adjust according to the API response structure
    } catch (error) {
        console.error('Error fetching data from BattleMetrics:', error);
        return [];
    }
}

async function fetchRecentWipesFromDB(country, minPlayers, numServers, page) {
    // Ensure `page` and `itemsPerPage` are integers
    page = parseInt(page) || 1;
    const itemsPerPage = parseInt(numServers, 10) || 25;

    // Calculate `skip` ensuring it's an integer
    const skip = (page - 1) * itemsPerPage;

    console.log(`Fetching recent wipes with region: ${country} | min players: ${minPlayers}`);

    try {
        const recentWipes = await prisma.server_parsed.findMany({
            where: {
                region: country,
                players: {
                    gte: parseInt(minPlayers),
                },
            },
            orderBy: {
                last_wipe: 'desc',
            },
            skip: skip,
            take: itemsPerPage,
        });
        return recentWipes;
    } catch (error) {
        console.error('Error fetching recent wipes from DB:', error);
        throw error; // Rethrow or handle as needed
    }
}

// Server component
export default async function RecentConfirmedWipesPage({ searchParams }) {
    // console.log('RecentConfirmedWipesPage Search Params: ', searchParams);

    const country = searchParams.country || 'US';
    const maxDistance = searchParams.maxDistance || 5000;
    const minPlayers = 0;
    const numServers = searchParams.numServers || 50;
    const page = searchParams.page || 1;

    // Directly fetch data within the server component
    const our_db_recent_wipes = await fetchRecentWipesFromDB(country, minPlayers, numServers, page);
    // console.log('Our DB Recent Wipes: ', our_db_recent_wipes);

    const bm_api_recent_wipes = await fetchBattleMetricsServers(country, maxDistance, minPlayers, 50, (parseInt(page) - 1) * numServers);
    const bm_api_recent_wipes_next = await fetchBattleMetricsServers(country, maxDistance, minPlayers, 50, parseInt(page) * numServers);

    // combine bm api data
    const all_bm_api_recent_wipes = bm_api_recent_wipes.concat(bm_api_recent_wipes_next);

    // 3. Merge data from BM DB with our DB's 25 servers
    const new_server_list = our_db_recent_wipes.map((our_db_recent_wipe_data) => {
        const matched_server_data = all_bm_api_recent_wipes.find(
            (bm_api_recent_wipe_data) => parseInt(bm_api_recent_wipe_data.id) === parseInt(our_db_recent_wipe_data.id),
        );
        // console.log('Our DB Server ID:', ourDBServer.id)
        // console.log('Found Server ID:', foundServer ? foundServer.id : 'none')
        // console.log('Found Server:', foundServer)

        if (matched_server_data) {
            return {
                ...our_db_recent_wipe_data,
                attributes: { ...matched_server_data.attributes }, // add the 'attributes' key dictionary from the BM data
                offline: false,
            };
        } else {
            return {
                ...our_db_recent_wipe_data,
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

    return (
        <div className="h-full w-full overflow-hidden bg-dark">
            <div className="flex h-full w-full flex-wrap">
                {/* Pass searchParams down to child components */}
                <RecentWipesSidebar searchParams={searchParams} />

                <RecentWipesTable searchParams={searchParams} server_list={new_server_list} />
            </div>
        </div>
    );
}
