import { Metadata } from 'next';
import React from 'react';
import { Suspense } from 'react';
import Loading from './loading';
import PageLayout from '@/components/layout/PageLayout';
import UpcomingWipesPage from '@/app/upcoming/UpcomingWipesPage';
import { captureEvent, captureDistictId } from '@/utils/posthog';
import { regionParser, resourceRateParser, groupLimitParser, gameModeParser, minRankParser, timeZoneParser, dateParser } from './parsers';
import { fetchFilteredServers } from '@/app/upcoming/actions';

const PAGE_NAME = 'Upcoming Wipes';

export const metadata: Metadata = {
    title: `Rust Wipes - ${PAGE_NAME}`,
    description: 'See what wipes are coming up soon so you can plan your day!',
    keywords:
        'rust, Rust Wipes, Upcoming Wipes, Rust Upcomig Wipes, rust upcoming wipes, rust wipes soon, soon, rust soon, rustwipes, rust wipes, server wipes, signup, sign up, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
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

interface PageProps {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}

export default async function Page({ searchParams }: PageProps) {
    const distinctId = await captureDistictId();
    captureEvent(`${PAGE_NAME} page was loaded with ID: ${distinctId}`);

    // Await searchParams first
    const resolvedSearchParams = await searchParams;

    // Parse all search parameters server-side using nuqs parsers
    const parsedParams = {
        region: regionParser.parseServerSide(resolvedSearchParams.region),
        resource_rate: resourceRateParser.parseServerSide(resolvedSearchParams.resource_rate),
        group_limit: groupLimitParser.parseServerSide(resolvedSearchParams.group_limit),
        game_mode: gameModeParser.parseServerSide(resolvedSearchParams.game_mode),
        min_rank: minRankParser.parseServerSide(resolvedSearchParams.min_rank),
        time_zone: timeZoneParser.parseServerSide(resolvedSearchParams.time_zone),
        date: dateParser.parseServerSide(resolvedSearchParams.date),
    };

    // Pre-fetch initial data
    const preloadServers = await fetchFilteredServers(parsedParams);

    return (
        <PageLayout page={'upcoming'}>
            <Suspense fallback={<Loading />}>
                <UpcomingWipesPage initialData={preloadServers} />
            </Suspense>
        </PageLayout>
    );
}
