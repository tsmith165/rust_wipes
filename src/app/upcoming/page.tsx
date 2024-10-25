import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import UpcomingWipesPage from '@/app/upcoming/UpcomingWipesPage';
import { captureEvent, captureDistictId } from '@/utils/posthog';
import { DEFAULT_PARAMS } from './constants';

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

    // Wait for searchParams to resolve
    const resolvedParams = await searchParams;

    // Ensure we use the default values for any missing parameters
    const initialParams = {
        region: String(resolvedParams.region ?? DEFAULT_PARAMS.region),
        resource_rate: String(resolvedParams.resource_rate ?? DEFAULT_PARAMS.resource_rate),
        group_limit: String(resolvedParams.group_limit ?? DEFAULT_PARAMS.group_limit),
        game_mode: String(resolvedParams.game_mode ?? DEFAULT_PARAMS.game_mode),
        min_rank: String(resolvedParams.min_rank ?? DEFAULT_PARAMS.min_rank),
        time_zone: String(resolvedParams.time_zone ?? DEFAULT_PARAMS.time_zone),
        date: String(resolvedParams.date ?? DEFAULT_PARAMS.date),
    };

    return (
        <PageLayout page={'upcoming'}>
            <UpcomingWipesPage initialSearchParams={initialParams} />
        </PageLayout>
    );
}
