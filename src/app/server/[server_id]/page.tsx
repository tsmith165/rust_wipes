import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ServerInfoPage from '@/app/server/ServerInfoPage';

import { captureEvent, getServerDistinctId } from '@/utils/posthog';
import axios from 'axios';
import { db } from '@/db/db';
import { rw_parsed_server } from '@/db/schema';
import { eq } from 'drizzle-orm';

const PAGE_NAME = 'Our Servers';

export const metadata: Metadata = {
    title: `Rust Wipes - ${PAGE_NAME}`,
    description: 'Detailed information about the specific Rust server',
    keywords:
        'rust wipes, rustwipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes - Server Details',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Server Details',
        description: 'Server Details page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/server',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Rust Wipes',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

interface ServerPageProps {
    params?: Promise<{
        server_id?: string;
    }>;
    searchParams?: Promise<{
        [key: string]: string | string[];
    }>;
}

interface BattleMetricsServerData {
    data: {
        attributes: {
            players: number;
            maxPlayers: number;
            name: string;
            ip: string;
            port: number;
            details?: {
                rust_maps: {
                    thumbnailUrl?: string;
                    [key: string]: unknown;
                };
                rust_description: string;
            };
        };
    };
}

interface BattleMetricsPlayerHistory {
    data: Array<{
        attributes: {
            timestamp: string;
            value: number;
        };
    }>;
}

export default async function ServerPage(props: ServerPageProps) {
    const params = await props.params;
    const distinctId = await getServerDistinctId();
    captureEvent(`${PAGE_NAME} page was loaded with ID: ${distinctId}`);

    const server_id = params?.server_id || '1';

    // Fetch server data
    const database_data = await db
        .select()
        .from(rw_parsed_server)
        .where(eq(rw_parsed_server.id, parseInt(server_id)))
        .limit(1);

    // Handle case when server is not found
    if (database_data.length === 0) {
        return (
            <PageLayout page={'server'}>
                <p className="text-xl text-red-500">Server not found.</p>
            </PageLayout>
        );
    }

    // Fetch BattleMetrics API data
    const bmApiUrl = `https://api.battlemetrics.com/servers/${server_id}`;

    // Calculate start and stop times for last 24 hours
    const stop = new Date().toISOString();
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const playerHistoryUrl = `https://api.battlemetrics.com/servers/${server_id}/player-count-history?start=${start}&stop=${stop}&resolution=30`;

    const [serverDataResponse, playerHistoryResponse] = await Promise.all([
        axios.get<BattleMetricsServerData>(bmApiUrl),
        axios.get<BattleMetricsPlayerHistory>(playerHistoryUrl),
    ]);

    const bm_api_server_data = serverDataResponse.data.data;
    const player_history = playerHistoryResponse.data.data.map((item) => ({
        timestamp: item.attributes.timestamp,
        players: item.attributes.value,
    }));

    console.log('player_history: ', player_history);

    return (
        <PageLayout page={'server'}>
            <ServerInfoPage
                database_data={database_data}
                bm_api_server_data={bm_api_server_data}
                player_history={player_history}
                params={params}
            />
        </PageLayout>
    );
}
