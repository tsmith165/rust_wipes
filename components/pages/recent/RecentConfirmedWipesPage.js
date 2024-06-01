// Import necessary libraries and dependencies
import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { db } from '@/db/db';
import { rw_parsed_server } from '@/db/schema';
import { eq, gte, desc } from 'drizzle-orm';

// Assuming these components are properly adapted for server components if necessary
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';

// Fetch data from BattleMetrics
async function fetchBattleMetricsServers(serverIds, pageSize) {
    const query_params_string = `filter[game]=rust&filter[status]=online&filter[ids][whitelist]=${serverIds.join(',')}&sort=-details.rust_last_wipe&page[size]=${pageSize}`;
    const url = `https://api.battlemetrics.com/servers?${query_params_string}`;
    try {
        const response = await axios.get(url);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching data from BattleMetrics:', error);
        return [];
    }
}

async function fetchRecentWipesFromDB(country, minPlayers, numServers, page) {
    page = parseInt(page) || 1;
    const itemsPerPage = parseInt(numServers, 10) || 25;
    const skip = (page - 1) * itemsPerPage;

    console.log(`Fetching recent wipes with region: ${country} | min players: ${minPlayers}`);
    try {
        const recentWipes = await db
            .select()
            .from(rw_parsed_server)
            .where(eq(rw_parsed_server.region, country), gte(rw_parsed_server.players, parseInt(minPlayers)))
            .orderBy(desc(rw_parsed_server.last_wipe))
            .offset(skip)
            .limit(itemsPerPage);

        return recentWipes;
    } catch (error) {
        console.error('Error fetching recent wipes from DB:', error);
        throw error; // Rethrow or handle as needed
    }
}

// Server component
export default async function RecentConfirmedWipesPage({ searchParams }) {
    const country = searchParams.country || 'US';
    const minPlayers = 0;
    const numServers = searchParams.numServers || 25;
    const page = searchParams.page || 1;

    // Directly fetch data within the server component
    const our_db_recent_wipes = await fetchRecentWipesFromDB(country, minPlayers, numServers, page);

    // Extract the server IDs from our DB results
    const serverIds = our_db_recent_wipes.map((server) => server.id);

    // Fetch the corresponding data from BattleMetrics API using the server IDs
    console.log('Fetching server data from BattleMetrics API: ', serverIds.join(','));
    const bm_api_recent_wipes = await fetchBattleMetricsServers(serverIds, numServers);

    // Merge data from BM API with our DB's data
    const new_server_list = our_db_recent_wipes.map((our_db_recent_wipe_data) => {
        const matched_server_data = bm_api_recent_wipes.find(
            (bm_api_recent_wipe_data) => parseInt(bm_api_recent_wipe_data.id) === parseInt(our_db_recent_wipe_data.id),
        );

        if (matched_server_data) {
            return {
                ...our_db_recent_wipe_data,
                attributes: { ...matched_server_data.attributes },
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
        <div className="h-full w-full overflow-hidden bg-secondary">
            <div className="flex h-full w-full flex-wrap">
                {/* Pass searchParams down to child components */}
                <RecentWipesSidebar searchParams={searchParams} />
                <RecentWipesTable searchParams={searchParams} server_list={new_server_list} />
            </div>
        </div>
    );
}

RecentConfirmedWipesPage.propTypes = {
    searchParams: PropTypes.object.isRequired,
};
