import type { Metadata } from 'next';
import { fetchPlayerStats, fetchServerInfo } from '@/app/actions';
import React from 'react';
import StatsViewer from './StatsViewer';
import PageLayout from '@/components/layout/PageLayout';
import { captureEvent, captureDistictId } from '@/utils/posthog';
import { DEFAULT_PARAMS } from './constants';

const PAGE_NAME = 'Player Stats';

export const metadata: Metadata = {
    title: `Rust Wipes - ${PAGE_NAME}`,
    description: 'View player statistics for Rust Wipes servers, including kills, farming, and gambling stats.',
    keywords:
        'rust, rustwipes, rust wipes, server wipes, signup, sign up, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Player Stats',
        description: 'Player Stats page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/stats',
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

interface PageProps {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}

export default async function StatsPage({ searchParams }: PageProps) {
    const distinctId = await captureDistictId();
    captureEvent(`${PAGE_NAME} page was loaded with ID: ${distinctId}`);

    const resolvedParams = await searchParams;
    const serverInfo = await fetchServerInfo();

    const initialParams = {
        category: String(resolvedParams.category ?? DEFAULT_PARAMS.category),
        server: String(resolvedParams.server ?? serverInfo[0]?.id ?? DEFAULT_PARAMS.server),
        period: String(resolvedParams.period ?? DEFAULT_PARAMS.period),
    };

    const playerStats = await fetchPlayerStats(initialParams.server, initialParams.period);

    return (
        <PageLayout page="/stats">
            <StatsViewer playerStats={playerStats} initialParams={initialParams} serverInfo={serverInfo} />
        </PageLayout>
    );
}

export const revalidate = 60;
