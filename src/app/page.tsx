import React from 'react';
import { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import HomePage from '@/app/HomePage';

import { captureEvent, captureDistictId } from '@/utils/posthog';

const PAGE_NAME = 'Homepage';

export const metadata: Metadata = {
    title: `Rust Wipes - ${PAGE_NAME}`,
    description:
        'Rust Wipes helps gamers find servers based on their wipe schedules. Discover recent wipes, upcoming wipes, and scrapper statistics.',
    keywords:
        'rust wipes, Rust Wipes, rustwipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Homepage',
        description: 'Homepage for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com',
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
        <PageLayout page={'home'}>
            <HomePage />
        </PageLayout>
    );
}
