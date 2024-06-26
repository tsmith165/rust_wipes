import React from 'react';
import axios from 'axios';
import { db } from '@/db/db';
import { rw_parsed_server } from '@/db/schema';
import { eq, gte, desc, and } from 'drizzle-orm';
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';

interface BattleMetricsServer {
    id: string;
    attributes: {
        ip: string | null;
        port: number | null;
        name: string | null;
        rank: number | null;
        details: {
            rust_last_wipe: string | null;
        };
        players: number | null;
        maxPlayers: number | null;
    };
}

async function fetchBattleMetricsServers(serverIds: number[], pageSize: number): Promise<BattleMetricsServer[]> {
    const query_params_string = `filter[game]=rust&filter[status]=online&filter[ids][whitelist]=${serverIds.join(
        ',',
    )}&sort=-details.rust_last_wipe&page[size]=${pageSize}`;
    const url = `https://api.battlemetrics.com/servers?${query_params_string}`;
    try {
        const response = await axios.get(url);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching data from BattleMetrics:', error);
        return [];
    }
}

async function fetchRecentWipesFromDB(country: string, minPlayers: number, numServers: number, page: number) {
    page = parseInt(page.toString()) || 1;
    const itemsPerPage = parseInt(numServers.toString(), 10) || 25;
    const skip = (page - 1) * itemsPerPage;

    console.log(`Fetching recent wipes with region: ${country} | min players: ${minPlayers}`);
    try {
        const recentWipes = await db
            .select()
            .from(rw_parsed_server)
            .where(and(eq(rw_parsed_server.region, country), gte(rw_parsed_server.players, minPlayers)))
            .orderBy(desc(rw_parsed_server.last_wipe))
            .offset(skip)
            .limit(itemsPerPage);

        return recentWipes;
    } catch (error) {
        console.error('Error fetching recent wipes from DB:', error);
        throw error;
    }
}

interface RecentConfirmedWipesPageProps {
    searchParams?: {
        [key: string]: string | string[] | undefined;
    };
}

export default async function RecentConfirmedWipesPage({ searchParams }: RecentConfirmedWipesPageProps) {
    const country = (searchParams?.country as string) || 'US';
    const minPlayers = 0;
    const numServers = parseInt((searchParams?.numServers as string) || '25');
    const page = parseInt((searchParams?.page as string) || '1');

    const our_db_recent_wipes = await fetchRecentWipesFromDB(country, minPlayers, numServers, page);

    const serverIds = our_db_recent_wipes.map((server) => server.id);

    console.log('Fetching server data from BattleMetrics API: ', serverIds.join(','));
    const bm_api_recent_wipes = await fetchBattleMetricsServers(serverIds, numServers);

    const new_server_list = our_db_recent_wipes.map((our_db_recent_wipe_data) => {
        const matched_server_data = bm_api_recent_wipes.find(
            (bm_api_recent_wipe_data) => parseInt(bm_api_recent_wipe_data.id) === our_db_recent_wipe_data.id,
        );

        if (matched_server_data) {
            return {
                ...our_db_recent_wipe_data,
                attributes: {
                    ...matched_server_data.attributes,
                    players: matched_server_data.attributes.players || null,
                    maxPlayers: matched_server_data.attributes.maxPlayers || null,
                },
                offline: false,
            };
        } else {
            return {
                ...our_db_recent_wipe_data,
                attributes: {
                    ip: our_db_recent_wipe_data.ip,
                    port: null,
                    name: our_db_recent_wipe_data.title,
                    rank: our_db_recent_wipe_data.rank,
                    players: our_db_recent_wipe_data.players,
                    maxPlayers: null,
                    details: {
                        rust_last_wipe: our_db_recent_wipe_data.last_wipe,
                    },
                },
                offline: true,
            };
        }
    });

    return (
        <div className="h-full w-full overflow-hidden bg-secondary">
            <div className="flex h-full w-full flex-wrap">
                <RecentWipesSidebar searchParams={searchParams} />
                <RecentWipesTable searchParams={searchParams} server_list={new_server_list} />
            </div>
        </div>
    );
}
