import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ServerInfoPage from '@/app/server/ServerInfoPage';

import { captureEvent, captureDistictId } from '@/utils/posthog';
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
    params?: {
        server_id?: string;
    };
    searchParams?: {
        [key: string]: string | string[];
    };
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
                rust_maps: any;
                rust_description: string;
            };
        };
    };
}

export default async function ServerPage({ params, searchParams }: ServerPageProps) {
    const distinctId = await captureDistictId();
    captureEvent(`${PAGE_NAME} page was loaded with ID: ${distinctId}`);

    const server_id = params?.server_id || '1';

    // Fetch data here
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
    const bm_api_server_data_response = await axios.get<BattleMetricsServerData>(bmApiUrl);
    const bm_api_server_data = bm_api_server_data_response.data.data;

    return (
        <PageLayout page={'server'}>
            <ServerInfoPage database_data={database_data} bm_api_server_data={bm_api_server_data} params={params} />
        </PageLayout>
    );
}
