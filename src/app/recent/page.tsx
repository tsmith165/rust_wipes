import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import RecentConfirmedWipesPage from '@/app/recent/RecentConfirmedWipesPage';
import { captureEvent, captureDistictId } from '@/utils/posthog';
import { DEFAULT_PARAMS } from './constants';

const PAGE_NAME = 'Recent Wipes';

export const metadata: Metadata = {
    title: `Rust Wipes - ${PAGE_NAME}`,
    description:
        'Keep track of the servers that just wiped so you can find a fresh server to play on! We offer free auto-refresh, sound notifications, and filtering!',
    keywords:
        'rust wipes, rustwipes, recent rust wipes, recent wipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Recent Wipes',
        description: 'Recent Wipes page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/recent',
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

export default async function Page({ searchParams }: PageProps) {
    const distinctId = await captureDistictId();
    captureEvent(`${PAGE_NAME} page was loaded with ID: ${distinctId}`);

    // Wait for searchParams to resolve
    const resolvedParams = await searchParams;

    // Ensure we use the default values for any missing parameters
    const initialParams = {
        country: String(resolvedParams.country ?? DEFAULT_PARAMS.country),
        minPlayers: String(resolvedParams.minPlayers ?? DEFAULT_PARAMS.minPlayers),
        maxDist: String(resolvedParams.maxDist ?? DEFAULT_PARAMS.maxDist),
        minRank: String(resolvedParams.minRank ?? DEFAULT_PARAMS.minRank),
        maxRank: String(resolvedParams.maxRank ?? DEFAULT_PARAMS.maxRank),
        groupLimit: String(resolvedParams.groupLimit ?? DEFAULT_PARAMS.groupLimit),
        resourceRate: String(resolvedParams.resourceRate ?? DEFAULT_PARAMS.resourceRate),
        numServers: String(resolvedParams.numServers ?? DEFAULT_PARAMS.numServers),
        page: String(resolvedParams.page ?? DEFAULT_PARAMS.page),
    };

    return (
        <PageLayout page="recent">
            <RecentConfirmedWipesPage initialSearchParams={initialParams} />
        </PageLayout>
    );
}
