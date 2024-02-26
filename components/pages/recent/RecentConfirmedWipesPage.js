// Import necessary libraries and dependencies
import React from 'react';
import axios from 'axios';
import { prisma } from '../../../lib/prisma'; // Adjust based on your actual path
import queryString from 'query-string'; // Ensure you have 'query-string' installed for constructing query strings

// Assuming these components are properly adapted for server components if necessary
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';

// Helper function to fetch data from BattleMetrics
async function fetchBattleMetricsServers(searchParams) {
    const country = searchParams.country || 'US';
    const maxDistance = searchParams.maxDistance || 5000;
    const minPlayers = searchParams.minPlayers || 2;
    const numServers = searchParams.numServers || 50;
    const page = searchParams.page || 1;

    const queryParams = {
        'filter[game]': 'rust',
        'filter[status]': 'online',
        'filter[countries][]': country,
        'filter[maxDistance]': maxDistance,
        'filter[players][min]': minPlayers,
        'page[size]': numServers,
        'page[number]': page,
    };

    const url = `https://api.battlemetrics.com/servers?${queryString.stringify(queryParams)}`;

    try {
        const response = await axios.get(url);
        return response.data.data; // Adjust according to the API response structure
    } catch (error) {
        console.error('Error fetching data from BattleMetrics:', error);
        return [];
    }
}

async function fetchRecentWipesFromDB(searchParams) {
    // Ensure `page` and `itemsPerPage` are integers
    const page = parseInt(searchParams.page, 10) || 1;
    const itemsPerPage = parseInt(searchParams.numServers, 10) || 25;

    // Calculate `skip` ensuring it's an integer
    const skip = (page - 1) * itemsPerPage;

    try {
        const recentWipes = await prisma.server_parsed.findMany({
            skip: skip,
            take: itemsPerPage,
            orderBy: {
                last_wipe: 'desc',
            },
        });
        return recentWipes;
    } catch (error) {
        console.error('Error fetching recent wipes from DB:', error);
        throw error; // Rethrow or handle as needed
    }
}

// Server component
export default async function RecentConfirmedWipesPage({ searchParams }) {
    // Directly fetch data within the server component
    const our_db_recent_wipes = await fetchRecentWipesFromDB(searchParams);
    const bm_api_recent_wipes = await fetchBattleMetricsServers(searchParams);

    // 3. Merge data from BM DB with our DB's 25 servers
    const new_server_list = our_db_recent_wipes.map((our_db_recent_wipe_data) => {
        const matched_server_data = bm_api_recent_wipes.find(
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
            <div className="relative flex h-full w-full flex-wrap">
                {/* Pass searchParams down to child components */}
                <RecentWipesSidebar searchParams={searchParams} />
                <RecentWipesTable searchParams={searchParams} server_list={new_server_list} />
            </div>
        </div>
    );
}
