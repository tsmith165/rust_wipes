import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import UpcomingWipesPage from '@/app/upcoming/UpcomingWipesPage';

import { captureEvent, captureDistictId } from '@/utils/posthog';

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

export default async function Page() {
    const distinctId = await captureDistictId();
    captureEvent(`${PAGE_NAME} page was loaded with ID: ${distinctId}`);

    return (
        <PageLayout page={'upcoming'}>
            <UpcomingWipesPage />
        </PageLayout>
    );
}
