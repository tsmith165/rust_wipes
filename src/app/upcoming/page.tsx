import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchFilteredServers } from './actions';
import { DEFAULT_PARAMS } from './constants';
import PageLayout from '@/components/layout/PageLayout';
import UpcomingWipesPageLayout from './components/UpcomingWipesPageLayout';
import Loading from './loading';

const PAGE_NAME = 'Upcoming Wipes';

export const metadata: Metadata = {
    title: `Rust Wipes - ${PAGE_NAME}`,
    description: 'Keep track of the servers that will be wiping so you can plan ahead! We track both full wipes and BP wipes!',
    keywords:
        'rust wipes, rustwipes, upcoming rust wipes, upcoming wipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Upcoming Wipes',
        description: 'Upcoming Wipes page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/upcoming',
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

// Separate component for data fetching to use with Suspense
async function UpcomingWipesContainer() {
    // Fetch initial data based on default parameters
    const initialData = await fetchFilteredServers({
        region: DEFAULT_PARAMS.region,
        resource_rate: DEFAULT_PARAMS.resource_rate,
        group_limit: DEFAULT_PARAMS.group_limit,
        game_mode: DEFAULT_PARAMS.game_mode,
        min_rank: DEFAULT_PARAMS.min_rank,
        time_zone: DEFAULT_PARAMS.time_zone,
        date: DEFAULT_PARAMS.date,
    });

    return <UpcomingWipesPageLayout initialData={initialData} />;
}

export default function Page() {
    return (
        <PageLayout page="upcoming">
            <Suspense fallback={<Loading />}>
                <UpcomingWipesContainer />
            </Suspense>
        </PageLayout>
    );
}
